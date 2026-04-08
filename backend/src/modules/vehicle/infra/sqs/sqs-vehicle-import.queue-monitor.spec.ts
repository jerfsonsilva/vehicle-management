import { ConfigService } from '@nestjs/config';
import { PrometheusMetricsService } from '../../../../common/observability/prometheus-metrics.service';
import { SqsVehicleImportQueueMonitor } from './sqs-vehicle-import.queue-monitor';

describe('SqsVehicleImportQueueMonitor', () => {
  const baseConfig: Record<string, string> = {
    AWS_REGION: 'us-east-1',
    SQS_ENDPOINT: 'http://localhost:4566',
    SQS_IMPORT_QUEUE_URL: 'http://localhost:4566/000000000000/vehicle-import',
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
  };

  function makeConfig(): ConfigService {
    return {
      get: jest.fn((key: string) => baseConfig[key]),
      getOrThrow: jest.fn((key: string) => {
        const value = baseConfig[key];
        if (!value) {
          throw new Error(`Missing ${key}`);
        }
        return value;
      }),
    } as unknown as ConfigService;
  }

  it('returns parsed visible and in-flight counts', async () => {
    const metrics = {
      setQueueRuntimeStatus: jest.fn(),
      incrementQueueMonitorError: jest.fn(),
    } as unknown as PrometheusMetricsService;
    const monitor = new SqsVehicleImportQueueMonitor(makeConfig(), metrics);
    const send = jest.fn().mockResolvedValue({
      Attributes: {
        ApproximateNumberOfMessages: '3',
        ApproximateNumberOfMessagesNotVisible: '2',
      },
    });
    (monitor as unknown as { client: { send: typeof send } }).client = { send };

    const result = await monitor.getRuntimeStatus();

    expect(result).toEqual({ visible: 3, inFlight: 2 });
  });

  it('falls back to zero for missing or invalid attributes', async () => {
    const metrics = {
      setQueueRuntimeStatus: jest.fn(),
      incrementQueueMonitorError: jest.fn(),
    } as unknown as PrometheusMetricsService;
    const monitor = new SqsVehicleImportQueueMonitor(makeConfig(), metrics);
    const send = jest.fn().mockResolvedValue({
      Attributes: {
        ApproximateNumberOfMessages: 'x',
      },
    });
    (monitor as unknown as { client: { send: typeof send } }).client = { send };

    const result = await monitor.getRuntimeStatus();

    expect(result).toEqual({ visible: 0, inFlight: 0 });
  });
});
