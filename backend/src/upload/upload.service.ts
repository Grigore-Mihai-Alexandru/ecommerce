import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { PrismaService } from 'src/db/prisma.service';
import { Express } from 'express';
import { SignInDataDto } from 'src/auth/dto/sign-in-data.dto';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDINARY') private cloudinary,
    private prisma: PrismaService,
  ) {}

  async uploadProfilePicture(req: SignInDataDto, file: Express.Multer.File): Promise<UploadApiResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: req.email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new BadRequestException('File is required!!'));
      }


      const upload = this.cloudinary.uploader.upload_stream(
        { folder: `my_app_folder/users/${user.id}` },
        async (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new BadRequestException('Upload failed: result is undefined'));
          
          try {
            await this.prisma.image.create({
              data: {
                url: result.secure_url,
                publicId: result.public_id,
                user: { connect: { id: user.id } },
              },
            });

            resolve(result);
          } catch (dbError) {
            reject(dbError);
          }
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }




  async uploadImageToPost(postId: number, req: SignInDataDto, file: Express.Multer.File): Promise<UploadApiResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: req.email },
    });

    if (!user) throw new NotFoundException('User not found');

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new NotFoundException('Post not found');

    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) return reject(new BadRequestException('File is required!'));

      const upload = this.cloudinary.uploader.upload_stream(
        {
          folder: `my_app_folder/posts/${postId}`,
        },
        async (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new BadRequestException('Upload failed: result is undefined'));

          try {
            await this.prisma.image.create({
              data: {
                url: result.secure_url,
                publicId: result.public_id,
                user: { connect: { id: user.id } },
                post: { connect: { id: postId } },
              },
            });

            resolve(result);
          } catch (dbError) {
            reject(dbError);
          }
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }


  async deleteImage(publicId: string, options: { userEmail?: string; postId?: number }): Promise<boolean> {
    try {
      // Destroy from Cloudinary first
      await this.cloudinary.uploader.destroy(publicId);

      const orConditions: Array<{ publicId?: string; userId?: number; postId?: number }> = [{ publicId }];

      // If user email provided, fetch user and add userId condition
      if (options.userEmail) {
        const user = await this.prisma.user.findUnique({
          where: { email: options.userEmail },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        orConditions.push({ userId: user.id });
      }

      // If postId is provided
      if (options.postId) {
        orConditions.push({ postId: options.postId });
      }

      // Delete all images matching publicId OR userId OR postId
      await this.prisma.image.deleteMany({
        where: {
          OR: orConditions,
        },
      });

      return true;
    } catch (error) {
      throw new NotFoundException('Image deletion failed: ' + error);
    }
  }


  // async deleteImage(publicId: string, userId: SignInDataDto): Promise<boolean> {
    
  //   const user= await this.prisma.user.findUnique({
  //     where: {
  //       email: userId.email,
  //     },
  //   });

  //   if (!user) {
  //     throw new Error('User not found');
  //   }


  //   try {
  //     await this.cloudinary.uploader.destroy(publicId);

  //     await this.prisma.image.deleteMany({
  //       where: {
  //         publicId,
  //         userId: user.id,
  //       },
  //     });

  //     return true;
  //   } catch (error) {
  //     throw new Error('Image deletion failed: ' + error);
  //   }
  // }

  async updateProfilePicture(user: SignInDataDto, file: Express.Multer.File): Promise<UploadApiResponse> {
    
    const userIdFromToken = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    
    if (!userIdFromToken) {
      throw new Error('User not found');
    }

    const existingImage = await this.prisma.image.findUnique({
      where: {
        userId: userIdFromToken.id,
      },
    });

    if (existingImage) {
      await this.cloudinary.uploader.destroy(existingImage.publicId);
      await this.prisma.image.delete({ where: { id: existingImage.id } });
    }
      
    return this.uploadProfilePicture(user, file);
  }


}