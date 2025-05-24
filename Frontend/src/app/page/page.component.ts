import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { SlugService } from '../services/slug.service';
import { LandingBackgroundComponent } from '../landing-background/landing-background.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-page',
  imports: [CommonModule, LandingBackgroundComponent],
  templateUrl: './page.component.html',
  styleUrl: './page.component.css'
})
export class PageComponent {
  content: string = 'Loading...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private slugService: SlugService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.route.url
      .pipe(
      switchMap((urlSegments: UrlSegment[]) => {
        const path = urlSegments[0]?.path;
        const slug = this.route.snapshot.paramMap.get('slug') ?? 'COMPANY';
        const id = this.route.snapshot.paramMap.get('id');
        

        let apiUrl = '';
        if (path === 'page_one' && slug) {
          this.slugService.setSlug(slug);
          apiUrl = this.api.buildUrl(`page1/${slug}`);
        } else if (path === 'page_two' && slug) {
          this.slugService.setSlug(slug);
          apiUrl = this.api.buildUrl(`page2/${slug}`);
        } else if (path === 'project_page' && id) {
          apiUrl = this.api.buildUrl(`project_page/${id}`);
        } else {
          return this.http.get(this.api.buildUrl('project_name/'), { responseType: 'text' });
        }
        return this.http.get(apiUrl, { responseType: 'text' });
      })
    )
    .subscribe({
      next: (data: string) => {
        this.content = data;
      },
      error: () => {
        this.content = 'Failed to load page content.';
      }
    });
  }

}
