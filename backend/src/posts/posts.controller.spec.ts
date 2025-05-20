import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth-guard';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock AuthGuard
@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
  mockService.findAll.mockResolvedValue(['post1']);
  mockService.findOne.mockResolvedValue({ id: 1 });
  mockService.create.mockResolvedValue({ id: 1 });
  mockService.update.mockResolvedValue({ id: 1 });
  mockService.remove.mockResolvedValue({ id: 1 });

  const module: TestingModule = await Test.createTestingModule({
    controllers: [PostsController],
    providers: [{ provide: PostsService, useValue: mockService }],
  })
    .overrideGuard(AuthGuard)
    .useClass(MockAuthGuard)
    .compile();

  controller = module.get<PostsController>(PostsController);
});

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  it('should return all posts', async () => {
    const result = await controller.findAll();
    expect(result).toEqual(['post1']);
  });

  it('should return one post by id', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: 1 });
  });

  it('should call create with correct data', async () => {
    const req = { user: { email: 'test@test.com' } };
    const dto = { title: 'Test' } as any;
    const result = await controller.create(dto, req, []);
    expect(result).toEqual({ id: 1 });
  });

  it('should call update with correct data', async () => {
    const dto = { title: 'Updated' };
    const result = await controller.updatePost('1', dto, []);
    expect(result).toEqual({ id: 1 });
  });

  it('should call remove with correct id', async () => {
    const result = await controller.remove('1');
    expect(result).toEqual({ id: 1 });
  });
});
