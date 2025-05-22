import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { PrismaService } from 'src/db/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CommentService', () => {
  let service: CommentService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userMock = { id: 1, email: 'test@example.com', name: 'Test User' };

  describe('create', () => {
    it('should create a comment successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.comment.create.mockResolvedValue({ id: 1, content: 'Test', authorId: 1 });

      const input: Prisma.CommentCreateInput = {
        content: 'Test',
        post: { connect: { id: 1 } },
        author: { connect: { id: 1 } },
      };

      const result = await service.create(input, userMock);
      expect(result).toEqual({ id: 1, content: 'Test', authorId: 1 });
    });

    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create({} as any, userMock)).rejects.toThrow(NotFoundException);
    });

    it('should throw if post not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.post.findUnique.mockResolvedValue(null);

      const input: Prisma.CommentCreateInput = {
        content: 'Test',
        post: { connect: { id: 999 } },
        author: { connect: { id: 1 } },
      };

      await expect(service.create(input, userMock)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllFromPost', () => {
    it('should return all comments for a post', async () => {
      const comments = [
        {
          id: 1,
          content: 'Test comment',
          parentId: null,
          createdAt: new Date(),
          author: { id: 1, name: 'Test' },
          children: [{ id: 2 }],
        },
      ];

      mockPrisma.comment.findMany.mockResolvedValue(comments);

      const result = await service.findAllFromPost(1);
      expect(result).toEqual(comments);
    });
  });

  describe('edit', () => {
    it('should update a comment successfully', async () => {
      const updateInput = { content: 'Updated comment' };

      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.comment.findUnique.mockResolvedValue({ id: 1, authorId: 1 });

      mockPrisma.comment.update.mockResolvedValue({ id: 1, content: 'Updated comment' });

      const result = await service.edit(1, updateInput, userMock);
      expect(result).toEqual({ id: 1, content: 'Updated comment' });
    });

    it('should throw if trying to change author', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.comment.findUnique.mockResolvedValue({ id: 1, authorId: 1 });

      const updateInput = {
        content: 'Updated comment',
        author: { connect: { id: 999 } },
      };

      await expect(service.edit(1, updateInput, userMock)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a comment and its children', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.comment.findUnique.mockResolvedValue({ id: 1, authorId: 1 });
      mockPrisma.comment.deleteMany.mockResolvedValue({});
      mockPrisma.comment.delete.mockResolvedValue({ id: 1 });

      const result = await service.remove(1, userMock);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw if comment not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.comment.findUnique.mockResolvedValue(null);

      await expect(service.remove(1, userMock)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not the author', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(userMock);
      mockPrisma.comment.findUnique.mockResolvedValue({ id: 1, authorId: 999 });

      await expect(service.remove(1, userMock)).rejects.toThrow(NotFoundException);
    });
  });
});
