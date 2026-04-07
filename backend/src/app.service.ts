import { Injectable } from '@nestjs/common';

type HealthResponse = {
  name: string;
  version: string;
};

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      name: 'Vehicle API',
      version: '1.0',
    };
  }
}
