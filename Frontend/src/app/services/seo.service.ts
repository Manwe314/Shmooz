// src/app/services/seo.service.ts
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private renderer: Renderer2;
  constructor(
    private meta: Meta,
    private title: Title,
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private doc: Document,
    @Optional() @Inject('ORIGIN_URL') private originFromSsr: string | null,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  private getOrigin(): string {
    if (this.originFromSsr) return this.originFromSsr;
    if (typeof window !== 'undefined' && window.location) return window.location.origin;
    return 'https://your-domain.example';
  }

  private setLink(tagName: string, rel: string, href: string) {
    const head = this.doc.head;
    let linkEl = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!linkEl) {
      linkEl = this.renderer.createElement('link');
      this.renderer.setAttribute(linkEl, 'rel', rel);
      this.renderer.appendChild(head, linkEl);
    }
    this.renderer.setAttribute(linkEl, 'href', href);
  }

  setTitleAndDescription(title: string, description: string) {
    this.title.setTitle(title);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }
  }

  setCanonical(pathOrAbsUrl: string) {
    const href = pathOrAbsUrl.startsWith('http')
      ? pathOrAbsUrl
      : this.getOrigin() + (pathOrAbsUrl.startsWith('/') ? pathOrAbsUrl : `/${pathOrAbsUrl}`);
    this.setLink('link', 'canonical', href);
  }

  setOpenGraph(opts: {
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    type?: string;
    siteName?: string;
  }) {
    if (opts.title) this.meta.updateTag({ property: 'og:title', content: opts.title });
    if (opts.description)
      this.meta.updateTag({ property: 'og:description', content: opts.description });
    if (opts.type) this.meta.updateTag({ property: 'og:type', content: opts.type });
    this.meta.updateTag({
      property: 'og:url',
      content: opts.url || this.getOrigin() + this.currentPath(),
    });
    if (opts.image) this.meta.updateTag({ property: 'og:image', content: opts.image });
    if (opts.siteName) this.meta.updateTag({ property: 'og:site_name', content: opts.siteName });
  }

  setTwitterCard(opts: {
    title?: string;
    description?: string;
    image?: string;
    site?: string;
    card?: 'summary' | 'summary_large_image';
  }) {
    this.meta.updateTag({ name: 'twitter:card', content: opts.card || 'summary_large_image' });
    if (opts.title) this.meta.updateTag({ name: 'twitter:title', content: opts.title });
    if (opts.description)
      this.meta.updateTag({ name: 'twitter:description', content: opts.description });
    if (opts.image) this.meta.updateTag({ name: 'twitter:image', content: opts.image });
    if (opts.site) this.meta.updateTag({ name: 'twitter:site', content: opts.site });
  }

  setJsonLd(schema: object) {
    const prev = this.doc.head.querySelector('script[type="application/ld+json"]');
    if (prev) prev.remove();
    const script = this.renderer.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.renderer.appendChild(this.doc.head, script);
  }

  currentPath(): string {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  }

  setForHome(opts: { title: string; description: string; image?: string }) {
    this.setTitleAndDescription(opts.title, opts.description);
    this.setCanonical('/');
    this.setOpenGraph({
      title: opts.title,
      description: opts.description,
      image: opts.image,
      type: 'website',
      siteName: opts.title,
    });
    this.setTwitterCard({
      title: opts.title,
      description: opts.description,
      image: opts.image,
      card: 'summary_large_image',
    });
  }

  setForPage(opts: { title: string; description: string; path: string; image?: string }) {
    this.setTitleAndDescription(opts.title, opts.description);
    this.setCanonical(opts.path);
    const url = this.getOrigin() + (opts.path.startsWith('/') ? opts.path : `/${opts.path}`);
    this.setOpenGraph({
      title: opts.title,
      description: opts.description,
      image: opts.image,
      type: 'article',
      url,
    });
    this.setTwitterCard({
      title: opts.title,
      description: opts.description,
      image: opts.image,
      card: 'summary_large_image',
    });
  }
}
