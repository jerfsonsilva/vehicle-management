import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { ObservabilityModule } from '../common/observability/observability.module';
import { PrismaModule } from '../common/prisma/prisma.module';
import { CreateVehicleUseCase } from '../modules/vehicle/application/use-cases/create-vehicle.usecase';
import { ProcessVehicleImportMessageUseCase } from '../modules/vehicle/application/use-cases/process-vehicle-import-message.usecase';
import { VehicleRepository } from '../modules/vehicle/domain/repositories/vehicle.repository';
import { VehicleImportStatRepository } from '../modules/vehicle/domain/repositories/vehicle-import-stat.repository';
import { PrismaVehicleRepository } from '../modules/vehicle/infra/database/prisma-vehicle.repository';
import { PrismaVehicleImportStatRepository } from '../modules/vehicle/infra/database/prisma-vehicle-import-stat.repository';
import { SqsVehicleImportConsumerService } from '../modules/vehicle/infra/sqs/sqs-vehicle-import-consumer.service';
import { WorkerTcpController } from './worker-tcp.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule,
    PrismaModule,
  ],
  controllers: [WorkerTcpController],
  providers: [
    CreateVehicleUseCase,
    ProcessVehicleImportMessageUseCase,
    SqsVehicleImportConsumerService,
    {
      provide: VehicleRepository,
      useClass: PrismaVehicleRepository,
    },
    {
      provide: VehicleImportStatRepository,
      useClass: PrismaVehicleImportStatRepository,
    },
  ],
})
export class WorkerModule {
  static microserviceOptions() {
    const port = parseInt(process.env.IMPORT_WORKER_TCP_PORT ?? '39999', 10);
    return {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    };
  }
}
