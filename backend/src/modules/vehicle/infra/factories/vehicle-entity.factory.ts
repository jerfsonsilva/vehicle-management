import { VehicleEntity } from '../../domain/entities/vehicle.entity';

export type VehiclePersistenceRow = {
  id: string;
  licensePlate: string;
  chassis: string;
  registrationNumber: string;
  model: string;
  brand: string;
  year: number;
};

export class VehicleEntityFactory {
  static fromPersistence(row: VehiclePersistenceRow): VehicleEntity {
    return new VehicleEntity(
      row.id,
      row.licensePlate,
      row.chassis,
      row.registrationNumber,
      row.model,
      row.brand,
      row.year,
    );
  }
}
