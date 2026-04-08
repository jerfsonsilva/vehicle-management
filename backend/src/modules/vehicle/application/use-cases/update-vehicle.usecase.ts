import {
  Injectable,
  InternalServerErrorException,
  Logger,
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
  private readonly logger = new Logger(UpdateVehicleUseCase.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(command: UpdateVehicleCommand): Promise<VehicleEntity> {
    this.logger.log(`Updating vehicle id=${command.id}`);
    try {
      const current = await this.vehicleRepository.findById(command.id);
      if (!current) {
        this.logger.warn(`Vehicle not found for update id=${command.id}`);
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

      const result = await this.vehicleRepository.update(updated);
      this.logger.log(`Vehicle updated id=${command.id}`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Vehicle update failed id=${command.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
