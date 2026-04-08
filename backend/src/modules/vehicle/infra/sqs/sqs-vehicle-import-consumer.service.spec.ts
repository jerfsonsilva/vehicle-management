import { ConfigService } from '@nestjs/config';
import { PrometheusMetricsService } from '../../../../common/observability/prometheus-metrics.service';
import { ProcessVehicleImportMessageUseCase } from '../../application/use-cases/process-vehicle-import-message.usecase';
import { SqsVehicleImportConsumerService } from './sqs-vehicle-import-consumer.service';

describe('SqsVehicleImportConsumerService', () => {
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

  function makeService() {
    const processMessage = {
      execute: jest.fn().mockResolvedValue(true),
    } as unknown as ProcessVehicleImportMessageUseCase;
    const metrics = {
      setWorkerLoopActive: jest.fn(),
      incrementImportMessageConsumed: jest.fn(),
    } as unknown as PrometheusMetricsService;
    const service = new SqsVehicleImportConsumerService(
      makeConfig(),
      processMessage,
      metrics,
    );
    const send = jest.fn().mockResolvedValue({});
    const sleep = jest.fn().mockResolvedValue(undefined);
    const logger = {
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    };

    (service as unknown as { client: { send: typeof send } }).client = { send };
    (service as unknown as { sleep: typeof sleep }).sleep = sleep;
    (service as unknown as { logger: typeof logger }).logger = logger;

    return { service, processMessage, send, sleep, logger };
  }

  it('processes only valid SQS messages', async () => {
    const { service, processMessage, send } = makeService();

    await (
      service as unknown as {
        processReceivedMessages: (messages: unknown[]) => Promise<void>;
      }
    ).processReceivedMessages([
      { Body: 'body-1', ReceiptHandle: 'r1' },
      { Body: '', ReceiptHandle: 'r2' },
      { ReceiptHandle: 'r3' },
    ]);

    expect(processMessage.execute).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('sleeps when there are no messages', async () => {
    const { service, sleep } = makeService();

    await (
      service as unknown as {
        processReceivedMessages: (messages: unknown[]) => Promise<void>;
      }
    ).processReceivedMessages([]);

    expect(sleep).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(800);
  });

  it('recreates queue on QueueDoesNotExist error', async () => {
    const { service, sleep, logger } = makeService();
    const ensureQueueExists = jest.fn().mockResolvedValue(undefined);
    (
      service as unknown as { ensureQueueExists: typeof ensureQueueExists }
    ).ensureQueueExists = ensureQueueExists;

    await (
      service as unknown as {
        handlePollError: (err: unknown) => Promise<void>;
      }
    ).handlePollError({ name: 'QueueDoesNotExist' });

    expect(ensureQueueExists).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(800);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('logs generic polling error and sleeps', async () => {
    const { service, sleep, logger } = makeService();
    const err = new Error('poll failed');

    await (
      service as unknown as {
        handlePollError: (error: unknown) => Promise<void>;
      }
    ).handlePollError(err);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(sleep).toHaveBeenCalledWith(800);
  });
});
