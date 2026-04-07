import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

@Injectable()
export class ListVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(): Promise<VehicleEntity[]> {
    try {
      return await this.vehicleRepository.findAll();
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
