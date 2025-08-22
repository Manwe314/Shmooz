import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h3 class="title">{{ data.title || 'Error' }}</h3>
    <pre class="content">{{ data.details }}</pre>
    <div class="actions">
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
  styles: [`
    .title { margin: 0 0 8px; font-weight: 600; }
    .content {
      max-height: 60vh; overflow: auto;
      background: #121212; color: #ff9e9e;
      padding: 12px; border-radius: 6px; white-space: pre-wrap;
    }
    .actions { display: flex; justify-content: flex-end; margin-top: 8px; }
  `]
})
export class ErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; details: string }) {}
}
