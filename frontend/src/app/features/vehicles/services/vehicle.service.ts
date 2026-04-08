import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Vehicle, VehiclePayload } from '../../../shared/models/vehicle.model';

export type VehiclesPageResponse = {
  items: Vehicle[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type VehiclesListParams = {
  page: number;
  pageSize: number;
};

export type UploadCsvResult = {
  queuedCount: number;
  rejectedRowCount: number;
};

export type ImportStatus = 'idle' | 'processing' | 'completed';

export type ImportStatusResponse = {
  successCount: number;
  failureCount: number;
  day: string;
  status: ImportStatus;
};

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  constructor(private readonly api: ApiService) {}

  list(params: VehiclesListParams) {
    return this.api.get<VehiclesPageResponse>(
      `/vehicles?page=${params.page}&pageSize=${params.pageSize}`
    );
  }

  create(payload: VehiclePayload) {
    return this.api.post<Vehicle>('/vehicles', payload);
  }

  update(id: string, payload: VehiclePayload) {
    return this.api.patch<Vehicle>(`/vehicles/${id}`, payload);
  }

  delete(id: string) {
    return this.api.delete<void>(`/vehicles/${id}`);
  }

  uploadCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<UploadCsvResult>('/vehicles/import/csv', formData);
  }

  getImportStatus(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.api.get<ImportStatusResponse>(`/vehicles/import/status${query}`);
  }

  pollImportStatus(date?: string, intervalMs = 3000) {
    return timer(0, intervalMs).pipe(switchMap(() => this.getImportStatus(date)));
  }
}
