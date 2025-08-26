import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { GridOverlayComponent } from './grid-overlay.component';
import { Block } from './page-api.service';

@Component({
  selector: 'app-page-preview',
  standalone: true,
  imports: [CommonModule, GridOverlayComponent],
  templateUrl: './page-preview.component.html',
  styleUrl: './page-preview.component.css',
})
export class PagePreviewComponent {
  @Input() blocks: Block[] = [];
  @Input() showGrid = false;

  getTextStyles(content: any) {
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    };
    const alignMap: Record<string, string> = {
      top: 'flex-start',
      center: 'center',
      bottom: 'flex-end',
    };
    const hAlign = content.horizontalAlign ?? 'left';
    const vAlign = content.verticalAlign ?? 'top';
    return {
      'grid-column': `${content.colStart} / span ${content.colSpan || 1}`,
      'grid-row': `${content.rowStart} / span ${content.rowSpan || 1}`,
      color: content.color || 'inherit',
      display: 'flex',
      'justify-content': justifyMap[hAlign],
      'align-items': alignMap[vAlign],
      'text-align': content.textAlign || 'center',
      margin: content.margin || '0',
      padding: content.padding || '0',
      'font-size': content.fontSize || 'inherit',
      'font-weight': content.fontWeight || 'inherit',
      'font-family': content.fontFamily || 'inherit',
    };
  }

  getLinkStyles(content: any) {
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    };
    const alignMap: Record<string, string> = {
      top: 'flex-start',
      center: 'center',
      bottom: 'flex-end',
    };
    const hAlign = content.horizontalAlign ?? 'left';
    const vAlign = content.verticalAlign ?? 'top';
    return {
      'grid-column': `${content.colStart} / span ${content.colSpan || 1}`,
      'grid-row': `${content.rowStart} / span ${content.rowSpan || 1}`,
      display: 'flex',
      'justify-content': justifyMap[hAlign],
      'align-items': alignMap[vAlign],
      gap: '8px',
      'text-decoration': 'none',
      color: content.color || 'inherit',
      margin: content.margin || '0',
      padding: content.padding || '0',
      'font-size': content.fontSize || 'inherit',
      'font-weight': content.fontWeight || 'inherit',
      'font-family': content.fontFamily || 'inherit',
    };
  }
}
