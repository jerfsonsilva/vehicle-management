import { VehicleEntity } from '../entities/vehicle.entity';

export type VehiclePaginationParams = {
  page: number;
  pageSize: number;
};

export type VehiclePaginatedResult = {
  items: VehicleEntity[];
  total: number;
};

export abstract class VehicleRepository {
  abstract create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  abstract findAll(
    params: VehiclePaginationParams,
  ): Promise<VehiclePaginatedResult>;
  abstract findById(id: string): Promise<VehicleEntity | null>;
  abstract update(vehicle: VehicleEntity): Promise<VehicleEntity>;
  abstract delete(id: string): Promise<void>;
}
