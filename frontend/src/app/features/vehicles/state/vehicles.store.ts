import { Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { VehicleService } from '../services/vehicle.service';

@Injectable()
export class VehiclesStore {
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);

  constructor(private readonly vehicleService: VehicleService) {}

  loadVehicles() {
    this.loading.set(true);
    this.vehicleService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.vehicles.set(data);
          this.loaded.set(true);
        },
        error: () => this.loaded.set(true)
      });
  }
}
