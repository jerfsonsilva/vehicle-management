import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObservabilityModule } from './common/observability/observability.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule,
    PrismaModule,
    VehicleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
