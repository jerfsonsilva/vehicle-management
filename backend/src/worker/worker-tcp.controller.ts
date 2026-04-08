import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class WorkerTcpController {
  @MessagePattern({ cmd: 'ping' })
  ping(): { ok: boolean } {
    return { ok: true };
  }
}
