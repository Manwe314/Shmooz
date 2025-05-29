import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { SlugService } from '../services/slug.service';
import { LandingBackgroundComponent } from '../landing-background/landing-background.component';
import { ApiService } from '../services/api.service';
import { Block, PageService } from '../services/page.service';

@Component({
  selector: 'app-page',
  imports: [CommonModule, LandingBackgroundComponent],
  templateUrl: './page.component.html',
  styleUrl: './page.component.css'
})
export class PageComponent {
  blocks: Block[] = [];
  constructor(
    private pageService: PageService,
  ) {}

  ngOnInit(): void {
    const data = this.pageService.getContent();
    this.blocks = data.content || [];
  }

  trackByBlock(index : number, block: Block){
    return block.id;
  }

  getTextStyles(content: any) {
    return {
      'grid-column': `${content.colStart} / span ${content.colSpan || 1}`,
      'grid-row': `${content.rowStart} / span ${content.rowSpan || 1}`,
      'color': content.color || 'inherit',
      'text-align': content.textAlign || 'left'
    };
  }
  
    

}
