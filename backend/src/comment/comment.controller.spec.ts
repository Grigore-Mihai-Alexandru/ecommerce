import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { AuthGuard } from 'src/auth/guards/auth-guard';
import { ExecutionContext } from '@nestjs/common';

describe('CommentController', () => {
  let controller: CommentController;
  let mockService: Record<keyof CommentService, jest.Mock>;

  const mockUser = { id: 1, email: 'test@example.com' };

  const mockGuard: any = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    },
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAllFromPost: jest.fn(),
      findOne: jest.fn(),
      edit: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<CommentController>(CommentController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct arguments', async () => {
      const dto = {
        content: 'New comment',
        post: { connect: { id: 1 } },
        author: { connect: { id: mockUser.id } },
      };
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto, { user: mockUser });
      expect(mockService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('findAllFromPost', () => {
    it('should call service.findAllFromPost with postId', async () => {
      const postId = 1;
      const expected = [{ id: 1, content: 'Comment' }];
      mockService.findAllFromPost.mockResolvedValue(expected);

      const result = await controller.findAllFromPost(postId);
      expect(mockService.findAllFromPost).toHaveBeenCalledWith(postId);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      const id = 1;
      const expected = { id, content: 'Comment' };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(id);
      expect(mockService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('edit', () => {
    it('should call service.edit with correct arguments', async () => {
      const id = 1;
      const dto = { content: 'Updated content' };
      const expected = { id, ...dto };
      mockService.edit.mockResolvedValue(expected);

      const result = await controller.edit({ user: mockUser }, id, dto);
      expect(mockService.edit).toHaveBeenCalledWith(id, dto, mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct arguments', async () => {
      const id = 1;
      const expected = { success: true };
      mockService.remove.mockResolvedValue(expected);

      const result = await controller.remove(id, { user: mockUser });
      expect(mockService.remove).toHaveBeenCalledWith(id, mockUser);
      expect(result).toEqual(expected);
    });
  });
});
