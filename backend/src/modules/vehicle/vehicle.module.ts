import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EnqueueVehicleImportFromCsvUseCase } from './application/use-cases/enqueue-vehicle-import-from-csv.usecase';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.usecase';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.usecase';
import { GetVehicleImportDailyStatusUseCase } from './application/use-cases/get-vehicle-import-daily-status.usecase';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.usecase';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.usecase';
import { ProcessVehicleImportMessageUseCase } from './application/use-cases/process-vehicle-import-message.usecase';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.usecase';
import { VehicleImportQueueMonitor } from './domain/contracts/vehicle-import-queue-monitor';
import { VehicleImportQueue } from './domain/contracts/vehicle-import.queue';
import { VehicleImportStatRepository } from './domain/repositories/vehicle-import-stat.repository';
import { VehicleRepository } from './domain/repositories/vehicle.repository';
import { PrismaVehicleImportStatRepository } from './infra/database/prisma-vehicle-import-stat.repository';
import { PrismaVehicleRepository } from './infra/database/prisma-vehicle.repository';
import { SqsVehicleImportQueueMonitor } from './infra/sqs/sqs-vehicle-import.queue-monitor';
import { SqsVehicleImportQueue } from './infra/sqs/sqs-vehicle-import.queue';
import { VehicleImportController } from './presentation/vehicle-import.controller';
import { VehicleController } from './presentation/vehicle.controller';

@Module({
  controllers: [VehicleController, VehicleImportController],
  providers: [
    PrismaService,
    CreateVehicleUseCase,
    ListVehiclesUseCase,
    GetVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    EnqueueVehicleImportFromCsvUseCase,
    ProcessVehicleImportMessageUseCase,
    GetVehicleImportDailyStatusUseCase,
    {
      provide: VehicleRepository,
      useClass: PrismaVehicleRepository,
    },
    {
      provide: VehicleImportQueue,
      useClass: SqsVehicleImportQueue,
    },
    {
      provide: VehicleImportQueueMonitor,
      useClass: SqsVehicleImportQueueMonitor,
    },
    {
      provide: VehicleImportStatRepository,
      useClass: PrismaVehicleImportStatRepository,
    },
  ],
})
export class VehicleModule {}
