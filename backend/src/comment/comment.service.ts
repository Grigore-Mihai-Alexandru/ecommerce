import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Comment } from '@prisma/client';
import { SignInDataDto } from 'src/auth/dto/sign-in-data.dto';
import { PrismaService } from 'src/db/prisma.service';

type CommentWithChildren = {
  id: number;
  content: string;
  parentId: number | null;
  createdAt: Date;
  author: {
    id: number;
    name: string;
  };
  children: {
    id: number;
  }[];
};

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CommentCreateInput, user: SignInDataDto): Promise<Comment> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email: user.email },
    });
    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    // Ensure post exists
    const postId = data.post?.connect?.id;
    if (!postId) {
      throw new NotFoundException('Post ID missing or invalid');
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check for valid parent comment if it's a reply
    const parentId = data.parent?.connect?.id;
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      //check if postId matches with the parent comment
      if (parentComment.postId !== postId) {
            throw new BadRequestException('Parent comment does not belong to the same post');
        }
    }

    return this.prisma.comment.create({
      data: {
        content: data.content,
        author: { connect: { id: userRecord.id } },
        post: { connect: { id: postId } },
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
    });
  }

  async findAllFromPost(postId: number): Promise<CommentWithChildren[]> {
  return await this.prisma.comment.findMany({
    where: { postId },
    select: {
      id: true,
      content: true,
      parentId: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      children: {
        select: {
          id: true, // doar id-urile copiilor pentru recursivitate
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
}


  async findOne(id: number): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        post: true,
        children: true,
        parent: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async edit(id: number, data: Prisma.CommentUpdateInput, req:SignInDataDto): Promise<Comment> {
    const userRecord = await this.prisma.user.findUnique({
        where: { email: req.email },
    });
    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    if (existing.authorId !== userRecord.id) {
      throw new NotFoundException('You are not the author of this comment');
    }

    
    // ensure that the author is not being changed
    if(data.author?.connect?.id && data.author.connect.id !== existing.authorId) {
        throw new BadRequestException('You cannot change the author of the comment');
    }
    
    // ensure that the parent is not being changed
    if (data.parent?.connect?.id && data.parent.connect.id !== existing.parentId) {
      throw new BadRequestException('You cannot change the parent of the comment');
    }
    

    return this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, req:SignInDataDto): Promise<Comment> {
    const userRecord = await this.prisma.user.findUnique({
        where: { email: req.email },
    });
    if (!userRecord) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Comment not found');
    }

    if (existing.authorId !== userRecord.id) {
      throw new NotFoundException('You are not the author of this comment');
    }
    
    // delete all reply comments
    await this.prisma.comment.deleteMany({
      where: { parentId: id },
    });

    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
