import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { MetricsMonitor } from '../../../../common/observability/domain/metrics-monitor';
import { VehicleImportQueue } from '../../domain/contracts/vehicle-import.queue';
import { rowToVehicleImportPayload } from '../validators/vehicle-import-row.validator';

export type EnqueueVehicleImportFromCsvResult = {
  queuedCount: number;
  rejectedRowCount: number;
};

enum EnqueueRowStatus {
  Queued = 'queued',
  Rejected = 'rejected',
}

@Injectable()
export class EnqueueVehicleImportFromCsvUseCase {
  private static readonly ENQUEUE_BATCH_SIZE = 20;
  private readonly logger = new Logger(EnqueueVehicleImportFromCsvUseCase.name);

  constructor(
    private readonly importQueue: VehicleImportQueue,
    private readonly metrics: MetricsMonitor,
  ) {}

  async execute(csvBuffer: Buffer): Promise<EnqueueVehicleImportFromCsvResult> {
    const startedAt = process.hrtime.bigint();
    this.logger.log('Starting CSV import enqueue');
    const text = csvBuffer.toString('utf8');
    const parsed = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      cast: (value, context) => {
        if (context.column === 'year') {
          const n = parseInt(String(value), 10);
          return Number.isNaN(n) ? value : n;
        }
        return value;
      },
    });
    const records = Array.isArray(parsed) ? parsed : [];
    this.metrics.incrementCsvRowsReceived(records.length);
    this.logger.log(`Parsed CSV rows=${records.length}`);

    let queuedCount = 0;
    let rejectedRowCount = 0;

    for (
      let offset = 0;
      offset < records.length;
      offset += EnqueueVehicleImportFromCsvUseCase.ENQUEUE_BATCH_SIZE
    ) {
      const batch = records.slice(
        offset,
        offset + EnqueueVehicleImportFromCsvUseCase.ENQUEUE_BATCH_SIZE,
      );
      const results = await Promise.all(
        batch.map((row) => this.processRow(row)),
      );
      ({ queuedCount, rejectedRowCount } = this.accumulateBatchResult(
        results,
        queuedCount,
        rejectedRowCount,
      ));
    }

    this.logger.log(
      `CSV enqueue finished queued=${queuedCount} rejected=${rejectedRowCount}`,
    );
    const elapsedNs = Number(process.hrtime.bigint() - startedAt);
    this.metrics.observeCsvParseDuration(elapsedNs / 1_000_000_000);
    return { queuedCount, rejectedRowCount };
  }

  private accumulateBatchResult(
    results: EnqueueRowStatus[],
    queuedCount: number,
    rejectedRowCount: number,
  ): EnqueueVehicleImportFromCsvResult {
    for (const result of results) {
      if (result === EnqueueRowStatus.Queued) {
        queuedCount += 1;
        this.metrics.incrementCsvRowsQueued();
      } else {
        rejectedRowCount += 1;
        this.metrics.incrementCsvRowsRejected();
      }
    }
    return { queuedCount, rejectedRowCount };
  }

  private async processRow(row: unknown): Promise<EnqueueRowStatus> {
    if (!row || typeof row !== 'object') {
      return EnqueueRowStatus.Rejected;
    }

    const payload = rowToVehicleImportPayload(row as Record<string, unknown>);
    if (!payload) {
      return EnqueueRowStatus.Rejected;
    }

    try {
      await this.importQueue.enqueue(payload);
      return EnqueueRowStatus.Queued;
    } catch {
      return EnqueueRowStatus.Rejected;
    }
  }
}
