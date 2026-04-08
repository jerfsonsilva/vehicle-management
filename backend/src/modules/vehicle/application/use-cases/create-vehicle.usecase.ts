import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { CreateVehicleCommand } from '../commands/create-vehicle.command';

@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(command: CreateVehicleCommand): Promise<VehicleEntity> {
    this.logger.log(
      `Creating vehicle licensePlate=${command.licensePlate} year=${command.year}`,
    );
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

      const created = await this.vehicleRepository.create(vehicle);
      this.logger.log(`Vehicle created id=${created.id}`);
      return created;
    } catch (error) {
      if (error instanceof ConflictException) {
        this.logger.warn(
          `Vehicle create conflict licensePlate=${command.licensePlate}: ${error.message}`,
        );
        throw error;
      }
      this.logger.error(
        `Vehicle create failed licensePlate=${command.licensePlate}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
