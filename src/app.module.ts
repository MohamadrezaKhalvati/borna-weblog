import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import redisStore from 'cache-manager-redis-store';
import { join } from 'path';
import { AuthModule } from './module/auth/auth.module';
import { NodeMailerModule } from './module/node-mailer/node-mailer.module';
import { PostModule } from './module/post/post.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: process.env.REDIS_URL,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
      }),
    }),
    AuthModule,
    PostModule,
    NodeMailerModule,
  ],
})
export class AppModule {}
