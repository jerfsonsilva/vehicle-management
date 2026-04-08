import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  VehicleImportDailyStatSnapshot,
  VehicleImportStatRepository,
} from '../../domain/repositories/vehicle-import-stat.repository';
import { startOfUtcDay } from '../../domain/utils/utc-day.util';

@Injectable()
export class PrismaVehicleImportStatRepository extends VehicleImportStatRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUtcDay(
    day: Date,
  ): Promise<VehicleImportDailyStatSnapshot | null> {
    const normalized = startOfUtcDay(day);
    const row = await this.prisma.vehicleImportDailyStat.findUnique({
      where: { day: normalized },
    });
    if (!row) {
      return null;
    }
    return {
      successCount: row.successCount,
      failureCount: row.failureCount,
    };
  }

  async incrementSuccessForUtcDay(day: Date): Promise<void> {
    const normalized = startOfUtcDay(day);
    await this.prisma.vehicleImportDailyStat.upsert({
      where: { day: normalized },
      create: {
        id: randomUUID(),
        day: normalized,
        successCount: 1,
        failureCount: 0,
      },
      update: {
        successCount: { increment: 1 },
      },
    });
  }

  async incrementFailureForUtcDay(day: Date): Promise<void> {
    const normalized = startOfUtcDay(day);
    await this.prisma.vehicleImportDailyStat.upsert({
      where: { day: normalized },
      create: {
        id: randomUUID(),
        day: normalized,
        successCount: 0,
        failureCount: 1,
      },
      update: {
        failureCount: { increment: 1 },
      },
    });
  }
}
