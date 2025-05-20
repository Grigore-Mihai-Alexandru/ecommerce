
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Express } from 'express';
import { AuthGuard } from 'src/auth/guards/auth-guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  //upload image to cloudinary but need userId to save in db
  
  // to upload sommething u need to be logged in
  // so it uses the token for permission
  // /upload/profile-picture
  @UseGuards(AuthGuard)
  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Request() req , @UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadProfilePicture(req.user ,file);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }


  // to upload sommething u need to be logged in
  // so it uses the token for permission
  // /upload/posts/:postId
  @UseGuards(AuthGuard)
  @Post('posts/:postId')
  @UseInterceptors(FileInterceptor('file'))
  async uploade(@Param("postId") postId, @Request() req, @UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.uploadImageToPost(parseInt(postId),req.user ,file);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  
  // /upload/profile-picture/update
  @UseGuards(AuthGuard)
  @Patch('profile-picture/update')
  @UseInterceptors(FileInterceptor('file'))
  async updateProfilePicture(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const result = await this.uploadService.updateProfilePicture(req.user, file);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }
  
  // /upload/posts/:publicId
  @UseGuards(AuthGuard)
  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string, @Request() req) {
    const success = await this.uploadService.deleteImage(publicId, {
      userEmail: req.user.email,
    });
    return { success };
  }
  
}
