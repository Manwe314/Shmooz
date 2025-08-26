import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { BackgroundEditorComponent } from '../background/background-editor.component';
import { DeckEditorComponent } from '../decks/deck-editor.component';
import { PageEditorComponent } from '../pages/page-editor.component';
import { ProjectCardEditorComponent } from '../project-cards/project-card-editor.component';
import { SlugEntry,SlugService } from '../slugs/slug.service';
import { ConfirmDialogComponent } from '../widgets/confirm-dialog.component';
import { EditSlugDialogComponent } from '../widgets/edit-slug-dialog.component';

@Component({
  selector: 'app-admin-workspace',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    BackgroundEditorComponent,
    DeckEditorComponent,
    ProjectCardEditorComponent,
    PageEditorComponent,
  ],
  templateUrl: './admin-workspace.component.html',
  styleUrls: ['./admin-workspace.component.css'],
})
export class AdminWorkspaceComponent {
  private slugs = inject(SlugService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  get current(): SlugEntry | null {
    return this.slugs.selectedSlugSnapshot;
  }

  backToPicker() {
    this.router.navigate(['/dashboard']);
  }

  editSlug(s: SlugEntry) {
    const ref = this.dialog.open(EditSlugDialogComponent, { data: { slug: s.slug } });
    ref.afterClosed().subscribe((newSlug: string | null) => {
      if (!newSlug || newSlug === s.slug) return;
      this.slugs.updateSlug(s.id, newSlug).subscribe((updated) => {
        if (updated) this.snack.open('Slug updated', 'OK', { duration: 1500 });
        else this.snack.open('Failed to update slug', 'Dismiss', { duration: 2500 });
      });
    });
  }

  deleteSlug(s: SlugEntry) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete slug',
        message: `Are you sure you want to delete "${s.slug}"? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.slugs.deleteSlug(s.id).subscribe((success) => {
        if (success) {
          this.snack.open('Slug deleted', 'OK', { duration: 1500 });
          this.router.navigate(['/dashboard']);
        } else {
          this.snack.open('Failed to delete slug', 'Dismiss', { duration: 2500 });
        }
      });
    });
  }
}
