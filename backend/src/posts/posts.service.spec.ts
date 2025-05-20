import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../db/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Writable } from 'stream';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  const mockPrisma = {
    post: {
      findMany: jest.fn().mockResolvedValue(['mockPost']),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    image: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockCloudinary = {
    uploader: {
      upload_stream: jest.fn().mockImplementation((_options, callback) => {
        // Create a writable stream to simulate the upload process
        const writable = new Writable({
          write(_chunk, _encoding, done) {
            done();
          },
        });

        // Simulate the upload process
        setImmediate(() => {
          callback(null, {
            public_id: 'test_id',
            secure_url: 'http://test.com/image.jpg',
          });
        });

        return writable;
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'CLOUDINARY', useValue: mockCloudinary },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const result = await service.findAll();
      expect(result).toEqual(['mockPost']);
    });
  });

  describe('remove', () => {
    it('should throw if post not found', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should delete images and post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.image.findMany.mockResolvedValue([
        { publicId: '123' },
        { publicId: '456' },
      ]);

      const deleteSpy = jest.spyOn(mockPrisma.post, 'delete');
      await service.remove(1);
      expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('create', () => {
    it('should create a post with uploaded images', async () => {
      const dto = {
        title: 'Test Post',
        content: 'Content here',
        category: 'general',
        authorId: 1,
      };

      const mockUser = { name: 'Test User', email: 'test@test.com' };
      const files = [
        {
          buffer: Buffer.from('fake image content'),
          mimetype: 'image/jpeg',
        },
      ];

      mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.post.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any, mockUser, files as any);
      expect(mockPrisma.post.create).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 1, ...dto });
    });
  });
});
