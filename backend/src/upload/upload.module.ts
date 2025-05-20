import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { PrismaModule } from 'src/db/prisma.module';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';
import { UploadController } from './upload.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService], // export so other modules can use it
})
export class UploadModule {}
