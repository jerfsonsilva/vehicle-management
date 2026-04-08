export abstract class MetricsMonitor {
  abstract getContentType(): string;
  abstract getMetrics(): Promise<string>;
  abstract observeHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void;
  abstract incrementCsvRowsReceived(count: number): void;
  abstract incrementCsvRowsQueued(): void;
  abstract incrementCsvRowsRejected(): void;
  abstract observeCsvParseDuration(durationSeconds: number): void;
  abstract incrementImportMessageConsumed(): void;
  abstract incrementImportMessageProcessed(
    success: boolean,
    reason: string,
  ): void;
  abstract observeImportMessageProcessingDuration(
    durationSeconds: number,
  ): void;
  abstract setQueueRuntimeStatus(visible: number, inFlight: number): void;
  abstract incrementQueueMonitorError(operation: string): void;
  abstract setWorkerLoopActive(active: boolean): void;
  abstract observeImportStatus(status: string, durationSeconds: number): void;
}
