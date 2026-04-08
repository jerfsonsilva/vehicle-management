import { Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { VehicleService } from '../services/vehicle.service';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

@Injectable()
export class VehiclesStore {
  readonly vehicles = signal<Vehicle[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly page = signal(DEFAULT_PAGE);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly pageSizeOptions = [10, 20, 50, 100] as const;

  constructor(private readonly vehicleService: VehicleService) {}

  loadVehicles() {
    this.loading.set(true);
    this.vehicleService
      .list({ page: this.page(), pageSize: this.pageSize() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.vehicles.set(data.items);
          this.page.set(data.page);
          this.pageSize.set(data.pageSize);
          this.total.set(data.total);
          this.totalPages.set(data.totalPages);
          this.loaded.set(true);
        },
        error: () => this.loaded.set(true)
      });
  }

  setPage(page: number) {
    if (page < 1 || page === this.page()) {
      return;
    }
    if (this.totalPages() > 0 && page > this.totalPages()) {
      return;
    }
    this.page.set(page);
    this.loadVehicles();
  }

  setPageSize(size: number) {
    if (!this.pageSizeOptions.includes(size as (typeof this.pageSizeOptions)[number])) {
      return;
    }
    if (size === this.pageSize()) {
      return;
    }
    this.pageSize.set(size);
    this.page.set(1);
    this.loadVehicles();
  }

  nextPage() {
    this.setPage(this.page() + 1);
  }

  prevPage() {
    this.setPage(this.page() - 1);
  }
}
