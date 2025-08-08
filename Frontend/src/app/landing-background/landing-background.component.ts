import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BackgroundService, GradientColors, PageInfo } from '../services/background.service';
import { CommonModule } from '@angular/common';
import { error } from 'console';
import { SlugService } from '../services/slug.service';
import { filter, switchMap } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { TransitionService } from '../services/transition.service';

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

  ngAfterViewInit() {
    setTimeout(() => this.centerByGap(), 0);
  }

  centerByGap() {
    const firstWidth = this.firstBtn?.nativeElement?.offsetWidth ?? 0;
    const gap = 24;
    const offset = firstWidth + gap / 2;

    this.pageSwitcher.nativeElement.style.transform = `translateX(-${offset}px)`;
  }

  ngOnInit() {
    const gradient = this.backgroundService.getGradient();
    if (gradient) {
      const el = this.bgEl.nativeElement;
      el.style.setProperty('--c1', gradient.color1);
      el.style.setProperty('--c2', gradient.color2);
      el.style.setProperty('--c3', gradient.color3);
      el.style.setProperty('--p1', gradient.position1);
      el.style.setProperty('--p2', gradient.position2);
      el.style.setProperty('--p3', gradient.position3);
      el.style.setProperty('--y', '130%');
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

    const el = this.bgEl.nativeElement;
    const clone = this.transitionService.cloneGradient(el);
    this.transitionService.blockNavigation();
    clone.classList.add('come-in');
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.opacity = '1';
      });
    });
    if (segments.length === 0){
      this.router.navigate(['']);
      return;
    }
    this.router.navigate(segments);
    
    setTimeout(() => {
      this.transitionService.unblockRoute();
    }, 1100);
  }
}
