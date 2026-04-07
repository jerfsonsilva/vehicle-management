import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
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

  private readonly registrationMaskValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const digits = String(control.value ?? '').replace(/\D/g, '');
    return digits.length === 11 ? null : { registrationMask: true };
  };

  private readonly initialRegistration = (
    this.data?.vehicle?.registrationNumber ?? ''
  ).replace(/\D/g, '');

  readonly form = this.fb.nonNullable.group({
    licensePlate: [
      this.data?.vehicle?.licensePlate ?? '',
      [
        Validators.required,
        Validators.pattern(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i)
      ]
    ],
    chassis: [
      this.data?.vehicle?.chassis ?? '',
      [Validators.required, Validators.minLength(17), Validators.maxLength(17)]
    ],
    registrationNumber: [
      this.initialRegistration,
      [Validators.required, this.registrationMaskValidator]
    ],
    brand: [this.data?.vehicle?.brand ?? '', [Validators.required, Validators.minLength(2)]],
    model: [this.data?.vehicle?.model ?? '', [Validators.required, Validators.minLength(2)]],
    year: [
      this.data?.vehicle?.year ?? new Date().getFullYear(),
      [Validators.required, Validators.min(1900), Validators.max(2100)]
    ]
  });

  constructor() {
    this.form.controls.licensePlate.valueChanges.subscribe((value) => {
      const masked = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
      if (value !== masked) {
        this.form.controls.licensePlate.setValue(masked, { emitEvent: false });
      }
    });

    this.form.controls.chassis.valueChanges.subscribe((value) => {
      const masked = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
      if (value !== masked) {
        this.form.controls.chassis.setValue(masked, { emitEvent: false });
      }
    });

    this.form.controls.registrationNumber.valueChanges.subscribe((value) => {
      const masked = value.replace(/\D/g, '').slice(0, 11);
      if (value !== masked) {
        this.form.controls.registrationNumber.setValue(masked, {
          emitEvent: false
        });
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.dialogRef.close({
      ...payload,
      registrationNumber: payload.registrationNumber.replace(/\D/g, '')
    });
  }
}
