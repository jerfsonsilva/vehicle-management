import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-vehicle-upload-csv-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './vehicle-upload-csv-modal.component.html',
  styleUrl: './vehicle-upload-csv-modal.component.scss'
})
export class VehicleUploadCsvModalComponent {
  private readonly dialogRef = inject(MatDialogRef<VehicleUploadCsvModalComponent>);

  readonly selectedFile = signal<File | null>(null);
  readonly errorMessage = signal<string | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    if (!file) {
      this.selectedFile.set(null);
      this.errorMessage.set('Selecione um arquivo CSV.');
      return;
    }

    const lowerName = file.name.toLowerCase();
    const looksCsv =
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel' ||
      lowerName.endsWith('.csv');

    if (!looksCsv) {
      this.selectedFile.set(null);
      this.errorMessage.set('O arquivo deve ser CSV.');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);
  }

  confirm() {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Selecione um arquivo CSV.');
      return;
    }
    this.dialogRef.close(file);
  }
}
