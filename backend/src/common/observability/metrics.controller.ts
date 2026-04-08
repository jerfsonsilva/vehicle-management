import {
  Controller,
  Get,
  Header,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { PrometheusMetricsService } from './prometheus-metrics.service';

@Controller()
export class MetricsController {
  constructor(private readonly metrics: PrometheusMetricsService) {}

  @Get('metrics')
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.metrics.getMetrics();
  }
}
