import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorUtil } from './prisma-error.util';

describe('PrismaErrorUtil', () => {
  it('should throw conflict for unique violation with target array', () => {
    const error = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['licensePlate'] },
    });

    expect(() => PrismaErrorUtil.throwIfUniqueViolation(error)).toThrow(
      ConflictException,
    );
  });

  it('should throw conflict for unique violation with fallback target', () => {
    const error = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: 'licensePlate' as unknown as string[] },
    });

    expect(() => PrismaErrorUtil.throwIfUniqueViolation(error)).toThrow(
      ConflictException,
    );
  });

  it('should not throw when error is not unique violation', () => {
    const error = new Error('other');
    expect(() => PrismaErrorUtil.throwIfUniqueViolation(error)).not.toThrow();
  });

  it('should throw not found for P2025', () => {
    const error = new Prisma.PrismaClientKnownRequestError('not found', {
      code: 'P2025',
      clientVersion: 'test',
    });

    expect(() => PrismaErrorUtil.throwIfNotFound(error, 'Vehicle')).toThrow(
      NotFoundException,
    );
  });

  it('should not throw for non P2025', () => {
    const error = new Error('other');
    expect(() => PrismaErrorUtil.throwIfNotFound(error, 'Vehicle')).not.toThrow();
  });
});
