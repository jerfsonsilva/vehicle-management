import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import {
  VehicleEntityFactory,
  VehiclePersistenceRow,
} from '../factories/vehicle-entity.factory';
import { PrismaErrorUtil } from '../utils/prisma-error.util';

type VehicleModelClient = {
  create: (args: unknown) => Promise<unknown>;
  findUnique: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
};

@Injectable()
export class PrismaVehicleRepository implements VehicleRepository {
  private readonly vehicleModel: VehicleModelClient;

  constructor(private readonly prisma: PrismaService) {
    this.vehicleModel = (
      this.prisma as PrismaService & { vehicle: VehicleModelClient }
    ).vehicle;
  }

  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    try {
      const saved = await this.vehicleModel.create({
        data: {
          id: vehicle.id,
          licensePlate: vehicle.licensePlate,
          chassis: vehicle.chassis,
          registrationNumber: vehicle.registrationNumber,
          model: vehicle.model,
          brand: vehicle.brand,
          year: vehicle.year,
        },
      });
      return VehicleEntityFactory.fromPersistence(saved as VehiclePersistenceRow);
    } catch (error) {
      PrismaErrorUtil.throwIfUniqueViolation(error);
      throw error;
    }
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const found = await this.vehicleModel.findUnique({
      where: { id },
    });
    return found
      ? VehicleEntityFactory.fromPersistence(found as VehiclePersistenceRow)
      : null;
  }

  async update(vehicle: VehicleEntity): Promise<VehicleEntity> {
    try {
      const saved = await this.vehicleModel.update({
        where: { id: vehicle.id },
        data: {
          licensePlate: vehicle.licensePlate,
          chassis: vehicle.chassis,
          registrationNumber: vehicle.registrationNumber,
          model: vehicle.model,
          brand: vehicle.brand,
          year: vehicle.year,
        },
      });
      return VehicleEntityFactory.fromPersistence(saved as VehiclePersistenceRow);
    } catch (error) {
      PrismaErrorUtil.throwIfNotFound(error, 'Vehicle');
      PrismaErrorUtil.throwIfUniqueViolation(error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.vehicleModel.delete({
        where: { id },
      });
    } catch (error) {
      PrismaErrorUtil.throwIfNotFound(error, 'Vehicle');
      throw error;
    }
  }
}
