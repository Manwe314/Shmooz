import {
  AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges,
  OnDestroy, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grid-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" [class.hidden]="!show">
      <div class="line v" *ngFor="let x of vLines" [style.left.px]="x"></div>
      <div class="line h" *ngFor="let y of hLines" [style.top.px]="y"></div>
    </div>
  `,
  styles: [`
    :host { position: absolute; inset: 0; pointer-events: none; z-index: 2; }
    .overlay { position: absolute; inset: 0; }
    .overlay.hidden { display: none; }
    .line { position: absolute; background: rgba(255, 0, 0, 0.5); }
    .line.v { top: 0; bottom: 0; width: 2px; }
    .line.h { left: 0; right: 0; height: 2px; }
  `]
})
export class GridOverlayComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** Grid container element to measure (the DIV that has display:grid). */
  @Input({ required: true }) target!: HTMLElement;
  /** Toggle visibility */
  @Input() show = false;

  vLines: number[] = [];
  hLines: number[] = [];

  private ro?: ResizeObserver;
  private scheduled = false;

  constructor(private zone: NgZone, private host: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    if (!this.target) return;
    if (typeof ResizeObserver !== 'undefined') {
      this.zone.runOutsideAngular(() => {
        this.ro = new ResizeObserver(() => this.scheduleMeasure());
        this.ro.observe(this.target);
        window.addEventListener('resize', this.onWinResize, { passive: true });
      });
    }
    this.measure();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['target'] || changes['show']) this.measure();
  }

  ngOnDestroy() {
    if (this.ro) this.ro.disconnect();
    window.removeEventListener('resize', this.onWinResize);
  }

  private onWinResize = () => this.scheduleMeasure();

  private scheduleMeasure() {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => {
      this.scheduled = false;
      this.measure();
    });
  }

  private measure() {
    if (!this.show || !this.target) {
      this.vLines = []; this.hLines = [];
      return;
    }
    const el = this.target;
    const width = el.clientWidth;
    const height = el.clientHeight;
    if (!width || !height) { this.vLines = []; this.hLines = []; return; }

    const cs = getComputedStyle(el);
    const colGap = this.parsePx(cs.columnGap);
    const rowGap = this.parsePx(cs.rowGap);

    const cols = this.parseTrackList(cs.gridTemplateColumns, width, colGap);
    const rows = this.parseTrackList(cs.gridTemplateRows, height, rowGap);

    // Build vertical grid line positions (between columns)
    const v: number[] = [];
    let x = 0;
    for (let i = 1; i <= cols.length - 1; i++) {
      x += cols[i - 1] + colGap;   // start of column i+1 (after gap)
      v.push(Math.round(x));
    }

    // Build horizontal grid line positions (between rows)
    const h: number[] = [];
    let y = 0;
    for (let i = 1; i <= rows.length - 1; i++) {
      y += rows[i - 1] + rowGap;   // start of row i+1 (after gap)
      h.push(Math.round(y));
    }

    this.vLines = v;
    this.hLines = h;
  }

  private parsePx(value: string | null): number {
    const n = parseFloat(value || '0');
    return Number.isFinite(n) ? n : 0;
  }

  /** Try to resolve track sizes in px. Fallback: share remaining space equally among unknowns. */
  private parseTrackList(spec: string, total: number, gap: number): number[] {
    if (!spec) return [total];
    // Tokenize; expand very simple repeat(n, X)
    const raw = spec.trim().replace(/\s+/g, ' ').split(' ');
    const expanded: string[] = [];
    for (const tok of raw) {
      const m = tok.match(/^repeat\(\s*(\d+)\s*,\s*([^)]+)\)$/i);
      if (m) {
        const n = parseInt(m[1], 10);
        const inner = m[2].trim();
        for (let i = 0; i < n; i++) expanded.push(inner);
      } else {
        expanded.push(tok);
      }
    }

    // Convert px tokens; mark others as NaN to fill later
    const values = expanded.map(t => {
      if (t.endsWith('px')) {
        const v = parseFloat(t);
        return Number.isFinite(v) ? v : NaN;
      }
      // If computedStyle resolved fr/auto into px, we'd see px already.
      // Otherwise we'll fill these with equal remaining space.
      const v = parseFloat(t);
      return Number.isFinite(v) ? v : NaN;
    });

    const count = values.length || 1;
    const gapsTotal = gap * Math.max(0, count - 1);
    const knownSum = values.filter(v => !Number.isNaN(v)).reduce((a, b) => a + b, 0);
    const unknownIdx = values.map((v, i) => (Number.isNaN(v) ? i : -1)).filter(i => i >= 0);

    const remaining = Math.max(0, total - gapsTotal - knownSum);
    const share = unknownIdx.length ? remaining / unknownIdx.length : 0;
    for (const i of unknownIdx) values[i] = share;

    // Safety: if everything failed, return a single track spanning all space
    if (!values.length) return [total - gapsTotal];
    return values;
  }
}
