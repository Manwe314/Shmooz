import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  FormGroup, FormControl
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SlugService } from '../slugs/slug.service';
import { DeckService, DeckDto } from './deck.service';
import { ConfirmDialogComponent } from '../widgets/confirm-dialog.component';
import { ImagePickerDialogComponent, ImagePickResult } from '../images/image-picker-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';

// live preview
import { DeckComponent } from '../../../app/deck/deck.component'; // <-- adjust path to your DeckComponent

type DeckForm = FormGroup<{
  id: FormControl<number | null>;
  title: FormControl<string>;
  displayed_name: FormControl<string>;
  text_color: FormControl<string>;
  hover_color: FormControl<string>;
  image_id: FormControl<number | null>;
  hover_img_id: FormControl<number | null>;
  card_amount: FormControl<number>;
  x_offsets: FormControl<string>;           // CSV in the form
  y_offsets: FormControl<string>;
  rotations: FormControl<string>;
  alphas: FormControl<string>;
  brightness: FormControl<string>;
  hover_x_offsets: FormControl<string>;
  hover_y_offsets: FormControl<string>;
  hover_rotations: FormControl<string>;
  hover_brightness: FormControl<string>;
  image_url: FormControl<string | null>;    // for preview
  hover_img_url: FormControl<string | null>;
}>;

type ArrayKey =
  | 'x_offsets' | 'y_offsets' | 'rotations' | 'alphas' | 'brightness'
  | 'hover_x_offsets' | 'hover_y_offsets' | 'hover_rotations' | 'hover_brightness';

