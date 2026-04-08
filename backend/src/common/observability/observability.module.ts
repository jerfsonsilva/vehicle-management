import { Global, Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsMonitor } from './domain/metrics-monitor';
import { PrometheusMetricsService } from './prometheus-metrics.service';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [
    PrometheusMetricsService,
    {
      provide: MetricsMonitor,
      useExisting: PrometheusMetricsService,
    },
  ],
  exports: [PrometheusMetricsService, MetricsMonitor],
})
export class ObservabilityModule {}
