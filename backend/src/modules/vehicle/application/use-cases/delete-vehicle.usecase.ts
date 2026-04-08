import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { VehicleRepository } from '../../domain/repositories/vehicle.repository';

@Injectable()
export class DeleteVehicleUseCase {
  private readonly logger = new Logger(DeleteVehicleUseCase.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(id: string): Promise<void> {
    this.logger.log(`Deleting vehicle id=${id}`);
    try {
      await this.vehicleRepository.delete(id);
      this.logger.log(`Vehicle deleted id=${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Vehicle not found for delete id=${id}`);
        throw error;
      }
      this.logger.error(
        `Vehicle delete failed id=${id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
