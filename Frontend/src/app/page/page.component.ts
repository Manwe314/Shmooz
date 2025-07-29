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
    const borderTarget = document.querySelector('[data-tag="borderTarget"]') as HTMLElement;

    if (!fullscreenCard || !targetEl || !borderTarget) {
      console.warn('[Morph] Required elements not found');
      fullscreenCard.style.transition = 'opacity 0.8s ease';
      fullscreenCard.style.opacity = '0';
      setTimeout(() => {
        this.transitionService.cleanup();
      }, 800);
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
        console.log('waiting for dimensions');
      }
    };

    const startMorphAnimation = (targetRect: DOMRect) => {
      const sourceRect = fullscreenCard.getBoundingClientRect();
      const computedTarget = getComputedStyle(targetEl);
      const pageContent = this.elRef.nativeElement.querySelector('.page-content') as HTMLElement;

      const borderClone = fullscreenCard.cloneNode(true) as HTMLElement;
      borderClone.classList.remove('fullscreen');
      borderClone.classList.add('morph-animate-border');

      if (borderClone) {
        borderClone.addEventListener('animationend', () => {
          borderClone.classList.add('fade-out-opacity');
          setTimeout(() => {
            borderClone.remove();
          }, 1000);
        }, {once: true});
      }

      Object.assign(borderClone.style, {
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
    
      const borderTargetRect = borderTarget.getBoundingClientRect();
      const computedBorder = getComputedStyle(borderTarget);
    
      borderClone.style.setProperty('--target-top', `${borderTargetRect.top - 4}px`);
      borderClone.style.setProperty('--target-left', `${borderTargetRect.left - 4}px`);
      borderClone.style.setProperty('--target-width', `${borderTargetRect.width + 8}px`);
      borderClone.style.setProperty('--target-height', `${borderTargetRect.height + 8}px`);
      borderClone.style.setProperty('--target-radius', computedBorder.borderRadius || '0px');
    
      // Remove card background (fade out)
      const bgToHide = borderClone.querySelector('.card-bg') as HTMLElement;
      const textToHide = borderClone.querySelector('.card-text') as HTMLElement;
      const labelToHide = borderClone.querySelector('.label-circle') as HTMLElement;
      if (bgToHide && textToHide && labelToHide) {
        textToHide.style.opacity = '0';
        bgToHide.style.opacity = '0';
        labelToHide.style.opacity = '0';
      }
    
      container.appendChild(borderClone);

      const morphClone = fullscreenCard.cloneNode(true) as HTMLElement;
      morphClone.classList.remove('fullscreen');
      morphClone.classList.add('morph-animate');
      
      if (morphClone) {
        morphClone.addEventListener('animationend', () => {
          morphClone.classList.add('fade-out-opacity');
          pageContent.classList.add('visible');
          setTimeout(() => {
            morphClone.remove();
          }, 1000);
        }, {once: true});
      }

      Object.assign(morphClone.style, {
        position: 'fixed',
        top: `${sourceRect.top}px`,
        left: `${sourceRect.left}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        margin: '0',
        transform: 'translate(0, 0)',
        zIndex: '9998',
        pointerEvents: 'none',
        transition: 'none'
      });
      
      morphClone.style.setProperty('--target-top', `${targetRect.top}px`);
      morphClone.style.setProperty('--target-left', `${targetRect.left}px`);
      morphClone.style.setProperty('--target-width', `${targetRect.width}px`);
      morphClone.style.setProperty('--target-height', `${targetRect.height}px`);
      morphClone.style.setProperty('--target-radius', computedTarget.borderRadius);
      
      const borderEl = morphClone.querySelector('.inset-border') as HTMLElement;
      if (borderEl) {
        borderEl.style.opacity = '0';
      }

      container.appendChild(morphClone);

      fullscreenCard.style.transition = 'none';
      fullscreenCard.style.opacity = '0';
      this.transitionService.cleanup();

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
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end'
    };

    const alignMap: Record<string, string> = {
      top: 'flex-start',
      center: 'center',
      bottom: 'flex-end'
    };

    const hAlign = content.horizontalAlign ?? 'left';
    const vAlign = content.verticalAlign ?? 'top';

    return {
      'grid-column': `${content.colStart} / span ${content.colSpan || 1}`,
      'grid-row': `${content.rowStart} / span ${content.rowSpan || 1}`,
      'color': content.color || 'inherit',
      'display': 'flex',
      'justify-content': justifyMap[hAlign],
      'align-items': alignMap[vAlign],
      'text-align': content.textAlign ?? 'center' 
    };
  }
}
