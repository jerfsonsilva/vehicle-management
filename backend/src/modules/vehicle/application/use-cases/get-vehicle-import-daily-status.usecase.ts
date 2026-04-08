import { Injectable, Logger } from '@nestjs/common';
import { MetricsMonitor } from '../../../../common/observability/domain/metrics-monitor';
import { VehicleImportQueueMonitor } from '../../domain/contracts/vehicle-import-queue-monitor';
import { VehicleImportStatRepository } from '../../domain/repositories/vehicle-import-stat.repository';
import { startOfUtcDay } from '../../domain/utils/utc-day.util';

export enum VehicleImportStatus {
  Idle = 'idle',
  Processing = 'processing',
  Completed = 'completed',
}

export type VehicleImportDailyStatusResult = {
  successCount: number;
  failureCount: number;
  day: string;
  status: VehicleImportStatus;
};

@Injectable()
export class GetVehicleImportDailyStatusUseCase {
  private readonly logger = new Logger(GetVehicleImportDailyStatusUseCase.name);

  constructor(
    private readonly statRepository: VehicleImportStatRepository,
    private readonly queueMonitor: VehicleImportQueueMonitor,
    private readonly metrics: MetricsMonitor,
  ) {}

  async execute(dateInput?: string): Promise<VehicleImportDailyStatusResult> {
    const startedAt = process.hrtime.bigint();
    this.logger.log(
      `Fetching import daily status dateInput=${dateInput ?? 'today'}`,
    );
    const day =
      dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
        ? new Date(`${dateInput}T00:00:00.000Z`)
        : new Date();

    const normalized = startOfUtcDay(day);
    const snapshot = await this.statRepository.findByUtcDay(normalized);
    const runtimeStatus = await this.queueMonitor.getRuntimeStatus();
    const hasMessagesInQueue =
      runtimeStatus.visible + runtimeStatus.inFlight > 0;
    const hasProcessedMessagesToday =
      (snapshot?.successCount ?? 0) + (snapshot?.failureCount ?? 0) > 0;

    const status = hasMessagesInQueue
      ? VehicleImportStatus.Processing
      : hasProcessedMessagesToday
        ? VehicleImportStatus.Completed
        : VehicleImportStatus.Idle;

    this.logger.log(
      `Import daily status day=${normalized.toISOString().slice(0, 10)} status=${status} success=${snapshot?.successCount ?? 0} failure=${snapshot?.failureCount ?? 0} visible=${runtimeStatus.visible} inFlight=${runtimeStatus.inFlight}`,
    );
    const elapsedNs = Number(process.hrtime.bigint() - startedAt);
    this.metrics.observeImportStatus(status, elapsedNs / 1_000_000_000);

    return {
      successCount: snapshot?.successCount ?? 0,
      failureCount: snapshot?.failureCount ?? 0,
      day: normalized.toISOString().slice(0, 10),
      status,
    };
  }
}
