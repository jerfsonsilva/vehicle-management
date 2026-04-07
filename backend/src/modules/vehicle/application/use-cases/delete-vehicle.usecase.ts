import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string): Promise<void> {
    try {
      await this.vehicleRepository.delete(id);
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
