import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoryService } from './subcategory.service';
import { PrismaService } from 'src/db/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SubcategoryService', () => {
  let service: SubcategoryService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    subcategory: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  } as any; // use any to allow for partial mocking

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubcategoryService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<SubcategoryService>(SubcategoryService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should throw if subcategory already exists', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 1 }); // categ. exists
    mockPrisma.subcategory.findUnique.mockResolvedValue({ name: 'Cars' }); // subcat. exists

    await expect(
      service.create({ name: 'Cars', category: { connect: { id: 1 } } } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw if connected category does not exist', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null); // categ. doesn't exist
    mockPrisma.subcategory.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ name: 'Cars', category: { connect: { id: 999 } } } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create subcategory if not exists and category is valid', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ id: 1 }); // categ. exists
    mockPrisma.subcategory.findUnique.mockResolvedValue(null);   // subcat. does not exist
    mockPrisma.subcategory.create.mockResolvedValue({ id: 1, name: 'Cars' });

    const result = await service.create({ name: 'Cars', category: { connect: { id: 1 } } } as any);

    expect(result).toEqual({ id: 1, name: 'Cars' });
    expect(mockPrisma.subcategory.create).toHaveBeenCalled();
  });
});
