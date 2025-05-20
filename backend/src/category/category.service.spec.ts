import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from 'src/db/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    mockPrisma.category.create.mockResolvedValue({ id: 1, name: 'Tech' });

    const result = await service.create({ name: 'Tech' });
    expect(result).toEqual({ id: 1, name: 'Tech' });
    expect(mockPrisma.category.create).toHaveBeenCalled();
  });

  it('should throw if category already exists', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Tech' });
    await expect(service.create({ name: 'Tech' })).rejects.toThrow(BadRequestException);
  });

  it('should find all categories', async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
  });

  it('should find a category by id', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Tech' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, name: 'Tech' });
  });

  it('should throw if category not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update a category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Old' });
    mockPrisma.category.update.mockResolvedValue({ id: 1, name: 'New' });

    const result = await service.update(1, { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('should delete a category', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Delete' });
    mockPrisma.category.delete.mockResolvedValue({ id: 1 });

    const result = await service.remove(1);
    expect(result.id).toBe(1);
  });
});
