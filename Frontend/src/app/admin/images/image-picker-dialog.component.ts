import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ImageService, ImageDto, Page } from './image.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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

  ngOnInit() { this.load(); }

  //PROD
  toFullUrl(input: string) {
    if (!input) return '';
    const MEDIA = '/media';

    try {
      // Works for absolute URLs or relative paths
      const url = new URL(input, location.origin);
      const p = url.pathname;
      const i = p.indexOf(MEDIA);
      if (i !== -1) return this.getImageUrl(p.slice(i));
      // Fallbacks if pathname didn't include '/media'
      if (p.startsWith('media')) return this.getImageUrl('/' + p);
      if (input.startsWith('media')) return this.getImageUrl('/' + input);
      return this.getImageUrl(input);
    } catch {
      // Non-URL string, do a plain substring search
      const i = input.indexOf(MEDIA);
      if (i !== -1) return  this.getImageUrl(input.slice(i));
      if (input.startsWith('media')) return this.getImageUrl('/' + input);
      return this.getImageUrl(input);
    }
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    //URL
    return `https://127.0.0.1:8080${path}`
  }

  load() {
    this.loading.set(true);
    this.imagesApi.listImages(this.limit, this.pageOffset).subscribe((page: Page<ImageDto>) => {
      this.images = page.results;
      this.loading.set(false);
    });
  }

  hasNext() { return this.images.length === this.limit; }
  nextPage() { if (this.hasNext()) { this.pageOffset += this.limit; this.load(); } }
  prevPage() { if (this.pageOffset > 0) { this.pageOffset -= this.limit; this.load(); } }

  choose(img: ImageDto) {
    this.ref.close({ id: img.id, path: img.image, title: img.title });
  }

  onFile(ev: Event) {
    const t = ev.target as HTMLInputElement;
    this.file = (t.files && t.files[0]) || null;
  }

  doUpload() {
    if (!this.file || !this.uploadTitle) return;
    this.uploading.set(true);
    this.imagesApi.uploadImage(this.data.ownerSlug, this.uploadTitle, this.file).subscribe(img => {
      this.uploading.set(false);
      if (img) {
        this.images = [img, ...this.images];
        this.ref.close({ id: img.id, path: img.image, title: img.title });
      }
    });
  }
}
