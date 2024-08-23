import { User } from 'src/module/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PostStatus {
  Accepted = 'accepted',
  Pending = 'Pending',
  Rejected = 'rejected',
}

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column()
  content: string;

  @Column({ enum: PostStatus, default: PostStatus.Pending })
  status: PostStatus;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => User, user => user.articles)
  author: User;

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
