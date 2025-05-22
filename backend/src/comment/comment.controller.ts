import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CommentService } from './comment.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from 'src/auth/guards/auth-guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

    @UseGuards(AuthGuard)
    @Post('create')
    create(
        @Body() createCommentDto: Prisma.CommentCreateInput,
        @Request() req
        ) {
        return this.commentService.create(createCommentDto, req.user);
    }

    @Get('post/:postId')
    findAllFromPost(@Param('postId', ParseIntPipe) postId: number) {
        return this.commentService.findAllFromPost(postId);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.commentService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Patch('update/:id')
    edit(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCommentDto: Prisma.CommentUpdateInput,
    ) {
        return this.commentService.edit(id, updateCommentDto, req.user);
    }

    @UseGuards(AuthGuard)
    @Delete('remove/:id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.commentService.remove(id, req.user);
    }
}
