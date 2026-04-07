import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { CreateVehicleCommand } from '../commands/create-vehicle.command';

@Injectable()
export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(command: CreateVehicleCommand): Promise<VehicleEntity> {
    try {
      const vehicle = new VehicleEntity(
        randomUUID(),
        command.licensePlate,
        command.chassis,
        command.registrationNumber,
        command.model,
        command.brand,
        command.year,
      );

      return await this.vehicleRepository.create(vehicle);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
