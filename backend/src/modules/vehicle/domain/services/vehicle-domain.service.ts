import { Injectable } from '@nestjs/common';
import { VehicleEntity } from '../entities/vehicle.entity';

@Injectable()
export class VehicleDomainService {
  createEntity(input: {
    id: string;
    licensePlate: string;
    chassis: string;
    registrationNumber: string;
    model: string;
    brand: string;
    year: number;
    createdAt: Date;
    updatedAt: Date;
  }): VehicleEntity {
    return new VehicleEntity(
      input.id,
      input.licensePlate,
      input.chassis,
      input.registrationNumber,
      input.model,
      input.brand,
      input.year,
      input.createdAt,
      input.updatedAt,
    );
  }
}
