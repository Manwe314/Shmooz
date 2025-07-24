import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { SlugService } from '../services/slug.service';
import { LandingBackgroundComponent } from '../landing-background/landing-background.component';
import { ApiService } from '../services/api.service';
import { Block, PageService } from '../services/page.service';
import { AfterViewInit, ElementRef } from '@angular/core';
import { TransitionService } from '../services/transition.service';

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
    private elRef: ElementRef, 
    private transitionService: TransitionService,
  ) {}

  ngAfterViewInit(): void {
    console.log('[PageComponent] ngAfterViewInit called');
    setTimeout(() => {
      const imageEl = document.querySelector('[data-tag="imageTarget"]') as HTMLElement | null;
      const borderEl = document.querySelector('[data-tag="borderTarget"]') as HTMLElement | null;

      const clones: HTMLElement[] = [];

      if (imageEl) {
        const imageClone = this.transitionService.createFullscreenClone(imageEl, 'image-clone');
        document.body.appendChild(imageClone);
        clones.push(imageClone);
      }

      if (borderEl) {
        const borderClone = this.transitionService.createFullscreenClone(borderEl, 'border-clone');
        document.body.appendChild(borderClone);
        clones.push(borderClone);
      }

      // Fade in those elements
      requestAnimationFrame(() => {
        clones.forEach(clone => clone.classList.add('visible'));

        // Morph to layout position
        setTimeout(() => {
          clones.forEach(clone => {
            const targetEl = document.querySelector(`[data-tag="${clone.classList.contains('image-clone') ? 'imageTarget' : 'borderTarget'}"]`) as HTMLElement;
            if (targetEl) {
              this.transitionService.morphCloneToTarget(clone, targetEl);
            }
          });

          // Final cleanup after morph
          setTimeout(() => {
            this.transitionService.cleanup();
            this.transitionService.unblockRoute(); // ✅ Allow Angular to finish route switch
          }, 900); // Match duration of morph animation
        }, 400); // Delay between fade-in and morph
      });
    });
  }

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
