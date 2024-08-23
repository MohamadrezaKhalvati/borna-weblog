import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post, PostStatus } from './entity/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPost(
    input: CreatePostInput,
    userId: string,
    imageFileName: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    await this.verifyPostTitleIsUnique(input.title);

    const post = await this.postRepository.create({
      ...input,
      author: user,
      imageUrl: imageFileName,
      status: PostStatus.Pending,
    });

    return await this.postRepository.save(post);
  }

  async approvePost(postId: string, userId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!post || !user) {
      throw new NotFoundException('Post or user not found');
    }

    post.status = PostStatus.Accepted;
    post.approvedBy = user;

    return await this.postRepository.save(post);
  }

  async rejectPost(postId: string, userId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!post || !user) {
      throw new NotFoundException('post or user not found');
    }

    post.status = PostStatus.Rejected;
    post.approvedBy = user;

    return await this.postRepository.save(post);
  }

  private async verifyPostTitleIsUnique(title: string) {
    const post = await this.postRepository.findOne({ where: { title } });
    if (post) {
      throw new Error('Post title is not unique');
    }
  }
  async updatePost(
    input: UpdatePostInput,
    userId: string,
    postId: string,
    imageFileName: string,
  ) {
    const post = await this.postRepository.findOne({
      where: { id: postId, author: { id: userId } },
    });

    if (!post) {
      throw new NotFoundException('post not found');
    }

    if (imageFileName) {
      post.imageUrl = imageFileName;
    }
    Object.assign(post, input);

    post.status = PostStatus.Pending;

    return await this.postRepository.save(post);
  }
}
