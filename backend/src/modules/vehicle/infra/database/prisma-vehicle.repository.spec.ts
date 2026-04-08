import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { VehicleEntity } from '../../domain/entities/vehicle.entity';
import { PrismaVehicleRepository } from './prisma-vehicle.repository';

describe('PrismaVehicleRepository', () => {
  let repository: PrismaVehicleRepository;
  let prismaMock: {
    vehicle: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      vehicle: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repository = new PrismaVehicleRepository(
      prismaMock as unknown as PrismaService,
    );
  });

  it('should create and map vehicle entity', async () => {
    prismaMock.vehicle.create.mockResolvedValue({
      id: 'id-1',
      licensePlate: 'ABC1D23',
      chassis: '9BWZZZ377VT004251',
      registrationNumber: '12345678901',
      model: 'Onix',
      brand: 'Chevrolet',
      year: 2022,
    });

    const result = await repository.create(
      new VehicleEntity(
        'id-1',
        'ABC1D23',
        '9BWZZZ377VT004251',
        '12345678901',
        'Onix',
        'Chevrolet',
        2022,
      ),
    );

    expect(result).toBeInstanceOf(VehicleEntity);
    expect(result.id).toBe('id-1');
    expect(prismaMock.vehicle.create).toHaveBeenCalledTimes(1);
  });

  it('should throw conflict on unique violation (P2002)', async () => {
    prismaMock.vehicle.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['licensePlate'] },
      }),
    );

    await expect(
      repository.create(
        new VehicleEntity(
          'id-1',
          'ABC1D23',
          '9BWZZZ377VT004251',
          '12345678901',
          'Onix',
          'Chevrolet',
          2022,
        ),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should rethrow unknown create error', async () => {
    const unknown = new Error('unknown');
    prismaMock.vehicle.create.mockRejectedValue(unknown);

    await expect(
      repository.create(
        new VehicleEntity(
          'id-1',
          'ABC1D23',
          '9BWZZZ377VT004251',
          '12345678901',
          'Onix',
          'Chevrolet',
          2022,
        ),
      ),
    ).rejects.toBe(unknown);
  });

  it('should return null when findById does not find record', async () => {
    prismaMock.vehicle.findUnique.mockResolvedValue(null);

    const result = await repository.findById('id-404');

    expect(result).toBeNull();
  });

  it('should return paginated mapped list on findAll', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue([
      {
        id: 'id-1',
        licensePlate: 'ABC1D23',
        chassis: '9BWZZZ377VT004251',
        registrationNumber: '12345678901',
        model: 'Onix',
        brand: 'Chevrolet',
        year: 2022,
      },
      {
        id: 'id-2',
        licensePlate: 'XYZ1A11',
        chassis: '9BWZZZ377VT004252',
        registrationNumber: '12345678902',
        model: 'HB20',
        brand: 'Hyundai',
        year: 2023,
      },
    ]);
    prismaMock.vehicle.count.mockResolvedValue(2);

    const result = await repository.findAll({ page: 2, pageSize: 10 });

    expect(prismaMock.vehicle.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(prismaMock.vehicle.count).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toBeInstanceOf(VehicleEntity);
  });

  it('should return empty list on findAll when no records', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue([]);
    prismaMock.vehicle.count.mockResolvedValue(0);

    const result = await repository.findAll({ page: 1, pageSize: 10 });

    expect(result).toEqual({ items: [], total: 0 });
  });

  it('should return empty list on findAll when prisma returns null-ish', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue(null);
    prismaMock.vehicle.count.mockResolvedValue(0);

    const result = await repository.findAll({ page: 1, pageSize: 10 });

    expect(result).toEqual({ items: [], total: 0 });
  });

  it('should rethrow unknown findAll error', async () => {
    const unknown = new Error('unknown');
    prismaMock.vehicle.findMany.mockRejectedValue(unknown);

    await expect(repository.findAll({ page: 1, pageSize: 10 })).rejects.toBe(
      unknown,
    );
  });

  it('should throw not found on update with missing record (P2025)', async () => {
    prismaMock.vehicle.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(
      repository.update(
        new VehicleEntity(
          'id-404',
          'ABC1D23',
          '9BWZZZ377VT004251',
          '12345678901',
          'Onix',
          'Chevrolet',
          2022,
        ),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should rethrow unknown update error', async () => {
    const unknown = new Error('unknown');
    prismaMock.vehicle.update.mockRejectedValue(unknown);

    await expect(
      repository.update(
        new VehicleEntity(
          'id-404',
          'ABC1D23',
          '9BWZZZ377VT004251',
          '12345678901',
          'Onix',
          'Chevrolet',
          2022,
        ),
      ),
    ).rejects.toBe(unknown);
  });

  it('should throw not found on delete with missing record (P2025)', async () => {
    prismaMock.vehicle.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    await expect(repository.delete('id-404')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should rethrow unknown delete error', async () => {
    const unknown = new Error('unknown');
    prismaMock.vehicle.delete.mockRejectedValue(unknown);

    await expect(repository.delete('id-1')).rejects.toBe(unknown);
  });
});
