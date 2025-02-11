import { Module } from '@nestjs/common';
import { KolController } from './kol.controller';
import { KolService } from './kol.service';
import { KolRepository } from './kol.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [KolController],
  providers: [KolService, KolRepository],
  exports: [KolService],
})
export class KolModule {}
