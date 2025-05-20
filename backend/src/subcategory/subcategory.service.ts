import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubcategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SubcategoryCreateInput) {
    const existing = await this.prisma.subcategory.findUnique({
      where: { name: data.name },
    });
  
    if (existing) {
      throw new ConflictException(`Subcategory "${data.name}" already exists.`);
    }


    if (data.category.connect!.id) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: data.category.connect!.id },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${data.category.connect!.id} does not exist.`);
      }
    }

    return this.prisma.subcategory.create({ data });
  }

  async findAll() {
    return this.prisma.subcategory.findMany({
      include: { category: true, posts: true },
    });
  }

  async findOne(id: number) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: { category: true, posts: true },
    });

    if (!subcategory) {
      throw new NotFoundException('Subcategory not found');
    }

    return subcategory;
  }

  async update(id: number, data: Prisma.SubcategoryUpdateInput) {
    const existing = await this.prisma.subcategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Subcategory not found');
    }

    if (data.category) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: data.category.connect!.id },
      });
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${data.category.connect!.id} does not exist.`);
      }
    }

    return this.prisma.subcategory.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.subcategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Subcategory not found');
    }

    return this.prisma.subcategory.delete({
      where: { id },
    });
  }
}
