import { CommonModule } from '@angular/common';
import { Component,inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProjectCardComponent } from '../../../app/project-card/project-card.component';
import type { ProjectCard } from '../../../app/services/project-cards.service';
import { DeckDto,DeckService } from '../decks/deck.service';
import {
  ImagePickerDialogComponent,
  ImagePickResult,
} from '../images/image-picker-dialog.component';
import { SlugService } from '../slugs/slug.service';
import { ConfirmDialogComponent } from '../widgets/confirm-dialog.component';
import { ProjectCardDto,ProjectCardsService } from './project-cards.service';

type CardForm = FormGroup<{
  id: FormControl<number | null>;
  title: FormControl<string>;
  text: FormControl<string>;
  text_color: FormControl<string>;
  label_letter: FormControl<string>;
  label_color: FormControl<string>;
  inline_color: FormControl<string>;
  image_id: FormControl<number | null>;
  image_url: FormControl<string | null>;
}>;

function ensureHash(v: string | null | undefined): string {
  if (!v) return '#000000';
  return v.startsWith('#') ? v : `#${v}`;
}

@Component({
  selector: 'app-project-card-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    ProjectCardComponent,
  ],
  templateUrl: './project-card-editor.component.html',
  styleUrl: './project-card-editor.component.css',
})
export class ProjectCardEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private slugService = inject(SlugService);
  private decksApi = inject(DeckService);
  private cardsApi = inject(ProjectCardsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  owner = signal<string | null>(null);
  decks = signal<DeckDto[]>([]);
  selectedDeckId = signal<number | null>(null);

  cards = signal<ProjectCardDto[]>([]);
  loading = signal(false);
  saving = signal(false);
  deleting = signal(false);

  form: CardForm = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    text: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    text_color: this.fb.nonNullable.control('#ffffff', [
      Validators.pattern(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    ]),
    label_letter: this.fb.nonNullable.control('A', [Validators.required, Validators.maxLength(2)]),
    label_color: this.fb.nonNullable.control('#000000', [
      Validators.pattern(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    ]),
    inline_color: this.fb.nonNullable.control('#cccccc', [
      Validators.pattern(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    ]),
    image_id: this.fb.control<number | null>(null),
    image_url: this.fb.control<string | null>(null),
  });


  get previewCard(): ProjectCard {
    const f = this.form.getRawValue();
    return {
      id: String(f.id ?? ''),
      title: f.title ?? '',
      text: f.text ?? '',
      text_color: ensureHash(f.text_color),
      label_letter: f.label_letter ?? '',
      label_color: ensureHash(f.label_color),
      inline_color: ensureHash(f.inline_color),
      image_url: f.image_url ?? '',
      owner: this.owner() ?? '',
      animationState: 'inHand',
      offsetX: 0,
      offsetY: 0,
    };
  }

  loadCard(c: ProjectCardDto) {
    this.form.patchValue({
      id: c.id,
      title: c.title,
      text: c.text,
      text_color: ensureHash(c.text_color),
      label_letter: c.label_letter,
      label_color: ensureHash(c.label_color),
      inline_color: ensureHash(c.inline_color),
      image_id: c.image ?? null,
      image_url: c.image_url ?? null,
    });
  }

  newCard() {
    this.form.reset({
      id: null,
      title: '',
      text: '',
      text_color: '#ffffff',
      label_letter: 'A',
      label_color: '#000000',
      inline_color: '#cccccc',
      image_id: null,
      image_url: null,
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
      if (i !== -1) return this.getImageUrl(input.slice(i));
      if (input.startsWith('media')) return this.getImageUrl('/' + input);
      return this.getImageUrl(input);
    }
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    return `https://127.0.0.1:8080${path}`;
  }

  ngOnInit() {
    this.owner.set(this.slugService.selectedSlugSnapshot?.slug ?? null);
    this.slugService.selectedSlug$.subscribe((s) => {
      const next = s?.slug ?? null;
      if (next !== this.owner()) {
        this.owner.set(next);
        this.loadDecks();
        this.clearCard();
        this.cards.set([]);
        this.selectedDeckId.set(null);
      }
    });

    this.loadDecks();
  }

  loadDecks() {
    const o = this.owner();
    if (!o) return;
    this.decksApi.listByOwner(o, 100).subscribe((list) => {
      this.decks.set(
        list.sort((a, b) =>
          (b.edited_at || b.created_at).localeCompare(a.edited_at || a.created_at),
        ),
      );
    });
  }

  onDeckChange(deckId: number | null) {
    this.selectedDeckId.set(deckId);
    this.clearCard();
    if (!deckId) {
      this.cards.set([]);
      return;
    }
    this.loadCards();
  }

  loadCards() {
    const o = this.owner();
    const d = this.selectedDeckId();
    if (!o || !d) return;
    this.loading.set(true);
    this.cardsApi.listByOwnerAndDeck(o, d, 200).subscribe((list) => {
      this.cards.set(list);
      this.loading.set(false);
    });
  }

  clearCard() {
    this.newCard();
  }

  pickImage() {
    const o = this.owner();
    if (!o) return;
    const ref = this.dialog.open(ImagePickerDialogComponent, {
      data: { ownerSlug: o },
      width: '900px',
      maxWidth: '90vw',
      minWidth: '400px',
      panelClass: 'image-picker-dialog',
    });
    ref.afterClosed().subscribe((res: ImagePickResult | null) => {
      if (!res) return;
      this.form.controls['image_id'].setValue(res.id);
      this.form.controls['image_url'].setValue(res.path);
    });
  }

  clearImage() {
    this.form.controls['image_id'].setValue(null);
    this.form.controls['image_url'].setValue(null);
  }

  save() {
    const o = this.owner();
    const d = this.selectedDeckId();
    if (!o || !d || this.form.invalid) return;
    this.saving.set(true);
    const f = this.form.getRawValue();

    const payload = {
      title: f.title,
      text: f.text,
      text_color: f.text_color,
      label_letter: f.label_letter,
      label_color: f.label_color,
      inline_color: f.inline_color,
      owner: o,
      deck_id: d,
      ...(f.image_id ? { image_id: f.image_id } : {}),
    };

    if (!f.id) {
      this.cardsApi.create(o, payload).subscribe((rec) => {
        this.saving.set(false);
        if (rec) {
          this.snack.open('Project card created', 'OK', { duration: 1500 });
          this.loadCards();
          this.loadCard(rec);
        } else {
          this.snack.open('Failed to create card', 'Dismiss', { duration: 2500 });
        }
      });
    } else {
      this.cardsApi.update(f.id!, o, d, payload).subscribe((rec) => {
        this.saving.set(false);
        if (rec) {
          this.snack.open('Saved', 'OK', { duration: 1200 });
          const list = this.cards().map((x) => (x.id === rec.id ? rec : x));
          this.cards.set(list);
          this.loadCard(rec);
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
        title: 'Delete project card',
        message: `Delete this card? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.deleting.set(true);
      this.cardsApi.delete(id).subscribe((success) => {
        this.deleting.set(false);
        if (success) {
          this.snack.open('Card deleted', 'OK', { duration: 1500 });
          this.cards.set(this.cards().filter((c) => c.id !== id));
          this.newCard();
        } else {
          this.snack.open('Failed to delete', 'Dismiss', { duration: 2500 });
        }
      });
    });
  }
}
