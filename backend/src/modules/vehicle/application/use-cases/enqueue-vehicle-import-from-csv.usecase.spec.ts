import { Test, TestingModule } from '@nestjs/testing';
import {
  VehicleImportQueue,
  VehicleImportQueuePayload,
} from '../../domain/ports/vehicle-import.queue';
import { EnqueueVehicleImportFromCsvUseCase } from './enqueue-vehicle-import-from-csv.usecase';

describe('EnqueueVehicleImportFromCsvUseCase', () => {
  let useCase: EnqueueVehicleImportFromCsvUseCase;
  const enqueued: unknown[] = [];
  let mockEnqueue: jest.Mock;

  beforeEach(async () => {
    enqueued.length = 0;
    mockEnqueue = jest.fn((p: VehicleImportQueuePayload) => {
      enqueued.push(p);
      return Promise.resolve();
    });
    const mockQueue: VehicleImportQueue = {
      enqueue: mockEnqueue,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnqueueVehicleImportFromCsvUseCase,
        { provide: VehicleImportQueue, useValue: mockQueue },
      ],
    }).compile();

    useCase = module.get(EnqueueVehicleImportFromCsvUseCase);
  });

  it('queues valid rows and rejects invalid ones', async () => {
    const csv = [
      'licensePlate,chassis,registrationNumber,model,brand,year',
      'ABC1D23,1HGBH41JXMN109186,12345678901,Onix,Chevrolet,2022',
      'BADPLATE,1HGBH41JXMN109187,12345678902,Civic,Honda,2022',
    ].join('\n');

    const result = await useCase.execute(Buffer.from(csv, 'utf8'));

    expect(result.queuedCount).toBe(1);
    expect(result.rejectedRowCount).toBe(1);
    expect(enqueued).toHaveLength(1);
    expect(enqueued[0]).toMatchObject({
      licensePlate: 'ABC1D23',
      model: 'Onix',
    });
  });

  it('rejects row when queue enqueue fails', async () => {
    const csv = [
      'licensePlate,chassis,registrationNumber,model,brand,year',
      'ABC1D23,1HGBH41JXMN109186,12345678901,Onix,Chevrolet,2022',
    ].join('\n');
    mockEnqueue.mockRejectedValueOnce(new Error('queue unavailable'));

    const result = await useCase.execute(Buffer.from(csv, 'utf8'));

    expect(mockEnqueue).toHaveBeenCalledTimes(1);
    expect(result.queuedCount).toBe(0);
    expect(result.rejectedRowCount).toBe(1);
  });
});
