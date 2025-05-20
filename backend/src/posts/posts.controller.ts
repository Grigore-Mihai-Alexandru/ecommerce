import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from 'src/auth/guards/auth-guard';
import { Post as PostDto } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  
  @Get()
  async findAll() {
    return this.postsService.findAll();
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }
  
  @Get('category/:category')
  async getPostsByCategory(@Param('category') category: string) {
    return this.postsService.findByCategory(category);
  }
  
  @Get('user/:userId')
  async getPostsByUserId(@Param('userId') userId: string) {
    return this.postsService.findByUserId(+userId);
  }
  
  @Get('search/:search')
  async getPostsBySearch(@Param('search') search: string) {
    return this.postsService.findBySearch(search);
  }
  

  
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Post('create')
  async create(
    @Body() dto: PostDto, 
    @Request() req, 
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.postsService.create(dto, req.user, files);
  }

  // send req.user.email to find the userId and get the permission to create a post
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @Patch('update/:id')
  async updatePost(
    @Param('id') postId: string, 
    @Body() dto: Partial<PostDto>,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.postsService.update(+postId, dto, files);
  }
  

  @UseGuards(AuthGuard)
  @Delete('remove/:id')
  async remove(@Param('id') postId: string) {
    return this.postsService.remove(+postId);
  }
}
