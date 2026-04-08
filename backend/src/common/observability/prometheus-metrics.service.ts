import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';
import { MetricsMonitor } from './domain/metrics-monitor';

@Injectable()
export class PrometheusMetricsService extends MetricsMonitor {
  private readonly registry = new Registry();

  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDurationSeconds: Histogram<string>;
  private readonly csvRowsTotal: Counter<string>;
  private readonly csvParseDurationSeconds: Histogram<string>;
  private readonly importMessagesTotal: Counter<string>;
  private readonly importMessageProcessingDurationSeconds: Histogram<string>;
  private readonly queueMessagesGauge: Gauge<string>;
  private readonly queueMonitorErrorsTotal: Counter<string>;
  private readonly workerLoopActive: Gauge<string>;
  private readonly importStatusResponsesTotal: Counter<string>;
  private readonly importStatusDurationSeconds: Histogram<string>;
  private readonly importStatusStateGauge: Gauge<string>;

  constructor() {
    super();
    const service = process.env.OBS_SERVICE_NAME ?? 'vehicle-service';
    const app = process.env.OBS_APP_NAME ?? 'test-feedz';
    const env = process.env.NODE_ENV ?? 'development';
    const instance = process.env.HOSTNAME ?? 'local';

    this.registry.setDefaultLabels({
      service,
      app,
      env,
      instance,
    });

    collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new Counter({
      name: 'vehicle_http_requests_total',
      help: 'Total HTTP requests grouped by route',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });
    this.httpRequestDurationSeconds = new Histogram({
      name: 'vehicle_http_request_duration_seconds',
      help: 'HTTP request latency by route in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.csvRowsTotal = new Counter({
      name: 'vehicle_import_csv_rows_total',
      help: 'CSV rows received and row processing result',
      labelNames: ['outcome'],
      registers: [this.registry],
    });
    this.csvParseDurationSeconds = new Histogram({
      name: 'vehicle_import_csv_parse_duration_seconds',
      help: 'CSV parse and validation duration',
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.importMessagesTotal = new Counter({
      name: 'vehicle_import_messages_total',
      help: 'Imported message outcomes and stages',
      labelNames: ['stage', 'outcome', 'reason'],
      registers: [this.registry],
    });
    this.importMessageProcessingDurationSeconds = new Histogram({
      name: 'vehicle_import_message_processing_duration_seconds',
      help: 'Time to process one queue message',
      buckets: [0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
      registers: [this.registry],
    });

    this.queueMessagesGauge = new Gauge({
      name: 'vehicle_import_queue_messages',
      help: 'Queue message counts by state',
      labelNames: ['state'],
      registers: [this.registry],
    });
    this.queueMonitorErrorsTotal = new Counter({
      name: 'vehicle_import_queue_monitor_errors_total',
      help: 'Queue monitor errors',
      labelNames: ['operation'],
      registers: [this.registry],
    });

    this.workerLoopActive = new Gauge({
      name: 'vehicle_import_worker_loop_active',
      help: 'Worker loop status (1 active, 0 stopped)',
      registers: [this.registry],
    });

    this.importStatusResponsesTotal = new Counter({
      name: 'vehicle_import_status_responses_total',
      help: 'Import status endpoint response counts',
      labelNames: ['status'],
      registers: [this.registry],
    });
    this.importStatusDurationSeconds = new Histogram({
      name: 'vehicle_import_status_duration_seconds',
      help: 'Import status endpoint latency',
      buckets: [0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1, 2],
      registers: [this.registry],
    });
    this.importStatusStateGauge = new Gauge({
      name: 'vehicle_import_status_state',
      help: 'Last observed import status (1 selected state, 0 others)',
      labelNames: ['status'],
      registers: [this.registry],
    });
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  observeHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    const labels = {
      method,
      route,
      status_code: String(statusCode),
    };
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationSeconds);
  }

  incrementCsvRowsReceived(count: number): void {
    if (count > 0) {
      this.csvRowsTotal.inc({ outcome: 'received' }, count);
    }
  }

  incrementCsvRowsQueued(): void {
    this.csvRowsTotal.inc({ outcome: 'queued' });
  }

  incrementCsvRowsRejected(): void {
    this.csvRowsTotal.inc({ outcome: 'rejected' });
  }

  observeCsvParseDuration(durationSeconds: number): void {
    this.csvParseDurationSeconds.observe(durationSeconds);
  }

  incrementImportMessageConsumed(): void {
    this.importMessagesTotal.inc({
      stage: 'consume',
      outcome: 'received',
      reason: 'none',
    });
  }

  incrementImportMessageProcessed(success: boolean, reason: string): void {
    this.importMessagesTotal.inc({
      stage: 'process',
      outcome: success ? 'success' : 'failure',
      reason,
    });
  }

  observeImportMessageProcessingDuration(durationSeconds: number): void {
    this.importMessageProcessingDurationSeconds.observe(durationSeconds);
  }

  setQueueRuntimeStatus(visible: number, inFlight: number): void {
    this.queueMessagesGauge.set({ state: 'visible' }, visible);
    this.queueMessagesGauge.set({ state: 'in_flight' }, inFlight);
  }

  incrementQueueMonitorError(operation: string): void {
    this.queueMonitorErrorsTotal.inc({ operation });
  }

  setWorkerLoopActive(active: boolean): void {
    this.workerLoopActive.set(active ? 1 : 0);
  }

  observeImportStatus(status: string, durationSeconds: number): void {
    this.importStatusResponsesTotal.inc({ status });
    this.importStatusDurationSeconds.observe(durationSeconds);
    for (const value of ['idle', 'processing', 'completed']) {
      this.importStatusStateGauge.set(
        { status: value },
        value === status ? 1 : 0,
      );
    }
  }
}
