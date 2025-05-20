import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryService } from './subcategory.service';

describe('SubcategoryController', () => {
  let controller: SubcategoryController;
  let service: SubcategoryService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcategoryController],
      providers: [{ provide: SubcategoryService, useValue: mockService }],
    }).compile();

    controller = module.get<SubcategoryController>(SubcategoryController);
  });

  it('should call create', async () => {
    await controller.create({ name: 'Gaming', category: { connect: { id: 1 } } });
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should call findAll', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });
});
