import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  FormGroup, FormControl, FormArray, AbstractControl
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { SlugService } from '../slugs/slug.service';
import { DeckService, DeckDto } from '../decks/deck.service';
import { ProjectCardsService as PublicCardsService, ProjectCard as PublicProjectCard } from '../../../app/services/project-cards.service';
import { AdminPageApiService, Block, BlockContent, PageData, PageCategory } from './page-api.service';
import { PagePreviewComponent } from './page-preview.component';
import { ImagePickerDialogComponent, ImagePickResult } from '../images/image-picker-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorDialogComponent } from '../widgets/error-dialog.component';


type TargetType = 'nav' | 'project';

type BlockForm = FormGroup<{
  id: FormControl<string>;
  backgroundColor: FormControl<string>;
  borderColor: FormControl<string>;
  gridTemplateColumns: FormControl<string>;
  gridTemplateRows: FormControl<string>;
  tag: FormControl<string | null>;
  content: FormArray<ContentForm>;
}>;
type ContentForm = FormGroup<any>; // specific per type

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    PagePreviewComponent,
  ],
  templateUrl: './page-editor.component.html',
  styleUrl: './page-editor.component.css'
})
export class PageEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private slugs = inject(SlugService);
  private decksApi = inject(DeckService);
  private publicCardsApi = inject(PublicCardsService); // to list project cards for a deck
  private pagesApi = inject(AdminPageApiService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ownerSlug: string | null = null;
  targetType: TargetType = 'nav';
  navCategory: 'page_one' | 'page_two' = 'page_one';
  decks: DeckDto[] = [];
  projectCards: PublicProjectCard[] = [];
  selectedDeckId: number | null = null;
  selectedProjectCardId: number | null = null;

  currentPageId: number | null = null; // if loaded existing

  saving = false;
  showGridOverlay = false;

  // Blocks form array
  blocks = this.fb.array<BlockForm>([]);

  ngOnInit() {
    this.ownerSlug = this.slugs.selectedSlugSnapshot?.slug ?? null;
    this.slugs.selectedSlug$.subscribe(s => {
      this.ownerSlug = s?.slug ?? null;
      this.clearAll();
      this.loadDecks();
    });
    this.loadDecks();
  }

  

  /* ----------------- Target selection ----------------- */
  loadDecks() {
    if (!this.ownerSlug) return;
    this.decksApi.listByOwner(this.ownerSlug, 100).subscribe(list => {
      this.decks = list;
    });
  }

  onDeckChange(deckId: number | null) {
    this.selectedDeckId = deckId;
    this.selectedProjectCardId = null;
    this.projectCards = [];
    if (!deckId || !this.ownerSlug) return;
    // Reuse public service to list project cards:
    this.publicCardsApi
      .getCardsForDeck(this.ownerSlug, String(deckId))
      .subscribe(cards => { this.projectCards = cards; });
  }

    async loadExisting() {
      if (!this.ownerSlug) return;
      const owner = this.ownerSlug;

      let rec$;
      if (this.targetType === 'nav') {
        rec$ = this.pagesApi.getNavPage(owner, this.navCategory);
      } else {
        if (!this.selectedProjectCardId) {
          this.snack.open('Choose a project card', 'OK', { duration: 1500 });
          return;
        }
        rec$ = this.pagesApi.getProjectPage(this.selectedProjectCardId);
      }

      rec$.subscribe(rec => {
        if (!rec) {
          this.snack.open('No page found. You can create a new one.', 'OK', { duration: 2000 });
          this.currentPageId = null;
          this.blocks.clear();
          return;
        }
        this.currentPageId = rec.id;

        try {
          const raw = typeof rec.content === 'string' ? JSON.parse(rec.content) : (rec.content as any);
          // ✅ accept both shapes: array OR { content: [...] }
          const blocks = Array.isArray(raw) ? raw : (raw?.content ?? []);
          this.loadBlocks(blocks);
          this.snack.open('Page loaded', 'OK', { duration: 1200 });
        } catch (e) {
          console.error('Failed to parse page content', e);
          this.snack.open('Invalid page content JSON', 'Dismiss', { duration: 2500 });
        }
      });
    }

  /* ----------------- Form builders ----------------- */
  private gid(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private baseContentControls() {
    return {
      id: this.fb.nonNullable.control(this.gid('c')),
      rowStart: this.fb.nonNullable.control(1, { validators: [Validators.min(1)] }),
      colStart: this.fb.nonNullable.control(1, { validators: [Validators.min(1)] }),
      rowSpan: this.fb.control<number | null>(1),
      colSpan: this.fb.control<number | null>(1),
      margin: this.fb.control<string | null>(null),
      padding: this.fb.control<string | null>(null),
    };
  }

  newBlockForm(): BlockForm {
    return this.fb.nonNullable.group({
      id: this.fb.nonNullable.control(this.gid('b')),
      backgroundColor: this.fb.nonNullable.control('transparent'),
      borderColor: this.fb.nonNullable.control('transparent'),
      gridTemplateColumns: this.fb.nonNullable.control('1fr'),
      gridTemplateRows: this.fb.nonNullable.control('auto'),
      tag: this.fb.control<string | null>(null),
      content: this.fb.array<ContentForm>([]),
    });
  }

  imageContentForm(): ContentForm {
    return this.fb.nonNullable.group({
      type: this.fb.nonNullable.control<'image'>('image'),
      ...this.baseContentControls(),
      tag: this.fb.control<string | null>(null),
      url: this.fb.nonNullable.control('', Validators.required),
      alt: this.fb.control<string | null>(null),
      borderRadius: this.fb.control<string | null>('8px'),
      objectFit: this.fb.control<'cover'|'contain'|'fill'|'none'|'scale-down'>('cover'),
      objectPosition: this.fb.control<string | null>('center'),
      overflow: this.fb.control<'visible'|'hidden'|'scroll'>('hidden'),
      width: this.fb.control<string | null>('100%'),
      height: this.fb.control<string | null>('auto'),
    });
  }

  textContentForm(): ContentForm {
    return this.fb.nonNullable.group({
      type: this.fb.nonNullable.control<'text'>('text'),
      ...this.baseContentControls(),
      text: this.fb.nonNullable.control('', Validators.required),
      color: this.fb.control<string | null>('#ffffff'),
      tag: this.fb.control<'p'|'h1'|'h2'|'span'|'div' | null>('p'),
      horizontalAlign: this.fb.control<'left'|'center'|'right' | null>('center'),
      verticalAlign: this.fb.control<'top'|'center'|'bottom' | null>('center'),
      textAlign: this.fb.control<'left'|'center'|'right' | null>('center'),
      fontSize: this.fb.control<string | null>(null),
      fontWeight: this.fb.control<string | number | null>(null),
      fontFamily: this.fb.control<string | null>(null),
    });
  }

  linkContentForm(): ContentForm {
    return this.fb.nonNullable.group({
      type: this.fb.nonNullable.control<'link'>('link'),
      ...this.baseContentControls(),
      url: this.fb.nonNullable.control('', Validators.required),
      text: this.fb.nonNullable.control('', Validators.required),
      iconUrl: this.fb.control<string | null>(null),
      color: this.fb.control<string | null>('#ffffff'),
      horizontalAlign: this.fb.control<'left'|'center'|'right' | null>('center'),
      verticalAlign: this.fb.control<'top'|'center'|'bottom' | null>('center'),
      fontSize: this.fb.control<string | null>(null),
      fontWeight: this.fb.control<string | number | null>(null),
      fontFamily: this.fb.control<string | null>(null),
      iconPosition: this.fb.control<'left'|'right' | null>('left'),
    });
  }

  /* ----------------- Block / Content ops ----------------- */
  addBlock() { this.blocks.push(this.newBlockForm()); }
  removeBlock(i: number) { this.blocks.removeAt(i); }

  addContent(i: number, type: 'image'|'text'|'link') {
    const arr = this.blocks.at(i).controls.content as FormArray<ContentForm>;
    const form = type === 'image' ? this.imageContentForm() : type === 'text' ? this.textContentForm() : this.linkContentForm();
    arr.push(form);
  }
  removeContent(blockIndex: number, contentIndex: number) {
    const arr = this.blocks.at(blockIndex).controls.content as FormArray<ContentForm>;
    arr.removeAt(contentIndex);
  }

  pickImageForContent(blockIndex: number, contentIndex: number) {
    if (!this.ownerSlug) return;
    const ref = this.dialog.open(ImagePickerDialogComponent, {
      data: { ownerSlug: this.ownerSlug },
      width: '900px',          
      maxWidth: '90vw',        
      minWidth: '400px',       
      panelClass: 'image-picker-dialog' 
    });
    ref.afterClosed().subscribe((res: ImagePickResult | null) => {
      if (!res) return;
      const arr = this.blocks.at(blockIndex).controls.content as FormArray<ContentForm>;
      const ctrl = arr.at(contentIndex);
      if (ctrl?.value?.type === 'image') {
        ctrl.patchValue({ url: res.path }); // normalized /media/...
      } else if (ctrl?.value?.type === 'link') {
        // if they wanted an icon
        ctrl.patchValue({ iconUrl: res.path });
      }
    });
  }

    toggleBlockTag(b: FormGroup, checked: boolean) {
      const tagCtrl = b.get('tag') as FormControl<string | null> | null;
      if (tagCtrl) {
        tagCtrl.setValue(checked ? 'borderTarget' : null);
      } else {
        // In case 'tag' control wasn't created (defensive)
        b.addControl('tag', new FormControl<string | null>(checked ? 'borderTarget' : null));
      }
    }

    // Toggle image tag (sets/clears 'imageTarget' on the Content form group)
    toggleImageTag(c: FormGroup, checked: boolean) {
      let tagCtrl = c.get('tag') as FormControl<string | null> | null;
      if (!tagCtrl) {
        tagCtrl = new FormControl<string | null>(null);
        c.addControl('tag', tagCtrl);
      }
      tagCtrl.setValue(checked ? 'imageTarget' : null);
    }

  /* ----------------- Build/Load content ----------------- */
  private loadBlocks(blocks: Block[]) {
    this.blocks.clear();
    for (const b of blocks) {
      const bf = this.newBlockForm();
      bf.patchValue({
        id: b.id || this.gid('b'),
        backgroundColor: b.backgroundColor || 'transparent',
        borderColor: b.borderColor || 'transparent',
        gridTemplateColumns: b.gridTemplateColumns || '1fr',
        gridTemplateRows: b.gridTemplateRows || 'auto',
        tag: b.tag || null,
      });
      const arr = bf.controls.content;
      for (const c of b.content || []) {
        if (c.type === 'image') {
          const cf = this.imageContentForm();
          cf.patchValue(c as any);
          arr.push(cf);
        } else if (c.type === 'text') {
          const cf = this.textContentForm();
          cf.patchValue(c as any);
          arr.push(cf);
        } else if (c.type === 'link') {
          const cf = this.linkContentForm();
          cf.patchValue(c as any);
          arr.push(cf);
        }
      }
      this.blocks.push(bf);
    }
  }

  private buildPageData(): PageData {
    const blocks: Block[] = this.blocks.controls.map(bf => {
      const v = bf.getRawValue();
      const content: BlockContent[] = (bf.controls.content.controls).map(cf => {
        const cv = cf.getRawValue();
        // Cast fields to correct optionality; drop nulls
        const clean = Object.fromEntries(Object.entries(cv).filter(([,val]) => val !== null && val !== undefined));
        return clean as any;
      });
      return {
        id: v.id,
        backgroundColor: v.backgroundColor,
        borderColor: v.borderColor,
        gridTemplateColumns: v.gridTemplateColumns,
        gridTemplateRows: v.gridTemplateRows,
        tag: v.tag || undefined,
        content
      };
    });
    return { content: blocks };
  }

  /* ----------------- Actions ----------------- */
  clearAll() {
    this.blocks.clear();
    this.currentPageId = null;
  }

    save() {
      if (!this.ownerSlug) {
        this.snack.open('No slug selected', 'Dismiss', { duration: 2000 });
        return;
      }

      let projectCardId: number | undefined;
      let category: 'page_one' | 'page_two' | `project_${number}`;

      if (this.targetType === 'nav') {
        category = this.navCategory;
      } else {
        if (!this.selectedProjectCardId) {
          this.snack.open('Choose a project card', 'OK', { duration: 1500 });
          return;
        }
        projectCardId = this.selectedProjectCardId;
        category = `project_${projectCardId}`;
      }

      const content = this.buildBlocksPayload(); // ✅ array of blocks with '/media/...'

      // Serializer expects `project_card_id` (write_only)
      const body: any = {
        owner: this.ownerSlug,
        category,
        content,
        ...(projectCardId ? { project_card_id: projectCardId } : {})
      };

      this.saving = true;

      if (this.currentPageId) {
        this.pagesApi.updatePage(this.currentPageId, body).subscribe({
          next: () => { this.saving = false; this.snack.open('Page updated', 'OK', { duration: 1500 }); },
          error: err => { this.saving = false; this.showSaveError(err); }
        });
      } else {
        this.pagesApi.uploadPage(this.ownerSlug, category, content, projectCardId).subscribe({
          next: rec => { this.saving = false; this.currentPageId = rec.id; this.snack.open('Page created', 'OK', { duration: 1500 }); },
          error: err => { this.saving = false; this.showSaveError(err); }
        });
      }
    }




    confirmDelete() {
      if (!this.currentPageId) return;
      const ok = confirm('Delete this page? This cannot be undone.');
      if (!ok) return;
      this.pagesApi.deletePage(this.currentPageId).subscribe({
          next: () => {
            this.snack.open('Page deleted', 'OK', { duration: 1500 });
            this.currentPageId = null;
            this.clearAll();
          },
          error: (err) => {
            const details = this.formatHttpError(err);
            const ref = this.snack.open('Delete failed — see details', 'Details', { duration: 6000 });
            ref.onAction().subscribe(() => {
              this.dialog.open(ErrorDialogComponent, { data: { title: 'Page delete failed', details } });
            });
          }
        });
    }

    private normalizeMediaPath(input?: string | null): string | undefined {
      if (!input) return undefined;
      const MEDIA = '/media';
      try {
        // Try to parse even relative; base on current origin
        const u = new URL(input, location.origin);
        const p = u.pathname;
        const i = p.indexOf(MEDIA);
        if (i !== -1) return p.slice(i);                 // '/media/...'
        if (p.startsWith('media')) return '/' + p;       // 'media/...' -> '/media/...'
        if (input.startsWith('media')) return '/' + input;
        return input; // leave as-is if no /media segment
      } catch {
        // Non-URL string
        const i = input.indexOf(MEDIA);
        if (i !== -1) return input.slice(i);
        if (input.startsWith('media')) return '/' + input;
        return input;
      }
    }

    
    private buildBlocksPayload() {
      return this.blocks.controls.map(bf => {
        const bv = bf.getRawValue();
        const items = bf.controls.content.controls.map(cf => {
          const cv: any = cf.getRawValue();

          if (cv.type === 'image' && cv.url) {
            cv.url = this.normalizeMediaPath(cv.url);
          }
          if (cv.type === 'link' && cv.iconUrl) {
            const normalized = this.normalizeMediaPath(cv.iconUrl);
            // Only replace if it actually refers to /media; keep external URLs
            if (normalized && normalized.startsWith('/media')) cv.iconUrl = normalized;
          }
          return cv;
        });

        return {
          id: bv.id,
          backgroundColor: bv.backgroundColor || 'transparent',
          borderColor: bv.borderColor || 'transparent',
          gridTemplateColumns: bv.gridTemplateColumns || '1fr',
          gridTemplateRows: bv.gridTemplateRows || 'auto',
          ...(bv.tag ? { tag: bv.tag } : {}),
          content: items
        };
      });
    }
    get previewBlocks(): Block[] {
        return this.blocks.controls.map(bf => {
          const v = bf.getRawValue();
          const content = (bf.controls.content.controls).map(cf => cf.getRawValue());
          return {
            id: v.id!, // generated by gid()
            backgroundColor: v.backgroundColor || 'transparent',
            borderColor: v.borderColor || 'transparent',
            gridTemplateColumns: v.gridTemplateColumns || '1fr',
            gridTemplateRows: v.gridTemplateRows || 'auto',
            tag: v.tag ?? undefined,
            content
          } as Block;
        });
    }

    private formatHttpError(err: HttpErrorResponse): string {
      if (!err) return 'Unknown error';
      if (err.status === 0) return 'Network error: cannot reach the server.';
      const parts: string[] = [
        `Status: ${err.status} ${err.statusText || ''}`.trim()
      ];
      if (err.url) parts.push(`URL: ${err.url}`);
      if (err.error) {
        parts.push(this.flattenErrors(err.error) || String(err.error));
      }
      return parts.join('\n\n');
    }

    private flattenErrors(e: any, prefix = ''): string {
      if (e == null) return '';
      if (typeof e === 'string') return e;
      if (Array.isArray(e)) {
        return e.map((v, i) => this.flattenErrors(v, `${prefix}[${i}]`)).filter(Boolean).join('\n');
      }
      if (typeof e === 'object') {
        const lines: string[] = [];
        for (const [k, v] of Object.entries(e)) {
          const p = prefix ? `${prefix}.${k}` : k;
          if (typeof v === 'string') lines.push(`${p}: ${v}`);
          else lines.push(this.flattenErrors(v, p));
        }
        return lines.filter(Boolean).join('\n');
      }
      return `${prefix}: ${String(e)}`;
    }

    private showSaveError(err: HttpErrorResponse) {
      const details = this.formatHttpError(err);
      const ref = this.snack.open('Save failed — see details', 'Details', { duration: 6000 });
      ref.onAction().subscribe(() => {
        this.dialog.open(ErrorDialogComponent, { data: { title: 'Page save failed', details } });
      });
      // also log the payload in console for quick dev inspection
      console.error('[PageEditor] Save failed', err);
    }
}
