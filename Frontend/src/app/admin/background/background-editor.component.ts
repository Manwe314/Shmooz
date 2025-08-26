import { CommonModule } from '@angular/common';
import { Component, inject,OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { SsrCacheService } from '../services/ssr-cache.service';
import { SlugService } from '../slugs/slug.service';
import { ConfirmDialogComponent } from '../widgets/confirm-dialog.component';
import {
  BackgroundData,
  BackgroundService,
} from './background.service';

type BgForm = FormGroup<{
  color1: FormControl<string>;
  color2: FormControl<string>;
  color3: FormControl<string>;
  position1: FormControl<string>;
  position2: FormControl<string>;
  position3: FormControl<string>;
  page1: FormControl<string>;
  page2: FormControl<string>;
  navColor: FormControl<string>;
  arrowColor: FormControl<string>;
  ellipseWidth: FormControl<number>;
  ellipseHeight: FormControl<number>;
}>;

@Component({
  selector: 'app-background-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  template: `
    <mat-card class="bg-card" *ngIf="owner">
      <div class="header">
        <h2>Background data</h2>
        <span class="owner"
          >Owner: <strong>{{ owner }}</strong></span
        >
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="grid">
          <!-- Colors -->
          <mat-form-field appearance="fill">
            <mat-label>Color 1</mat-label>
            <input matInput formControlName="color1" placeholder="#000000" />
            <mat-error *ngIf="form.controls['color1'].hasError('pattern')">Invalid hex</mat-error>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Color 2</mat-label>
            <input matInput formControlName="color2" placeholder="#111111" />
            <mat-error *ngIf="form.controls['color2'].hasError('pattern')">Invalid hex</mat-error>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Color 3</mat-label>
            <input matInput formControlName="color3" placeholder="#222222" />
            <mat-error *ngIf="form.controls['color3'].hasError('pattern')">Invalid hex</mat-error>
          </mat-form-field>

          <!-- Positions -->
          <mat-form-field appearance="fill">
            <mat-label>Position 1</mat-label>
            <input matInput formControlName="position1" placeholder="e.g., 10% 20%" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Position 2</mat-label>
            <input matInput formControlName="position2" placeholder="e.g., 50% 40%" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Position 3</mat-label>
            <input matInput formControlName="position3" placeholder="e.g., 80% 60%" />
          </mat-form-field>

          <!-- Page labels -->
          <mat-form-field appearance="fill">
            <mat-label>Page 1</mat-label>
            <input matInput formControlName="page1" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Page 2</mat-label>
            <input matInput formControlName="page2" />
          </mat-form-field>

          <!-- UI colors -->
          <mat-form-field appearance="fill">
            <mat-label>Nav Color</mat-label>
            <input matInput formControlName="navColor" placeholder="#000000" />
            <mat-error *ngIf="form.controls['navColor'].hasError('pattern')">Invalid hex</mat-error>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Arrow Color</mat-label>
            <input matInput formControlName="arrowColor" placeholder="#FFFFFF" />
            <mat-error *ngIf="form.controls['arrowColor'].hasError('pattern')"
              >Invalid hex</mat-error
            >
          </mat-form-field>

          <!-- Ellipse size -->
          <mat-form-field appearance="fill">
            <mat-label>Ellipse Width</mat-label>
            <input matInput type="number" formControlName="ellipseWidth" />
            <mat-error *ngIf="form.controls['ellipseWidth'].hasError('min')">Min 0</mat-error>
            <mat-error *ngIf="form.controls['ellipseWidth'].hasError('max')">Too large</mat-error>
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Ellipse Height</mat-label>
            <input matInput type="number" formControlName="ellipseHeight" />
            <mat-error *ngIf="form.controls['ellipseHeight'].hasError('min')">Min 0</mat-error>
            <mat-error *ngIf="form.controls['ellipseHeight'].hasError('max')">Too large</mat-error>
          </mat-form-field>
        </div>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving">
            {{ hasRecord ? 'Save changes' : 'Create background' }}
          </button>
          <button
            mat-button
            type="button"
            (click)="resetToServer()"
            [disabled]="loading || !hasRecord"
          >
            Reset
          </button>
          <button
            mat-button
            color="warn"
            type="button"
            (click)="confirmDelete()"
            [disabled]="deleting || !hasRecord"
          >
            Delete
          </button>
        </div>
      </form>
    </mat-card>

    <mat-card *ngIf="!owner" class="bg-card">
      <p>No slug selected.</p>
    </mat-card>
  `,
  styles: [
    `
      .bg-card {
        max-width: 1000px;
        margin: 16px auto;
        padding: 16px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .header .owner {
        margin-left: auto;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
      }
    `,
  ],
})
export class BackgroundEditorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private slugService = inject(SlugService);
  private service = inject(BackgroundService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private ssr = inject(SsrCacheService);
  owner: string | null = null;
  record: BackgroundData | null = null;
  loading = false;
  saving = false;
  deleting = false;
  get hasRecord() {
    return !!this.record;
  }

  form: BgForm = this.fb.nonNullable.group({
    color1: this.fb.nonNullable.control('', [Validators.maxLength(50), hexValidator()]),
    color2: this.fb.nonNullable.control('', [Validators.maxLength(50), hexValidator()]),
    color3: this.fb.nonNullable.control('', [Validators.maxLength(50), hexValidator()]),
    position1: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
    position2: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
    position3: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
    page1: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
    page2: this.fb.nonNullable.control('', [Validators.maxLength(50)]),
    navColor: this.fb.nonNullable.control('#000000', [Validators.maxLength(50), hexValidator()]),
    arrowColor: this.fb.nonNullable.control('#FFFFFF', [Validators.maxLength(50), hexValidator()]),
    ellipseWidth: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(2147483647)]),
    ellipseHeight: this.fb.nonNullable.control(0, [Validators.min(0), Validators.max(2147483647)]),
  });

  ngOnInit() {
    this.owner = this.slugService.selectedSlugSnapshot?.slug ?? null;
    this.slugService.selectedSlug$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      const nextOwner = s?.slug ?? null;
      if (nextOwner !== this.owner) {
        this.owner = nextOwner;
        this.loadFromServer();
      }
    });
    this.loadFromServer();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }



  private loadFromServer() {
    if (!this.owner) return;
    this.loading = true;
    this.service.getByOwner(this.owner).subscribe((rec) => {
      this.loading = false;
      this.record = rec;
      if (rec) {
        this.form.patchValue(rec as any);
      } else {
        this.form.setValue({
          color1: '',
          color2: '',
          color3: '',
          position1: '',
          position2: '',
          position3: '',
          page1: '',
          page2: '',
          navColor: '#000000',
          arrowColor: '#FFFFFF',
          ellipseWidth: 0,
          ellipseHeight: 0,
        });
      }
    });
  }

  resetToServer() {
    if (!this.record) return;
    this.form.patchValue(this.record as any);
    this.snack.open('Reverted changes', 'OK', { duration: 1500 });
  }

  save() {
    if (!this.owner || this.form.invalid || this.saving) return;
    this.saving = true;
    const values = this.form.getRawValue();

    if (!this.record) {
      this.service.createBackground(this.owner, values).subscribe((rec) => {
        this.saving = false;
        if (rec) {
          this.record = rec;
          this.form.patchValue(rec as any);
          this.snack.open('Background created', 'OK', { duration: 1500 });
        } else {
          this.snack.open('Failed to create background', 'Dismiss', { duration: 2500 });
        }
      });
    } else {
      this.service.updateBackground(this.record.id, this.owner, values).subscribe((rec) => {
        this.saving = false;
        if (rec) {
          this.record = rec;
          this.form.patchValue(rec as any);
          this.snack.open('Saved', 'OK', { duration: 1200 });
        } else {
          this.snack.open('Failed to save changes', 'Dismiss', { duration: 2500 });
        }
      });
    }
  }

  confirmDelete() {
    if (!this.record) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete background',
        message: `Delete background for owner "${this.owner}"? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.deleting = true;
      this.service.deleteBackground(this.record!.id).subscribe((success) => {
        this.deleting = false;
        if (success) {
          this.record = null;
          this.form.setValue({
            color1: '',
            color2: '',
            color3: '',
            position1: '',
            position2: '',
            position3: '',
            page1: '',
            page2: '',
            navColor: '#000000',
            arrowColor: '#FFFFFF',
            ellipseWidth: 0,
            ellipseHeight: 0,
          });
          this.snack.open('Background deleted', 'OK', { duration: 1500 });
        } else {
          this.record = null;
          this.snack.open('Failed to delete', 'Dismiss', { duration: 2500 });
        }
      });
    });
  }
}

function hexValidator(): ValidatorFn {
  const HEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string;
    if (!v) return null;
    return HEX.test(v) ? null : { pattern: true };
  };
}
