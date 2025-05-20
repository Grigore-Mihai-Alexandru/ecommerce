import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Post, Prisma } from '@prisma/client';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { SignInDataDto } from 'src/auth/dto/sign-in-data.dto';

type FormDataPostInput = {
  [key: string]: any; // raw input from form-data (everything is string)
};

type Mode = 'create' | 'update';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    @Inject('CLOUDINARY') private cloudinary,
  ) {}
  
  // posts/
  async findAll() {
    return this.prisma.post.findMany({
      where: {
      },
    });
  }

  // posts/:id
  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  // posts/:userId
  async findByUserId(userId: number) {
    return this.prisma.post.findMany({
      where: {
        authorId: userId,
        published: true,
      }
    });
  }
  
  // Maybe implement more specific filters in the future //

  // posts/search/:search
  async findBySearch(search: string) {
    return this.prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
        published: true,
      },
    });
  }


  // posts/category/:category
  async findByCategory(category: string) {
    return this.prisma.post.findMany({
      where: {
        category: category,
        published: true,
      },
      include: {
        author: true,
        comments: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // posts/category/:category/subcategory/:subcategory
  async findByFilters(category?: string, subcategory?: string, tag?: string) {
    return this.prisma.post.findMany({
      where: {
        AND: [
          category ? { category } : {},
          subcategory ? { subcategory } : {},
          tag ? { tags: { has: tag } } : {},
        ],
        published: true,
      },
    });
  }
  
  // posts/create
  async create(post: Post, user: SignInDataDto, files?: Express.Multer.File[]): Promise<Prisma.PostCreateInput> {
    
    const userId = await this.prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    const parsedPostData = this.parsePostCreateFormData(post);

    const createdPost = await this.prisma.post.create({
      data: {
        ...parsedPostData,
      },
    });

    // Upload images to Cloudinary (optional)
    const uploadedImages: { url: string; publicId: string; postId: number }[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const upload = this.cloudinary.uploader.upload_stream(
            { folder: `my_app_folder/posts/${createdPost.id}` },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            },
          );
          Readable.from(file.buffer).pipe(upload);
        });
        
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          postId: createdPost.id,
        });
      }

      await this.prisma.image.createMany({
        data: uploadedImages,
      });
    }
    
    
    return createdPost;
  }
  
  
  // posts/update/:postId
  async update(id: number, post: Partial<Post>, newImages?: Express.Multer.File[]) {
    const existingImages = await this.prisma.image.findMany({
      where: { postId: id },
    });

    // Remove old images from Cloudinary
    for (const image of existingImages) {
      await this.cloudinary.uploader.destroy(image.publicId);
    }

    // Remove old images from DB
    await this.prisma.image.deleteMany({
      where: { postId: id },
    });

    // Upload new images to Cloudinary (optional)
    const uploadedImages: { url: string; publicId: string; postId: number }[] = [];
    if (newImages && newImages.length > 0) {
      for (const file of newImages) {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          const upload = this.cloudinary.uploader.upload_stream(
            { folder: `my_app_folder/posts/${id}` },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            },
          );
          Readable.from(file.buffer).pipe(upload);
        });
        
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          postId: id,
        });
      }

      await this.prisma.image.createMany({
        data: uploadedImages,
      });
    }

    // Update the post content
    return this.prisma.post.update({
      where: { id },
      data: this.parsePostUpdateFormData(post),
    });
  }


  // posts/remove/:id
  async remove(postId: number) {

    const post = await this.prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const images = await this.prisma.image.findMany({
      where: { postId: postId },
    });

    // Delete each image from Cloudinary
    for (const image of images) {
      await this.cloudinary.uploader.destroy(image.publicId);
    }

    // Optional: delete images from DB (they should cascade, but safer to do it explicitly)
    await this.prisma.image.deleteMany({
      where: { postId: postId },
    });

    // Delete the post
    return this.prisma.post.delete({
      where: { id: postId },
    });
  }

///////////////////////////////////////////////////////////////////////////////

  parsePostCreateFormData(input: Partial<Post>): Prisma.PostCreateInput {
    if (!input.title || !input.authorId) {
      throw new BadRequestException('Title and authorId are required');
    }
    const result: Prisma.PostCreateInput = {
      title: input.title || '',
      author: {
        connect: { id: Number(input.authorId) }
      },
      tags: [],
      likes: 0
    };

    if (input.content) result.content = input.content;
    if (input.published !== undefined) {
      if (typeof input.published === 'string') {
        result.published = input.published === 'true';
      } else {
        result.published = !!input.published;
      }
    }
    if (input.category) result.category = input.category;
    if (input.subcategory) result.subcategory = input.subcategory;

    if (input.likes !== undefined) {
      const likes = Number(input.likes);
      if (!isNaN(likes)) result.likes = likes;
    }

    if (input.tags !== undefined) {
        if (Array.isArray(input.tags)) {
          result.tags = input.tags;
        } else if (typeof input.tags === 'string') {
          result.tags = (input.tags as string)
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);
        }
      }

    return result;
  }


  parsePostUpdateFormData(input: Partial<Post>): Prisma.PostUpdateInput {
    const result: Prisma.PostUpdateInput = {};

    if (input.title) result.title = input.title;
    if (input.content) result.content = input.content;
    if (input.published !== undefined) {
      if (typeof input.published === 'string') {
        result.published = input.published === 'true';
      } else {
        result.published = !!input.published;
      }
    }
    if (input.category) result.category = input.category;
    if (input.subcategory) result.subcategory = input.subcategory;

    if (input.authorId !== undefined) {
      const authorId = Number(input.authorId);
      if (!isNaN(authorId)) {
        result.author = { connect: { id: authorId } };
      }
    }

    if (input.likes !== undefined) {
      const likes = Number(input.likes);
      if (!isNaN(likes)) result.likes = likes;
    }

    if (input.tags !== undefined) {
        if (Array.isArray(input.tags)) {
          result.tags = input.tags;
        } else if (typeof input.tags === 'string') {
          result.tags = (input.tags as string)
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);
        }
    }

    return result;
  }

}
