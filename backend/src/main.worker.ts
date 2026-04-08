import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TcpOptions } from '@nestjs/microservices';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  app.connectMicroservice(WorkerModule.microserviceOptions() as TcpOptions);
  await app.startAllMicroservices();

  const tcpPort = process.env.IMPORT_WORKER_TCP_PORT ?? '39999';

  Logger.log(`Worker TCP microservice on 0.0.0.0:${tcpPort}`, 'Bootstrap');
  Logger.log('SQS vehicle import consumer started', 'Bootstrap');

  await app.init();
}

void bootstrap();
