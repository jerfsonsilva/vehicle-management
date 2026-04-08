import { Injectable, Logger } from '@nestjs/common';
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
  ) {}

  async execute(rawBody: string, now: Date): Promise<boolean> {
    let success = false;

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
    } catch (err) {
      this.logger.warn(
        `Import message failed: ${err instanceof Error ? err.message : err}`,
      );
    }

    try {
      if (success) {
        await this.importStats.incrementSuccessForUtcDay(now);
      } else {
        await this.importStats.incrementFailureForUtcDay(now);
      }
    } catch (statErr) {
      this.logger.error(
        'Failed to update import stats',
        statErr instanceof Error ? statErr.stack : statErr,
      );
    }

    return success;
  }
}
