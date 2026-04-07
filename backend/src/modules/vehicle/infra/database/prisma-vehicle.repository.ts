import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

@Injectable()
export class PrismaVehicleRepository implements VehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(vehicle: VehicleEntity): Promise<VehicleEntity> {
    try {
      const saved = await this.prisma.vehicle.create({
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
      return this.toEntity(saved);
    } catch (error) {
      this.handleUniqueError(error);
      throw error;
    }
  }

  async findById(id: string): Promise<VehicleEntity | null> {
    const found = await this.prisma.vehicle.findUnique({
      where: { id },
    });
    return found ? this.toEntity(found) : null;
  }

  async update(vehicle: VehicleEntity): Promise<VehicleEntity> {
    try {
      const saved = await this.prisma.vehicle.update({
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
      return this.toEntity(saved);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Vehicle not found');
      }
      this.handleUniqueError(error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.vehicle.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Vehicle not found');
      }
      throw error;
    }
  }

  private toEntity(row: {
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
      row.id,
      row.licensePlate,
      row.chassis,
      row.registrationNumber,
      row.model,
      row.brand,
      row.year,
      row.createdAt,
      row.updatedAt,
    );
  }

  private handleUniqueError(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : 'unique field';
      throw new ConflictException(`Duplicate value for: ${target}`);
    }
  }
}
