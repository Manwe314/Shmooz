import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BackgroundService, GradientColors, PageInfo } from '../services/background.service';
import { CommonModule } from '@angular/common';
import { error } from 'console';
import { SlugService } from '../services/slug.service';
import { filter, switchMap } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { TransitionService } from '../services/transition.service';
import { inject } from '@angular/core';
import { PlatformService } from '../services/platform.service';

@Component({
  selector: 'app-landing-background',
  imports: [CommonModule],
  templateUrl: './landing-background.component.html',
  styleUrl: './landing-background.component.css'
})
export class LandingBackgroundComponent implements OnInit{
  currentPage: 'home' | 'page1' | 'page2' = 'home';
  pageNames: PageInfo = {page1: 'page one', page2: 'page two'};
  otherPages: { path: 'home' | 'page1' | 'page2'; label: string }[] = [];
  navColor = "#fff"
  isBlocked = true;
  
  @ViewChild('firstBtn') firstBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('pageSwitcher') pageSwitcher!: ElementRef<HTMLElement>;
  @ViewChild('bgEl', { static: true }) bgEl!: ElementRef<HTMLDivElement>;
  
  constructor(
    private backgroundService: BackgroundService,
    private slugService: SlugService,
    private router: Router,
    private transitionService: TransitionService,
  ) {}
  
  private platform = inject(PlatformService);
  
  ngAfterViewInit() {
    if (!this.platform.isBrowser()) return;
    setTimeout(() => this.centerByGap(), 0);
    this.platform.windowRef.requestAnimationFrame(() => this.centerByGap());
  }
  
  gradient! : GradientColors;
  centerByGap() {
    if (!this.platform.isBrowser()) return;
    
    const first = this.firstBtn?.nativeElement;
    const switcher = this.pageSwitcher?.nativeElement;
    if (!first || !switcher) return;

    const firstWidth = this.firstBtn?.nativeElement?.offsetWidth ?? 0;
    const gap = 24;
    const offset = firstWidth + gap / 2;

    switcher.style.transform = `translateX(-${offset}px)`;
  }

  ngOnInit() {
    const current = this.slugService.getCurrentSlug() ?? 'shmooz';
    this.backgroundService.hydrateFromTransferState(current);
    this.gradient = this.backgroundService.getGradient() ?? {
      color1: "#D81B1E",
      color2: "#330321",
      color3: "#050319",
      position1: "11%",
      position2: "38%",
      position3: "80%",
    }

    const names = this.backgroundService.getPageNames();
    if (names)
      this.pageNames = names;
  
    const details = this.backgroundService.getPageDetail();
    if (details) 
      this.navColor = details.navColor;

    this.updateCurrentPageAndOthers();
    setTimeout(() => {
      this.isBlocked = false;
    }, 1100);

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => this.updateCurrentPageAndOthers());
  }

  private updateCurrentPageAndOthers(): void {
    const path = this.router.url.split('/')[1] || '';
    if (path === 'page_one' || path === 'project_page') this.currentPage = 'page1';
    else if (path === 'page_two') this.currentPage = 'page2';
    else this.currentPage = 'home';

    const map: Record<'home' | 'page1' | 'page2', string> = {
      home: 'Home',
      page1: this.pageNames.page1,
      page2: this.pageNames.page2
    };

    this.otherPages = (['home', 'page1', 'page2'] as const)
      .filter(p => p !== this.currentPage)
      .map(p => ({ path: p, label: map[p] }));

  }

  navigateTo(page: 'home' | 'page1' | 'page2') {
    this.isBlocked = true;
    const pathMap: Record<typeof page, string> = {
      home: '',
      page1: 'page_one',
      page2: 'page_two'
    };
    const slug = this.slugService.getCurrentSlug();
    const segments = [pathMap[page], slug].filter(Boolean);
    
    if (!this.platform.isBrowser()) {
      this.router.navigate(segments.length ? segments : ['']);
      return;
    }

    const el = this.bgEl?.nativeElement;
    if (el) {
      const clone = this.transitionService.cloneGradient(el);
      this.transitionService.blockNavigation();
      clone.classList.add('come-in');

      const raf = this.platform.windowRef.requestAnimationFrame.bind(this.platform.windowRef);
      raf(() => { raf(() => { clone.style.opacity = '1'; }); });
    }

    if (segments.length === 0){
      this.router.navigate(['']);
      return;
    }
    this.router.navigate(segments);
    
    setTimeout(() => {
      this.transitionService.unblockRoute();
    }, 1100);
  }

  brighten(color: string, factor = 0.2, alpha = 0.8): string {
    const rgb = this.parseRgb(color);
    if (!rgb) return `rgba(255,255,255,${alpha})`;
    const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * factor));
    const r = mix(rgb.r), g = mix(rgb.g), b = mix(rgb.b);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private parseRgb(input: string): { r: number; g: number; b: number } | null {
    if (!input) return null;
    if (input.startsWith('#')) {
      const h = input.slice(1);
      const hex = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
    const m = input.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/i);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    return null;
  }

}
