import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Vehicle, VehiclePayload } from '../../../../shared/models/vehicle.model';

interface VehicleFormDialogData {
  vehicle?: Vehicle;
}

@Component({
  selector: 'app-vehicle-form-modal',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './vehicle-form-modal.component.html',
  styleUrl: './vehicle-form-modal.component.scss'
})
export class VehicleFormModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject<VehicleFormDialogData>(MAT_DIALOG_DATA, {
    optional: true
  });
  private readonly dialogRef = inject(
    MatDialogRef<VehicleFormModalComponent, VehiclePayload>
  );

  readonly isEdit = !!this.data?.vehicle;

  readonly form = this.fb.nonNullable.group({
    plate: [this.data?.vehicle?.plate ?? '', [Validators.required, Validators.minLength(6)]],
    brand: [this.data?.vehicle?.brand ?? '', [Validators.required, Validators.minLength(2)]],
    model: [this.data?.vehicle?.model ?? '', [Validators.required, Validators.minLength(2)]],
    year: [
      this.data?.vehicle?.year ?? new Date().getFullYear(),
      [Validators.required, Validators.min(1900), Validators.max(2100)]
    ]
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }
}
