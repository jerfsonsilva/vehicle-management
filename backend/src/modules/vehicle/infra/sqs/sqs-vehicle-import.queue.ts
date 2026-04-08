import {
  CreateQueueCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  VehicleImportQueue,
  VehicleImportQueuePayload,
} from '../../domain/ports/vehicle-import.queue';

@Injectable()
export class SqsVehicleImportQueue extends VehicleImportQueue {
  private readonly logger = new Logger(SqsVehicleImportQueue.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private readonly queueName: string;
  private queueEnsured = false;

  constructor(private readonly config: ConfigService) {
    super();
    const region = this.config.getOrThrow<string>('AWS_REGION');
    const endpoint = this.config.get<string>('SQS_ENDPOINT');
    this.queueUrl = this.config.getOrThrow<string>('SQS_IMPORT_QUEUE_URL');
    this.queueName = this.extractQueueName(this.queueUrl);
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

  async enqueue(payload: VehicleImportQueuePayload): Promise<void> {
    await this.ensureQueueExists();
    const body = JSON.stringify(payload);
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: body,
      }),
    );
  }

  private extractQueueName(queueUrl: string): string {
    const name = queueUrl.split('/').pop()?.trim();
    if (!name) {
      throw new Error('Invalid SQS_IMPORT_QUEUE_URL: queue name missing');
    }
    return name;
  }

  private async ensureQueueExists(): Promise<void> {
    if (this.queueEnsured) {
      return;
    }
    await this.client.send(
      new CreateQueueCommand({
        QueueName: this.queueName,
      }),
    );
    this.queueEnsured = true;
    this.logger.log(`Queue ensured: ${this.queueName}`);
  }
}
