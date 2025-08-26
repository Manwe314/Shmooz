import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

import { ImageDto, ImageService, Page } from './image.service';

export interface ImagePickResult {
  id: number;
  path: string;
  title: string;
}

@Component({
  selector: 'app-image-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './image-picker-dialog.component.html',
  styleUrl: './image-picker-dialog.component.css',
})
export class ImagePickerDialogComponent implements OnInit {
  private imagesApi = inject(ImageService);
  ref = inject(MatDialogRef<ImagePickerDialogComponent, ImagePickResult | null>);
  data = inject<{ ownerSlug: string }>(MAT_DIALOG_DATA);

  limit = 40;
  pageOffset = 0;
  images: ImageDto[] = [];
  loading = signal(false);
  uploading = signal(false);

  uploadTitle = '';
  file: File | null = null;
  fileError = signal<string | null>(null);

  ngOnInit() {
    this.load();
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
    //URL
    return `https://127.0.0.1:8080${path}`;
  }

  load() {
    this.loading.set(true);
    this.imagesApi.listImages(this.limit, this.pageOffset).subscribe((page: Page<ImageDto>) => {
      this.images = page.results;
      this.loading.set(false);
    });
  }

  hasNext() {
    return this.images.length === this.limit;
  }
  nextPage() {
    if (this.hasNext()) {
      this.pageOffset += this.limit;
      this.load();
    }
  }
  prevPage() {
    if (this.pageOffset > 0) {
      this.pageOffset -= this.limit;
      this.load();
    }
  }

  choose(img: ImageDto) {
    this.ref.close({ id: img.id, path: img.image, title: img.title });
  }

  onFile(ev: Event) {
    const t = ev.target as HTMLInputElement;
    const selectedFile = (t.files && t.files[0]) || null;

    if (selectedFile) {
      // Validate the file
      const validation = this.imagesApi.validateFile(selectedFile);
      if (!validation.valid) {
        this.fileError.set(validation.error || 'Invalid file');
        this.file = null;
        // Clear the input
        t.value = '';
        return;
      }

      // File is valid
      this.fileError.set(null);
      this.file = selectedFile;
    } else {
      this.file = null;
      this.fileError.set(null);
    }
  }

  doUpload() {
    if (!this.file || !this.uploadTitle || this.fileError()) return;

    this.uploading.set(true);
    this.imagesApi
      .uploadImage(this.data.ownerSlug, this.uploadTitle, this.file)
      .subscribe((img) => {
        this.uploading.set(false);
        if (img) {
          this.images = [img, ...this.images];
          this.ref.close({ id: img.id, path: img.image, title: img.title });
        } else {
          // Handle upload error (could be server-side validation)
          this.fileError.set('Upload failed. Please try again or check file size/format.');
        }
      });
  }

  getMaxFileSizeMB(): string {
    return (this.imagesApi.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
  }
}
