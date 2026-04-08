import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { GetVehicleQuery } from '../queries/get-vehicle.query';

@Injectable()
export class GetVehicleUseCase {
  private readonly logger = new Logger(GetVehicleUseCase.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(query: GetVehicleQuery): Promise<VehicleEntity> {
    this.logger.log(`Fetching vehicle id=${query.id}`);
    try {
      const vehicle = await this.vehicleRepository.findById(query.id);
      if (!vehicle) {
        this.logger.warn(`Vehicle not found id=${query.id}`);
        throw new NotFoundException('Vehicle not found');
      }
      this.logger.log(`Vehicle found id=${query.id}`);
      return vehicle;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Vehicle fetch failed id=${query.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
