import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import compression from 'compression'; // types installed via @types/compression
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();


// ── Config via env ─────────────────────────────────────────────────────────────
const ADMIN_CACHE_KEY = process.env['ADMIN_CACHE_KEY'] || '';
const SSR_CACHE_MAX_ENTRIES = parseInt(process.env['SSR_CACHE_MAX_ENTRIES'] || '500', 10);
const SSR_CACHE_MAX_BYTES = parseInt(process.env['SSR_CACHE_MAX_BYTES'] || String(50 * 1024 * 1024), 10); // 50MB

// ── Simple LRU cache for HTML ─────────────────────────────────────────────────
class LRUCache {
  private map = new Map<string, { html: string; size: number }>();
  private totalBytes = 0;

  constructor(private maxEntries: number, private maxBytes: number) {}

  get(key: string) {
    const v = this.map.get(key);
    if (!v) return undefined;
    this.map.delete(key);
    this.map.set(key, v); // refresh recency
    return v;
  }

  set(key: string, html: string) {
    const size = Buffer.byteLength(html, 'utf8');
    if (this.map.has(key)) {
      const old = this.map.get(key)!;
      this.totalBytes -= old.size;
      this.map.delete(key);
    }
    this.map.set(key, { html, size });
    this.totalBytes += size;
    this.evict();
  }

  delete(key: string) {
    const v = this.map.get(key);
    if (!v) return false;
    this.totalBytes -= v.size;
    this.map.delete(key);
    return true;
  }

  clear() {
    this.map.clear();
    this.totalBytes = 0;
  }

  keys() { return Array.from(this.map.keys()); }

  stats() {
    return {
      entries: this.map.size,
      totalBytes: this.totalBytes,
      maxEntries: this.maxEntries,
      maxBytes: this.maxBytes,
    };
  }

  private evict() {
    while (this.map.size > this.maxEntries || this.totalBytes > this.maxBytes) {
      const firstKey = this.map.keys().next().value as string | undefined;
      if (!firstKey) break;
      const old = this.map.get(firstKey)!;
      this.map.delete(firstKey);
      this.totalBytes -= old.size;
    }
  }
}

const ssrCache = new LRUCache(SSR_CACHE_MAX_ENTRIES, SSR_CACHE_MAX_BYTES);

function getOrigin(req: import('express').Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = req.headers.host || 'localhost:4000';
  return `${proto}://${host}`;
}


// ── Helpers ───────────────────────────────────────────────────────────────────
function normPath(p: string) {
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

// Typed as RequestHandler → must return void (no value)
const requireAdminKey: express.RequestHandler = (req, res, next) => {
  if (!ADMIN_CACHE_KEY) {
    res.status(403).send('ADMIN_CACHE_KEY not set on server');
    return;
  }
  const key = req.header('x-admin-key');
  if (key !== ADMIN_CACHE_KEY) {
    res.status(401).send('Unauthorized');
    return;
  }
  next();
};

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json());

// ── Admin endpoints (optional but useful) ─────────────────────────────────────

// Warm (render + cache) specific paths
app.post('/__admin/ssr-cache/warm', requireAdminKey, async (req, res, next): Promise<void> => {
  try {
    const paths: string[] = Array.isArray(req.body?.paths) ? req.body.paths : [];
    if (!paths.length) {
      res.status(400).json({ error: 'Provide { "paths": ["/foo", "/bar"] }' });
      return;
    }

    const origin = getOrigin(req);
    const results: { path: string; bytes: number }[] = [];

    for (const p of paths) {
      const pathOnly = normPath(String(p));
      const url = `${origin}${pathOnly}`;

      const html = await commonEngine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: '/' },           // base href your app is served at
          { provide: 'ORIGIN_URL', useValue: origin },         // used by SeoService
        ],
      });

      // if ssrCache.get(key) -> cached.html, then store {html}
      ssrCache.set(pathOnly, html );
      results.push({ path: pathOnly, bytes: Buffer.byteLength(html, 'utf8') });
    }

    res.json({ warmed: results, stats: ssrCache.stats() });
  } catch (err) {
    next(err);
  }
});

// Purge one path or all
app.delete('/__admin/ssr-cache', requireAdminKey, (req, res): void => {
  const p = req.query['path'];
  if (typeof p === 'string' && p.length) {
    const ok = ssrCache.delete(normPath(p));
    res.json({ deleted: ok, path: normPath(p), stats: ssrCache.stats() });
    return;
  }
  ssrCache.clear();
  res.json({ cleared: true, stats: ssrCache.stats() });
});

// Inspect cache
app.get('/__admin/ssr-cache', requireAdminKey, (_req, res): void => {
  res.json({ ...ssrCache.stats(), keys: ssrCache.keys() });
});

// ── Static files from /browser ────────────────────────────────────────────────
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
    setHeaders(res, filePath) {
      if (/\.[a-f0-9]{8,}\./.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }),
);

// ── SSR with cache ────────────────────────────────────────────────────────────
app.get('**', async (req, res, next): Promise<void> => {
  try {
    const origin = getOrigin(req);
    const key = normPath(req.originalUrl);     // include query; normalized

    const cached = ssrCache.get(key);
    if (cached?.html) {
      res.set('X-SSR-Cache', 'HIT');
      res.send(cached.html);
      return;
    }

    const html = await commonEngine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${origin}${req.originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },            // or req.baseUrl if you mount under a subpath
        { provide: 'ORIGIN_URL', useValue: origin },
      ],
    });

    ssrCache.set(key, html);
    res.set('X-SSR-Cache', 'MISS');
    res.send(html);
  } catch (err) {
    next(err);
  }
});

// ── Boot ──────────────────────────────────────────────────────────────────────
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
