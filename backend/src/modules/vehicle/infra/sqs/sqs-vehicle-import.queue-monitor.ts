import { GetQueueAttributesCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  VehicleImportQueueMonitor,
  VehicleImportQueueRuntimeStatus,
} from '../../domain/ports/vehicle-import-queue-monitor';

@Injectable()
export class SqsVehicleImportQueueMonitor extends VehicleImportQueueMonitor {
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly config: ConfigService) {
    super();
    const region = this.config.getOrThrow<string>('AWS_REGION');
    const endpoint = this.config.get<string>('SQS_ENDPOINT');
    this.queueUrl = this.config.getOrThrow<string>('SQS_IMPORT_QUEUE_URL');
    this.client = new SQSClient({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async getRuntimeStatus(): Promise<VehicleImportQueueRuntimeStatus> {
    const out = await this.client.send(
      new GetQueueAttributesCommand({
        QueueUrl: this.queueUrl,
        AttributeNames: [
          'ApproximateNumberOfMessages',
          'ApproximateNumberOfMessagesNotVisible',
        ],
      }),
    );

    const visible = parseInt(
      out.Attributes?.ApproximateNumberOfMessages ?? '0',
      10,
    );
    const inFlight = parseInt(
      out.Attributes?.ApproximateNumberOfMessagesNotVisible ?? '0',
      10,
    );

    return {
      visible: Number.isNaN(visible) ? 0 : visible,
      inFlight: Number.isNaN(inFlight) ? 0 : inFlight,
    };
  }
}
