import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';

import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

const ADMIN_CACHE_KEY = process.env['ADMIN_CACHE_KEY'] || '';
const SSR_CACHE_MAX_ENTRIES = parseInt(process.env['SSR_CACHE_MAX_ENTRIES'] || '500', 10);
const SSR_CACHE_MAX_BYTES = parseInt(
  process.env['SSR_CACHE_MAX_BYTES'] || String(50 * 1024 * 1024),
  10,
);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do {
    bytes = bytes / 1024;
    i++;
  } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function logCacheStats(tag: string) {
  const s = ssrCache.stats();
  console.log(
    `[SSR cache] ${tag} :: entries=${s.entries}, total=${s.totalBytes}B (${formatBytes(s.totalBytes)}),` +
      ` limits: entries<=${s.maxEntries}, bytes<=${formatBytes(s.maxBytes)}`,
  );
}

function deleteKeys(keys: string[]): string[] {
  const gone: string[] = [];
  for (const k of keys) {
    if (ssrCache.delete(k)) gone.push(k);
  }
  return gone;
}

function includesSlugQuery(key: string, slug: string): boolean {
  const enc = encodeURIComponent(slug);
  return key.includes(`?slug=${enc}`) || key.includes(`&slug=${enc}`);
}

class LRUCache {
  private map = new Map<string, { html: string; size: number }>();
  private totalBytes = 0;

  constructor(
    private maxEntries: number,
    private maxBytes: number,
  ) {}

  get(key: string) {
    const v = this.map.get(key);
    if (!v) return undefined;
    this.map.delete(key);
    this.map.set(key, v);
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

  keys() {
    return Array.from(this.map.keys());
  }

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

function normPath(p: string) {
  if (!p) return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

const requireAdminKey: express.RequestHandler = (req, res, next) => {
  const key = req.header('x-admin-key');
  const serverHasKey = Boolean(ADMIN_CACHE_KEY);
  const gotHeader = typeof key === 'string' && key.length > 0;
  if (!serverHasKey) {
    console.warn('[SSR-ADMIN] No ADMIN_CACHE_KEY on server');
    res.status(403).send('ADMIN_CACHE_KEY not set on server');
    return;
  }
  if (!gotHeader) {
    console.warn('[SSR-ADMIN] Missing x-admin-key header');
    res.status(401).send('Unauthorized');
    return;
  }
  if (key !== ADMIN_CACHE_KEY) {
    console.warn('[SSR-ADMIN] x-admin-key mismatch');
    res.status(401).send('Unauthorized');
    return;
  }
  if (!ADMIN_CACHE_KEY) {
    res.status(403).send('ADMIN_CACHE_KEY not set on server');
    return;
  }
  // const key = req.header('x-admin-key');
  if (key !== ADMIN_CACHE_KEY) {
    res.status(401).send('Unauthorized');
    return;
  }
  next();
};

app.use(compression());
app.use(express.json());

app.post('/__admin/ssr-cache/invalidate', requireAdminKey, (req, res): void => {
  const { kind, slug, category, id } = req.body || {};

  const badReq = (msg: string): void => {
    res.status(400).json({ error: msg });
  };

  type Kind = 'deck' | 'page' | 'project_page' | 'background';
  const k = String(kind) as Kind;

  if (!k) return badReq('Provide { kind }');

  if (k === 'deck' || k === 'background') {
    if (!slug) return badReq('Provide { slug } for kind=deck/background');
  }

  if (k === 'page') {
    if (!slug || !category) return badReq('Provide { slug, category } for kind=page');
    if (category !== 'page_one' && category !== 'page_two') {
      return badReq('category must be "page_one" or "page_two"');
    }
  }

  if (k === 'project_page') {
    const isNumLike = typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id));
    if (!isNumLike) return badReq('Provide numeric { id } for kind=project_page');
  }

  let toDelete: string[] = [];

  if (k === 'deck') {
    // Decks render on /:slug
    toDelete = [`/${slug}`];
  }

  if (k === 'page') {
    toDelete = [`/${category}/${slug}`, `/${category}?slug=${encodeURIComponent(slug)}`];
  }

  if (k === 'project_page') {
    const base = `/project_page/${id}`;
    if (slug) {
      toDelete = [base, `${base}?slug=${encodeURIComponent(slug)}`];
    } else {
      toDelete = [base];
    }
  }

  if (k === 'background') {
    const keys = ssrCache.keys();
    toDelete = keys.filter(
      (key) =>
        key === `/${slug}` ||
        key.startsWith(`/page_one/${slug}`) ||
        key.startsWith(`/page_two/${slug}`) ||
        includesSlugQuery(key, slug!),
    );

    toDelete.push(
      `/page_one/${slug}`,
      `/page_two/${slug}`,
      `/page_one?slug=${encodeURIComponent(slug!)}`,
      `/page_two?slug=${encodeURIComponent(slug!)}`,
    );

    toDelete = Array.from(new Set(toDelete));
  }

  const deleted = deleteKeys(toDelete);
  const stats = ssrCache.stats();
  logCacheStats(`invalidate ${k} ${slug ?? id ?? ''}`);

  res.json({
    ok: true,
    kind: k,
    slug: slug ?? null,
    category: category ?? null,
    id: id ?? null,
    deleted,
    stats,
  });
});

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
          { provide: APP_BASE_HREF, useValue: '/' },
          { provide: 'ORIGIN_URL', useValue: origin },
        ],
      });

      ssrCache.set(pathOnly, html);
      results.push({ path: pathOnly, bytes: Buffer.byteLength(html, 'utf8') });
    }

    res.json({ warmed: results, stats: ssrCache.stats() });
  } catch (err) {
    next(err);
  }
});

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

app.get('/__admin/ssr-cache', requireAdminKey, (_req, res): void => {
  res.json({ ...ssrCache.stats(), keys: ssrCache.keys() });
});

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

app.get('**', async (req, res, next): Promise<void> => {
  try {
    const origin = getOrigin(req);
    const key = normPath(req.originalUrl);

    const cached = ssrCache.get(key);
    if (cached?.html) {
      res.set('X-SSR-Cache', 'HIT');
      logCacheStats(`HIT ${key}`);
      res.send(cached.html);
      return;
    }

    const html = await commonEngine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${origin}${req.originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: 'ORIGIN_URL', useValue: origin },
      ],
    });

    ssrCache.set(key, html);
    res.set('X-SSR-Cache', 'MISS');
    logCacheStats(`MISS ${key}`);
    res.send(html);
  } catch (err) {
    next(err);
  }
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
