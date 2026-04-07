import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Vehicle, VehiclePayload } from '../../../shared/models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  constructor(private readonly api: ApiService) {}

  list() {
    return this.api.get<Vehicle[]>('/vehicles');
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
}
