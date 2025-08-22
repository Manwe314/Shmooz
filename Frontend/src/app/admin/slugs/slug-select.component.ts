import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlugService, SlugEntry } from './slug.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-slug-select',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './slug-select.component.html',
  styleUrls: ['./slug-select.component.css'],
})
export class SlugSelectComponent implements OnInit {
  private router = inject(Router);
  slugsService = inject(SlugService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  creating = signal(false);

  form = this.fb.group({
    slug: ['', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[A-Za-z0-9_-]{1,50}$/) // no spaces, only [a-zA-Z0-9_-]
    ]]
  });

  ngOnInit() {
    this.slugsService.loadSlugs().subscribe();
  }

  pick(s: SlugEntry) {
    this.slugsService.selectSlug(s);
    this.router.navigate(['/admin']); // go to workspace
  }

  create() {
    if (this.form.invalid || this.creating()) return;
    this.creating.set(true);
    const slug = this.form.value.slug!;
    this.slugsService.createSlug(slug).subscribe(created => {
      this.creating.set(false);
      if (created) {
        this.snack.open(`Created "${created.slug}"`, 'OK', { duration: 2000 });
        this.pick(created);
      } else {
        this.snack.open('Failed to create slug', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
