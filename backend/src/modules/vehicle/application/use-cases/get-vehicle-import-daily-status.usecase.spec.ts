import { VehicleImportQueueMonitor } from '../../domain/ports/vehicle-import-queue-monitor';
import { VehicleImportStatRepository } from '../../domain/repositories/vehicle-import-stat.repository';
import {
  GetVehicleImportDailyStatusUseCase,
  VehicleImportStatus,
} from './get-vehicle-import-daily-status.usecase';

describe('GetVehicleImportDailyStatusUseCase', () => {
  let useCase: GetVehicleImportDailyStatusUseCase;
  let statRepository: jest.Mocked<VehicleImportStatRepository>;
  let queueMonitor: jest.Mocked<VehicleImportQueueMonitor>;

  beforeEach(() => {
    statRepository = {
      findByUtcDay: jest.fn(),
      incrementSuccessForUtcDay: jest.fn(),
      incrementFailureForUtcDay: jest.fn(),
    };
    queueMonitor = {
      getRuntimeStatus: jest.fn(),
    } as unknown as jest.Mocked<VehicleImportQueueMonitor>;
    useCase = new GetVehicleImportDailyStatusUseCase(
      statRepository,
      queueMonitor,
    );
  });

  it('returns processing status when queue has pending or in-flight messages', async () => {
    statRepository.findByUtcDay.mockResolvedValue({
      successCount: 7,
      failureCount: 2,
    });
    queueMonitor.getRuntimeStatus.mockResolvedValue({
      visible: 1,
      inFlight: 0,
    });

    const result = await useCase.execute('2026-04-08');

    expect(statRepository.findByUtcDay).toHaveBeenCalledWith(
      new Date('2026-04-08T00:00:00.000Z'),
    );
    expect(result).toEqual({
      successCount: 7,
      failureCount: 2,
      day: '2026-04-08',
      status: VehicleImportStatus.Processing,
    });
  });

  it('returns completed status when queue is empty and day has processed items', async () => {
    statRepository.findByUtcDay.mockResolvedValue({
      successCount: 2,
      failureCount: 1,
    });
    queueMonitor.getRuntimeStatus.mockResolvedValue({
      visible: 0,
      inFlight: 0,
    });

    const result = await useCase.execute('2026-04-09');

    expect(result).toEqual({
      successCount: 2,
      failureCount: 1,
      day: '2026-04-09',
      status: VehicleImportStatus.Completed,
    });
  });

  it('returns idle status when no snapshot and queue is empty', async () => {
    statRepository.findByUtcDay.mockResolvedValue(null);
    queueMonitor.getRuntimeStatus.mockResolvedValue({
      visible: 0,
      inFlight: 0,
    });

    const result = await useCase.execute('2026-04-10');

    expect(result).toEqual({
      successCount: 0,
      failureCount: 0,
      day: '2026-04-10',
      status: VehicleImportStatus.Idle,
    });
  });

  it('uses current UTC day when date input is invalid', async () => {
    statRepository.findByUtcDay.mockResolvedValue(null);
    queueMonitor.getRuntimeStatus.mockResolvedValue({
      visible: 0,
      inFlight: 0,
    });
    const now = new Date('2026-04-10T15:30:00.000Z');
    jest.useFakeTimers().setSystemTime(now.getTime());
    try {
      const result = await useCase.execute('invalid-date');

      expect(statRepository.findByUtcDay).toHaveBeenCalledWith(
        new Date('2026-04-10T00:00:00.000Z'),
      );
      expect(result.day).toBe('2026-04-10');
      expect(result.status).toBe(VehicleImportStatus.Idle);
    } finally {
      jest.useRealTimers();
    }
  });
});
