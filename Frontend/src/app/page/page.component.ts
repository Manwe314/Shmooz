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

    const fullscreenCard = document.querySelector('.hand-card-clone.fullscreen') as HTMLElement;
    const targetEl = document.querySelector('[data-tag="imageTarget"]') as HTMLElement;

    if (!fullscreenCard || !targetEl) {
      console.warn('[Morph] Required elements not found');
      return;
    }

    const container = document.getElementById('transition-overlay-container') || document.body;

    // Wait until target has non-zero height
    const waitForTargetDimensions = (attempts = 0) => {
      const targetRect = targetEl.getBoundingClientRect();
      if (targetRect.height > 0 || attempts > 10) {
        startMorphAnimation(targetRect);
      } else {
        requestAnimationFrame(() => waitForTargetDimensions(attempts + 1));
      }
    };

    const startMorphAnimation = (targetRect: DOMRect) => {
      const sourceRect = fullscreenCard.getBoundingClientRect();
      const computedTarget = getComputedStyle(targetEl);

      const morphClone = fullscreenCard.cloneNode(true) as HTMLElement;
      morphClone.classList.remove('fullscreen');
      morphClone.classList.add('morph-animate');

      Object.assign(morphClone.style, {
        position: 'fixed',
        top: `${sourceRect.top}px`,
        left: `${sourceRect.left}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        margin: '0',
        transform: 'translate(0, 0)',
        zIndex: '9999',
        pointerEvents: 'none',
        transition: 'none'
      });

      morphClone.style.setProperty('--target-top', `${targetRect.top}px`);
      morphClone.style.setProperty('--target-left', `${targetRect.left}px`);
      morphClone.style.setProperty('--target-width', `${targetRect.width}px`);
      morphClone.style.setProperty('--target-height', `${targetRect.height}px`);
      morphClone.style.setProperty('--target-radius', computedTarget.borderRadius);

      container.appendChild(morphClone);

      fullscreenCard.style.transition = 'none';
      fullscreenCard.style.opacity = '0';

      console.log('[Morph] Animation launched');
    };

    // Start the check
    requestAnimationFrame(() => waitForTargetDimensions());
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
