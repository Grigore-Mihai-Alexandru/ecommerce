import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Prisma, Role} from '@prisma/client';
import { Roles } from 'src/auth/guards/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthGuard } from 'src/auth/guards/auth-guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard) // Use the RolesGuard to protect this route
  @Roles(Role.ADMIN) // Only admin can create a category
  create(@Body() createCategoryDto: Prisma.CategoryCreateInput) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: Prisma.CategoryUpdateInput,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('remove/:id')
  @UseGuards(RolesGuard) 
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
