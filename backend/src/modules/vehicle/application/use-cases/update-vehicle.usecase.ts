import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

export type UpdateVehicleCommand = {
  id: string;
  licensePlate?: string;
  chassis?: string;
  registrationNumber?: string;
  model?: string;
  brand?: string;
  year?: number;
};

@Injectable()
export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(command: UpdateVehicleCommand): Promise<VehicleEntity> {
    try {
      const current = await this.vehicleRepository.findById(command.id);
      if (!current) {
        throw new NotFoundException('Vehicle not found');
      }

      const updated = new VehicleEntity(
        current.id,
        command.licensePlate ?? current.licensePlate,
        command.chassis ?? current.chassis,
        command.registrationNumber ?? current.registrationNumber,
        command.model ?? current.model,
        command.brand ?? current.brand,
        command.year ?? current.year,
      );

      return this.vehicleRepository.update(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
