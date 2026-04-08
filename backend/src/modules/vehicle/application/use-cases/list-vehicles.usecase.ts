import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  async execute(params: VehiclePaginationParams): Promise<ListVehiclesResult> {
    try {
      const result: VehiclePaginatedResult =
        await this.vehicleRepository.findAll(params);
      return {
        items: result.items,
        page: params.page,
        pageSize: params.pageSize,
        total: result.total,
        totalPages:
          result.total === 0 ? 0 : Math.ceil(result.total / params.pageSize),
      };
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
