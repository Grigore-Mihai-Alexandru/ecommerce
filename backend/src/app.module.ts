import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './db/prisma.module';
import { UploadModule } from './upload/upload.module';
import { PostsModule } from './posts/posts.module';
import { CategoryModule } from './category/category.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}), //load .env file
    UsersModule,
    AuthModule,
    PrismaModule,
    UploadModule,
    PostsModule,
    CategoryModule,
    SubcategoryModule,
    CommentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
