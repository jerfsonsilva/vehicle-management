import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TcpOptions } from '@nestjs/microservices';
import { PrometheusMetricsService } from './common/observability/prometheus-metrics.service';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  const metrics = app.get(PrometheusMetricsService);
  app.connectMicroservice(WorkerModule.microserviceOptions() as TcpOptions);
  await app.startAllMicroservices();

  const tcpPort = process.env.IMPORT_WORKER_TCP_PORT ?? '39999';

  Logger.log(`Worker TCP microservice on 0.0.0.0:${tcpPort}`, 'Bootstrap');
  Logger.log('SQS vehicle import consumer started', 'Bootstrap');

  await app.init();
  const metricsPort = parseInt(
    process.env.IMPORT_WORKER_METRICS_PORT ?? '9100',
    10,
  );
  await app.listen(metricsPort, '0.0.0.0');
  metrics.setWorkerLoopActive(true);
  Logger.log(
    `Worker metrics endpoint on 0.0.0.0:${metricsPort}/metrics`,
    'Bootstrap',
  );
}

void bootstrap();
