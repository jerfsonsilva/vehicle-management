import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { PrometheusMetricsService } from './common/observability/prometheus-metrics.service';

function getRouteLabel(req: Request): string {
  const routeCandidate: unknown = (req as Request & { route?: unknown }).route;
  if (
    routeCandidate &&
    typeof routeCandidate === 'object' &&
    'path' in routeCandidate
  ) {
    const pathCandidate = (routeCandidate as { path?: unknown }).path;
    if (typeof pathCandidate === 'string') {
      return pathCandidate;
    }
  }
  return req.path;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const metrics = app.get(PrometheusMetricsService);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
  });

  app.setGlobalPrefix('api', {
    exclude: ['metrics'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/metrics') {
      next();
      return;
    }

    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const elapsedNs = Number(process.hrtime.bigint() - startedAt);
      const elapsedSeconds = elapsedNs / 1_000_000_000;
      const route = getRouteLabel(req);
      metrics.observeHttpRequest(
        req.method,
        route,
        res.statusCode,
        elapsedSeconds,
      );
    });
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
