import { MODULE_METADATA } from '@nestjs/common/constants';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

describe('PrismaModule', () => {
  it('should expose PrismaService', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, PrismaModule);
    const exportsMetadata = Reflect.getMetadata(MODULE_METADATA.EXPORTS, PrismaModule);

    expect(providers).toEqual([PrismaService]);
    expect(exportsMetadata).toEqual([PrismaService]);
  });
});
