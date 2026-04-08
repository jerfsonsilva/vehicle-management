import { Injectable } from '@nestjs/common';
import { VehicleImportStatRepository } from '../../domain/repositories/vehicle-import-stat.repository';
import { startOfUtcDay } from '../../domain/utils/utc-day.util';

export type VehicleImportDailyStatusResult = {
  successCount: number;
  failureCount: number;
  day: string;
};

@Injectable()
export class GetVehicleImportDailyStatusUseCase {
  constructor(private readonly statRepository: VehicleImportStatRepository) {}

  async execute(dateInput?: string): Promise<VehicleImportDailyStatusResult> {
    const day =
      dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
        ? new Date(`${dateInput}T00:00:00.000Z`)
        : new Date();

    const normalized = startOfUtcDay(day);
    const snapshot = await this.statRepository.findByUtcDay(normalized);

    return {
      successCount: snapshot?.successCount ?? 0,
      failureCount: snapshot?.failureCount ?? 0,
      day: normalized.toISOString().slice(0, 10),
    };
  }
}
