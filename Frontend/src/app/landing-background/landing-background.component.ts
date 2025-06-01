import { Component, OnInit } from '@angular/core';
import { BackgroundService, GradientColors, PageInfo } from '../services/background.service';
import { CommonModule } from '@angular/common';
import { error } from 'console';
import { SlugService } from '../services/slug.service';
import { filter, switchMap } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-landing-background',
  imports: [CommonModule],
  templateUrl: './landing-background.component.html',
  styleUrl: './landing-background.component.css'
})
export class LandingBackgroundComponent implements OnInit{
  gradientStyle = '';
  currentPage: 'home' | 'page1' | 'page2' = 'home';
  pageNames: PageInfo = {page1: 'page one', page2: 'page two'};
  otherPages: { path: 'home' | 'page1' | 'page2'; label: string }[] = [];

  constructor(
    private backgroundService: BackgroundService,
    private slugService: SlugService,
    private router: Router,
  ) {}

  ngOnInit() {
    const gradient = this.backgroundService.getGradient();
    if (gradient)
      this.gradientStyle = `radial-gradient(circle at 50% 130%, ${gradient.color1} ${gradient.position1}, ${gradient.color2} ${gradient.position2}, ${gradient.color3} ${gradient.position3})`;
    const names = this.backgroundService.getPageNames();
    if (names)
      this.pageNames = names;

    this.updateCurrentPageAndOthers();

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
    const pathMap: Record<typeof page, string> = {
      home: '',
      page1: 'page_one',
      page2: 'page_two'
    };

    const slug = this.slugService.getCurrentSlug();
    const segments = [pathMap[page], slug].filter(Boolean);
    if (segments.length === 0){
      this.router.navigate(['']);
      return;
    }

    this.router.navigate(segments);
  }
}
