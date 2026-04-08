import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import {
  VehiclePaginatedResult,
  VehiclePaginationParams,
  VehicleRepository,
} from '../../domain/repositories/vehicle.repository';

export type ListVehiclesResult = {
  items: VehicleEntity[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class ListVehiclesUseCase {
  private readonly logger = new Logger(ListVehiclesUseCase.name);

  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(params: VehiclePaginationParams): Promise<ListVehiclesResult> {
    this.logger.log(
      `Listing vehicles page=${params.page} pageSize=${params.pageSize}`,
    );
    try {
      const result: VehiclePaginatedResult =
        await this.vehicleRepository.findAll(params);
      this.logger.log(
        `Vehicle list fetched items=${result.items.length} total=${result.total}`,
      );
      return {
        items: result.items,
        page: params.page,
        pageSize: params.pageSize,
        total: result.total,
        totalPages:
          result.total === 0 ? 0 : Math.ceil(result.total / params.pageSize),
      };
    } catch {
      this.logger.error(
        `Vehicle list failed page=${params.page} pageSize=${params.pageSize}`,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
