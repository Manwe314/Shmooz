import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { SlugService } from '../services/slug.service';
import { LandingBackgroundComponent } from '../landing-background/landing-background.component';
import { ApiService } from '../services/api.service';
import { PageService } from '../services/page.service';

@Component({
  selector: 'app-page',
  imports: [CommonModule, LandingBackgroundComponent],
  templateUrl: './page.component.html',
  styleUrl: './page.component.css'
})
export class PageComponent {
  content = '';

  constructor(
    private pageService: PageService,
  ) {}

  ngOnInit(): void {
    this.content = this.pageService.getContent().message;
  }
    

}
