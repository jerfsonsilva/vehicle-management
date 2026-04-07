import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class PrismaErrorUtil {
  static throwIfUniqueViolation(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : 'unique field';
      throw new ConflictException(`Duplicate value for: ${target}`);
    }
  }

  static throwIfNotFound(error: unknown, resourceName: string): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(`${resourceName} not found`);
    }
  }
}
