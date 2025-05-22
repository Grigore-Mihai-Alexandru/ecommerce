import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth-guard';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  @Injectable()
  class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    })
        .overrideGuard(AuthGuard)
        .useClass(MockAuthGuard)
        .compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should call create', async () => {
    await controller.create({ name: 'Test' });
    expect(service.create).toHaveBeenCalledWith({ name: 'Test' });
  });

  it('should call findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });
});
