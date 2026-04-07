import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should connect on module init', async () => {
    const service = new PrismaService();
    const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
  });
});
