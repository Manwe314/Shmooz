import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

type EditSlugForm = FormGroup<{
  slug: FormControl<string>;
}>;

@Component({
  selector: 'app-edit-slug-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Edit slug</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <div mat-dialog-content>
        <mat-form-field appearance="fill" class="full">
          <mat-label>Slug</mat-label>
          <input matInput formControlName="slug" />
          <mat-hint>Max 50, only letters/numbers/_/-</mat-hint>
          <mat-error *ngIf="form.controls.slug.hasError('required')">Required</mat-error>
          <mat-error *ngIf="form.controls.slug.hasError('maxlength')">Too long</mat-error>
          <mat-error *ngIf="form.controls.slug.hasError('pattern')">Invalid characters</mat-error>
        </mat-form-field>
      </div>
      <div mat-dialog-actions align="end">
        <button mat-button type="button" (click)="ref.close(null)">Cancel</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
          Save
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .full {
        width: 100%;
      }
    `,
  ],
})
export class EditSlugDialogComponent {
  form: EditSlugForm;

  constructor(
    public ref: MatDialogRef<EditSlugDialogComponent, string | null>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: { slug: string },
  ) {
    this.form = this.fb.nonNullable.group({
      slug: [
        data.slug,
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9_-]{1,50}$/),
        ],
      ],
    });
  }

  save() {
    if (this.form.invalid) return;
    this.ref.close(this.form.controls['slug'].value);
  }
}
