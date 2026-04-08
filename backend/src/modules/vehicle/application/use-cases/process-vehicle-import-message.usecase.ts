import { Injectable, Logger } from '@nestjs/common';
import { MetricsMonitor } from '../../../../common/observability/domain/metrics-monitor';
import { CreateVehicleCommand } from '../commands/create-vehicle.command';
import { rowToVehicleImportPayload } from '../validators/vehicle-import-row.validator';
import { VehicleImportStatRepository } from '../../domain/repositories/vehicle-import-stat.repository';
import { CreateVehicleUseCase } from './create-vehicle.usecase';

@Injectable()
export class ProcessVehicleImportMessageUseCase {
  private readonly logger = new Logger(ProcessVehicleImportMessageUseCase.name);

  constructor(
    private readonly createVehicle: CreateVehicleUseCase,
    private readonly importStats: VehicleImportStatRepository,
    private readonly metrics: MetricsMonitor,
  ) {}

  async execute(rawBody: string, now: Date): Promise<boolean> {
    const startedAt = process.hrtime.bigint();
    this.logger.log('Processing import message');
    let success = false;
    let failureReason = 'none';

    try {
      const raw = JSON.parse(rawBody) as unknown;
      if (!raw || typeof raw !== 'object') {
        throw new SyntaxError('Invalid message shape');
      }

      const payload = rowToVehicleImportPayload(raw as Record<string, unknown>);
      if (!payload) {
        throw new SyntaxError('Invalid vehicle payload');
      }

      const command: CreateVehicleCommand = {
        licensePlate: payload.licensePlate,
        chassis: payload.chassis,
        registrationNumber: payload.registrationNumber,
        model: payload.model,
        brand: payload.brand,
        year: payload.year,
      };

      await this.createVehicle.execute(command);
      success = true;
      this.logger.log('Import message processed successfully');
    } catch (err) {
      failureReason =
        err instanceof Error && err.name ? err.name : 'processing_error';
      this.logger.warn(
        `Import message failed: ${err instanceof Error ? err.message : err}`,
      );
    }

    try {
      if (success) {
        await this.importStats.incrementSuccessForUtcDay(now);
        this.logger.log('Import success stats updated');
      } else {
        await this.importStats.incrementFailureForUtcDay(now);
        this.logger.log('Import failure stats updated');
      }
    } catch (statErr) {
      this.logger.error(
        'Failed to update import stats',
        statErr instanceof Error ? statErr.stack : statErr,
      );
    }

    this.metrics.incrementImportMessageProcessed(success, failureReason);
    const elapsedNs = Number(process.hrtime.bigint() - startedAt);
    this.metrics.observeImportMessageProcessingDuration(
      elapsedNs / 1_000_000_000,
    );

    return success;
  }
}
