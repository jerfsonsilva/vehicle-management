import {
  CreateQueueCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessVehicleImportMessageUseCase } from '../../application/use-cases/process-vehicle-import-message.usecase';

const POLL_CONFIG = {
  idleMs: 800,
  maxNumberOfMessages: 5,
  waitTimeSeconds: 10,
  visibilityTimeout: 60,
} as const;

type SqsMessage = NonNullable<ReceiveMessageCommandOutput['Messages']>[number];
@Injectable()
export class SqsVehicleImportConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SqsVehicleImportConsumerService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private readonly queueName: string;
  private stopped = false;
  private loopPromise: Promise<void> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly processMessage: ProcessVehicleImportMessageUseCase,
  ) {
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

  onModuleInit(): void {
    this.loopPromise = this.start();
  }

  onModuleDestroy(): void {
    this.stopped = true;
  }

  private async start(): Promise<void> {
    await this.ensureQueueExists();
    await this.runLoop();
  }

  private async runLoop(): Promise<void> {
    while (!this.stopped) {
      await this.pollOnce();
    }
  }

  private async pollOnce(): Promise<void> {
    try {
      const messages = await this.receiveMessages();
      await this.processReceivedMessages(messages);
    } catch (err) {
      await this.handlePollError(err);
    }
  }

  private async receiveMessages(): Promise<SqsMessage[]> {
    const out = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: POLL_CONFIG.maxNumberOfMessages,
        WaitTimeSeconds: POLL_CONFIG.waitTimeSeconds,
        VisibilityTimeout: POLL_CONFIG.visibilityTimeout,
      }),
    );
    return out.Messages ?? [];
  }

  private async processReceivedMessages(messages: SqsMessage[]): Promise<void> {
    if (messages.length === 0) {
      await this.sleep(POLL_CONFIG.idleMs);
      return;
    }

    for (const msg of messages) {
      if (!msg.Body || !msg.ReceiptHandle) {
        continue;
      }
      await this.handleOne(msg.Body, msg.ReceiptHandle);
    }
  }

  private async handlePollError(err: unknown): Promise<void> {
    if (this.isQueueDoesNotExistError(err)) {
      this.logger.warn('Queue not found, recreating and retrying...');
      await this.ensureQueueExists();
      await this.sleep(POLL_CONFIG.idleMs);
      return;
    }

    this.logger.error('SQS poll error', err instanceof Error ? err.stack : err);
    await this.sleep(POLL_CONFIG.idleMs);
  }

  private isQueueDoesNotExistError(err: unknown): boolean {
    return (
      !!err &&
      typeof err === 'object' &&
      'name' in err &&
      err.name === 'QueueDoesNotExist'
    );
  }

  private async handleOne(body: string, receiptHandle: string): Promise<void> {
    await this.processMessage.execute(body, new Date());

    try {
      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: receiptHandle,
        }),
      );
    } catch (delErr) {
      this.logger.error(
        'Failed to delete SQS message',
        delErr instanceof Error ? delErr.stack : delErr,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractQueueName(queueUrl: string): string {
    const name = queueUrl.split('/').pop()?.trim();
    if (!name) {
      throw new Error('Invalid SQS_IMPORT_QUEUE_URL: queue name missing');
    }
    return name;
  }

  private async ensureQueueExists(): Promise<void> {
    await this.client.send(
      new CreateQueueCommand({
        QueueName: this.queueName,
      }),
    );
    this.logger.log(`Queue ensured: ${this.queueName}`);
  }
}
