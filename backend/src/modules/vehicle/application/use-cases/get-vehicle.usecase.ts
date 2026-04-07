import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';
import { GetVehicleQuery } from '../queries/get-vehicle.query';

@Injectable()
export class GetVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(query: GetVehicleQuery): Promise<VehicleEntity> {
    try {
      const vehicle = await this.vehicleRepository.findById(query.id);
      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
      return vehicle;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
