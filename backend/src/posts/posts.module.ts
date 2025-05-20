import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryProvider } from 'src/cloudinary/cloudinary.provider';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, CloudinaryProvider],
})
export class PostsModule {}