@Component({
  selector: 'app-deck-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    DeckComponent,
    MatExpansionModule,
  ],
  templateUrl: './deck-editor.component.html',
  styleUrl: './deck-editor.component.css'
})
export class DeckEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private slugService = inject(SlugService);
  private decksApi = inject(DeckService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  owner = signal<string | null>(null);
  decks = signal<DeckDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);

  // Default arrays for auto-fill/padding
  private defaults: Record<ArrayKey, number[]> = {
    x_offsets: [3, 5, 1, -10],
    y_offsets: [1, 0, 4, 1],
    rotations: [-3, -9, 2, 7],
    alphas: [0.15, 0.2, 0.25, 0.25],
    brightness: [0.9, 0.85, 0.8, 0.75],
    hover_x_offsets: [-15, -15, -3, 5],
    hover_y_offsets: [28, 43, -20, 55],
    hover_rotations: [-8, 20, 5, 7],
    hover_brightness: [0.95, 0.9, 0.85, 0.8],
  };

  form: DeckForm = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    displayed_name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    text_color: this.fb.nonNullable.control('#ffffff', [Validators.maxLength(50)]),
    hover_color: this.fb.nonNullable.control('#e0f804', [Validators.maxLength(50)]),
    image_id: this.fb.control<number | null>(null),
    hover_img_id: this.fb.control<number | null>(null),
    card_amount: this.fb.nonNullable.control(4, [Validators.min(0), Validators.max(2147483647)]),

    x_offsets: this.fb.nonNullable.control('3,5,1,-10'),
    y_offsets: this.fb.nonNullable.control('1,0,4,1'),
    rotations: this.fb.nonNullable.control('-3,-9,2,7'),
    alphas: this.fb.nonNullable.control('0.15,0.2,0.25,0.25'),
    brightness: this.fb.nonNullable.control('0.9,0.85,0.8,0.75'),

    hover_x_offsets: this.fb.nonNullable.control('-15,-15,-3,5'),
    hover_y_offsets: this.fb.nonNullable.control('28,43,-20,55'),
    hover_rotations: this.fb.nonNullable.control('-8,20,5,7'),
    hover_brightness: this.fb.nonNullable.control('0.95,0.9,0.85,0.8'),

    image_url: this.fb.control<string | null>(null),
    hover_img_url: this.fb.control<string | null>(null),
  });

  // preview object shaped for DeckComponent input
  get previewDeck() {
    const f = this.form.getRawValue();
    return {
      id: String(f.id ?? ''),
      displayed_name: f.displayed_name,
      image_url: f.image_url ?? '',
      hover_img_url: f.hover_img_url ?? '',
      card_amount: f.card_amount,
      x_offsets: parseCsvNums(f.x_offsets),
      y_offsets: parseCsvNums(f.y_offsets),
      rotations: parseCsvNums(f.rotations),
      alphas: parseCsvNums(f.alphas),
      brightness: parseCsvNums(f.brightness),
      hover_x_offsets: parseCsvNums(f.hover_x_offsets),
      hover_y_offsets: parseCsvNums(f.hover_y_offsets),
      hover_rotations: parseCsvNums(f.hover_rotations),
      hover_brightness: parseCsvNums(f.hover_brightness),
      text_color: f.text_color,
      hover_color: f.hover_color,
    } as any;
  }

  ngOnInit() {
    this.owner.set(this.slugService.selectedSlugSnapshot?.slug ?? null);
    this.slugService.selectedSlug$.subscribe(s => {
      const next = s?.slug ?? null;
      if (next !== this.owner()) {
        this.owner.set(next);
        this.loadDecks();
        this.newDeck();
      }
    });

    // When card amount changes, resize all CSV controls accordingly
    this.form.controls.card_amount.valueChanges.subscribe(() => {
      this.resizeAllCsv();
    });

    this.loadDecks();
    this.newDeck();
  }

  /** indices 0..card_amount-1 */
  get indexArray(): number[] {
    const n = this.form.controls.card_amount.value ?? 0;
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
  }

  /** Read a numeric value at idx from a CSV control; padded with defaults or 0 */
  getCsvItem(key: ArrayKey, idx: number): number {
    const arr = parseCsvNums(this.form.controls[key].value || '');
    if (idx < arr.length) return arr[idx] ?? 0;
    const def = this.defaults[key];
    const need = idx - arr.length + 1;
    const padded = arr.concat(padFromDefaults(def, need, arr.length));
    return padded[idx] ?? 0;
  }

  /** Write a numeric value at idx back into the CSV control, respecting card_amount length */
  setCsvItem(key: ArrayKey, idx: number, value: string | number) {
    const n = this.form.controls.card_amount.value ?? 0;
    const parsed = Number(value);
    const val = Number.isFinite(parsed) ? parsed : 0;

    let arr = parseCsvNums(this.form.controls[key].value || '');
    // Resize to exactly n
    arr = ensureLength(arr, n, this.defaults[key]);
    // Set the index
    if (idx >= 0 && idx < n) arr[idx] = val;
    this.form.controls[key].setValue(arr.join(','));
  }

  /** Reset a whole row to defaults (trim/pad to card_amount) */
  resetDefaults(key: ArrayKey) {
    const n = this.form.controls.card_amount.value ?? 0;
    const base = ensureLength([], n, this.defaults[key]);
    this.form.controls[key].setValue(base.join(','));
  }

  /** Make all CSV arrays align to card_amount using defaults */
  private resizeAllCsv() {
    ([
      'x_offsets','y_offsets','rotations','alphas','brightness',
      'hover_x_offsets','hover_y_offsets','hover_rotations','hover_brightness'
    ] as ArrayKey[]).forEach(k => {
      const n = this.form.controls.card_amount.value ?? 0;
      const arr = parseCsvNums(this.form.controls[k].value || '');
      const resized = ensureLength(arr, n, this.defaults[k]);
      this.form.controls[k].setValue(resized.join(','));
    });
  }

  toFullUrl(input: string) {
    if (!input) return '';
    const MEDIA = '/media';

    try {
      const url = new URL(input, location.origin);
      const p = url.pathname;
      const i = p.indexOf(MEDIA);
      if (i !== -1) return this.getImageUrl(p.slice(i));
      if (p.startsWith('media')) return this.getImageUrl('/' + p);
      if (input.startsWith('media')) return this.getImageUrl('/' + input);
      return this.getImageUrl(input);
    } catch {
      const i = input.indexOf(MEDIA);
      if (i !== -1) return  this.getImageUrl(input.slice(i));
      if (input.startsWith('media')) return this.getImageUrl('/' + input);
      return this.getImageUrl(input);
    }
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    return `https://127.0.0.1:8080${path}`;
  }

  loadDecks() {
    const o = this.owner(); if (!o) return;
    this.loading.set(true);
    this.decksApi.listByOwner(o, 100).subscribe(list => {
      this.decks.set(list);
      this.loading.set(false);
    });
  }

  newDeck() {
    this.form.reset({
      id: null,
      title: '',
      displayed_name: '',
      text_color: '#ffffff',
      hover_color: '#e0f804',
      image_id: null,
      hover_img_id: null,
      card_amount: 4,
      x_offsets: '3,5,1,-10',
      y_offsets: '1,0,4,1',
      rotations: '-3,-9,2,7',
      alphas: '0.15,0.2,0.25,0.25',
      brightness: '0.9,0.85,0.8,0.75',
      hover_x_offsets: '-15,-15,-3,5',
      hover_y_offsets: '28,43,-20,55',
      hover_rotations: '-8,20,5,7',
      hover_brightness: '0.95,0.9,0.85,0.8',
      image_url: null,
      hover_img_url: null,
    });
    this.resizeAllCsv();
  }

  loadDeck(d: DeckDto) {
    this.form.patchValue({
      id: d.id,
      title: d.title,
      displayed_name: d.displayed_name,
      text_color: d.text_color ?? '#ffffff',
      hover_color: d.hover_color ?? '#e0f804',
      image_id: d.image ?? null,
      hover_img_id: d.hover_img ?? null,
      card_amount: d.card_amount ?? 4,

      x_offsets: joinCsv(d.x_offsets),
      y_offsets: joinCsv(d.y_offsets),
      rotations: joinCsv(d.rotations),
      alphas: joinCsv(d.alphas),
      brightness: joinCsv(d.brightness),

      hover_x_offsets: joinCsv(d.hover_x_offsets),
      hover_y_offsets: joinCsv(d.hover_y_offsets),
      hover_rotations: joinCsv(d.hover_rotations),
      hover_brightness: joinCsv(d.hover_brightness),

      image_url: d.image_url || null,
      hover_img_url: d.hover_img_url || null,
    });
    this.resizeAllCsv();
  }

  pickImage(kind: 'cover' | 'hover') {
    const o = this.owner(); if (!o) return;
    const ref = this.dialog.open(ImagePickerDialogComponent, {
      data: { ownerSlug: o },
      width: '900px',          
      maxWidth: '90vw',        
      minWidth: '400px',       
      panelClass: 'image-picker-dialog' 
    });
    ref.afterClosed().subscribe((res: ImagePickResult | null) => {
      if (!res) return;
      if (kind === 'cover') {
        this.form.controls['image_id'].setValue(res.id);
        this.form.controls['image_url'].setValue(res.path);
      } else {
        this.form.controls['hover_img_id'].setValue(res.id);
        this.form.controls['hover_img_url'].setValue(res.path);
      }
    });
  }

  clearImage(kind: 'cover' | 'hover') {
    if (kind === 'cover') {
      this.form.controls['image_id'].setValue(null);
      this.form.controls['image_url'].setValue(null);
    } else {
      this.form.controls['hover_img_id'].setValue(null);
      this.form.controls['hover_img_url'].setValue(null);
    }
  }

  resetForm() {
    if (this.form.controls['id'].value) {
      const id = this.form.controls['id'].value!;
      const d = this.decks().find(x => x.id === id);
      if (d) this.loadDeck(d);
    } else {
      this.newDeck();
    }
  }

  save() {
    const o = this.owner(); if (!o || this.form.invalid) return;
    this.saving.set(true);
    const f = this.form.getRawValue();

    const payloadCommon = {
      title: f.title,
      displayed_name: f.displayed_name,
      text_color: f.text_color,
      hover_color: f.hover_color,
      card_amount: f.card_amount,

      x_offsets: parseCsvNums(f.x_offsets),
      y_offsets: parseCsvNums(f.y_offsets),
      rotations: parseCsvNums(f.rotations),
      alphas: parseCsvNums(f.alphas),
      brightness: parseCsvNums(f.brightness),

      hover_x_offsets: parseCsvNums(f.hover_x_offsets),
      hover_y_offsets: parseCsvNums(f.hover_y_offsets),
      hover_rotations: parseCsvNums(f.hover_rotations),
      hover_brightness: parseCsvNums(f.hover_brightness),

      ...(f.image_id ? { image_id: f.image_id } : {}),
      ...(f.hover_img_id ? { hover_img_id: f.hover_img_id } : {}),
    };

    if (!f.id) {
      this.decksApi.createDeck(o, { owner: o, ...payloadCommon }).subscribe(rec => {
        this.saving.set(false);
        if (rec) {
          this.snack.open('Deck created', 'OK', { duration: 1500 });
          this.loadDecks();
          this.loadDeck(rec);
        } else {
          this.snack.open('Failed to create deck', 'Dismiss', { duration: 2500 });
        }
      });
    } else {
      this.decksApi.updateDeck(f.id, o, payloadCommon as any).subscribe(rec => {
        this.saving.set(false);
        if (rec) {
          this.snack.open('Saved', 'OK', { duration: 1200 });
          const list = this.decks().map(d => d.id === rec.id ? rec : d);
          this.decks.set(list);
          this.loadDeck(rec);
        } else {
          this.snack.open('Failed to save changes', 'Dismiss', { duration: 2500 });
        }
      });
    }
  }

  confirmDelete() {
    const id = this.form.controls['id'].value;
    if (!id) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete deck',
        message: `Delete this deck? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.deleting.set(true);
      this.decksApi.deleteDeck(id).subscribe(success => {
        this.deleting.set(false);
        if (success) {
          this.snack.open('Deck deleted', 'OK', { duration: 1500 });
          this.decks.set(this.decks().filter(d => d.id !== id));
          this.newDeck();
        } else {
          this.snack.open('Failed to delete deck', 'Dismiss', { duration: 2500 });
        }
      });
    });
  }
}

/* helpers */
function parseCsvNums(s: string): number[] {
  return (s || '')
    .split(',')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(x => Number(x))
    .filter(x => !Number.isNaN(x));
}
function joinCsv(arr?: number[]): string {
  return Array.isArray(arr) ? arr.join(',') : '';
}
function ensureLength(arr: number[], n: number, defaults: number[]): number[] {
  const out = arr.slice(0, n);
  if (out.length < n) {
    out.push(...padFromDefaults(defaults, n - out.length, out.length));
  }
  return out;
}
function padFromDefaults(defaults: number[], count: number, startAt: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    result.push(defaults[(startAt + i) % defaults.length] ?? 0);
  }
  return result;
}
