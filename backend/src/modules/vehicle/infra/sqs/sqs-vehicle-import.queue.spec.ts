import { ConfigService } from '@nestjs/config';
import { SqsVehicleImportQueue } from './sqs-vehicle-import.queue';

describe('SqsVehicleImportQueue', () => {
  const baseConfig: Record<string, string> = {
    AWS_REGION: 'us-east-1',
    SQS_ENDPOINT: 'http://localhost:4566',
    SQS_IMPORT_QUEUE_URL: 'http://localhost:4566/000000000000/vehicle-import',
    AWS_ACCESS_KEY_ID: 'test',
    AWS_SECRET_ACCESS_KEY: 'test',
  };

  function makeConfig(overrides?: Record<string, string>): ConfigService {
    const values: Record<string, string> = {
      ...baseConfig,
      ...(overrides ?? {}),
    };
    return {
      get: jest.fn((key: string) => values[key]),
      getOrThrow: jest.fn((key: string) => {
        const value = values[key];
        if (!value) {
          throw new Error(`Missing ${key}`);
        }
        return value;
      }),
    } as unknown as ConfigService;
  }

  it('ensures queue once and sends message', async () => {
    const queue = new SqsVehicleImportQueue(makeConfig());
    const send = jest.fn().mockResolvedValue({});
    (queue as unknown as { client: { send: typeof send } }).client = { send };
    (queue as unknown as { logger: { log: jest.Mock } }).logger = {
      log: jest.fn(),
    };

    await queue.enqueue({
      licensePlate: 'ABC1D23',
      chassis: '1HGBH41JXMN109186',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });
    await queue.enqueue({
      licensePlate: 'DEF1G23',
      chassis: '1HGBH41JXMN109187',
      registrationNumber: '12345678902',
      model: 'City',
      brand: 'Honda',
      year: 2023,
    });

    expect(send).toHaveBeenCalledTimes(3);
    const firstCommand = send.mock.calls[0][0] as {
      input?: { QueueName?: string };
    };
    const secondCommand = send.mock.calls[1][0] as {
      input?: { QueueUrl?: string; MessageBody?: string };
    };
    const thirdCommand = send.mock.calls[2][0] as {
      input?: { QueueUrl?: string; MessageBody?: string };
    };

    expect(firstCommand.input?.QueueName).toBe('vehicle-import');
    expect(secondCommand.input?.QueueUrl).toBe(baseConfig.SQS_IMPORT_QUEUE_URL);
    expect(thirdCommand.input?.QueueUrl).toBe(baseConfig.SQS_IMPORT_QUEUE_URL);
  });

  it('throws when queue URL has no queue name', () => {
    expect(
      () =>
        new SqsVehicleImportQueue(
          makeConfig({ SQS_IMPORT_QUEUE_URL: 'http://localhost:4566/' }),
        ),
    ).toThrow('Invalid SQS_IMPORT_QUEUE_URL: queue name missing');
  });
});
