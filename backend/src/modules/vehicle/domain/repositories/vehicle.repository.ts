import { VehicleEntity } from '../entities/vehicle.entity';

export abstract class VehicleRepository {
  abstract create(vehicle: VehicleEntity): Promise<VehicleEntity>;
  abstract findById(id: string): Promise<VehicleEntity | null>;
  abstract update(vehicle: VehicleEntity): Promise<VehicleEntity>;
  abstract delete(id: string): Promise<void>;
}
