import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { multerOptions } from 'src/common/multer.config';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { PostService } from './post.service';

@Controller('post')
@ApiTags('Post')
@UseGuards(RolesGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('createPost')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiOperation({ operationId: 'createPost' })
  @ApiBody({ type: CreatePostInput })
  @ApiResponse({ status: 201 })
  async createPost(
    @Body() input: CreatePostInput,
    @Request() req,
    @UploadedFile() image,
  ) {
    return await this.postService.createPost(
      input,
      req.user.id,
      image.filename,
    );
  }

  @Put('updatePost:id')
  @ApiOperation({ operationId: 'updatePost' })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiBody({ type: UpdatePostInput })
  @ApiResponse({ status: 200 })
  @Roles(Role.Admin, Role.Support)
  async updatePost(
    @Param('id') postId: string,
    @Body() input: UpdatePostInput,
    @Request() req,
    @UploadedFile() image,
  ) {
    return await this.postService.updatePost(
      input,
      req.user.id,
      postId,
      image.filename,
    );
  }

  @Put(':id/approve')
  @ApiOperation({ operationId: 'approvePost' })
  @ApiResponse({ status: 200 })
  @Roles(Role.Support, Role.Admin)
  async approveArticle(@Param('id') postId: string, @Request() req) {
    return this.postService.approvePost(postId, req.user.id);
  }

  @Put(':id/reject')
  @ApiOperation({ operationId: 'rejectPost' })
  @ApiResponse({ status: 200 })
  @Roles(Role.Support, Role.Admin)
  async rejectArticle(@Param('id') postId: string, @Request() req) {
    console.log('asdads');
    return this.postService.rejectPost(postId, req.user.id);
  }
}
