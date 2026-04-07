import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    VeiculosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
