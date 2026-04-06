import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { Message } from './entities/message.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { MovieModule } from 'src/movie/movie.module';
import { GroupModule } from 'src/group/group.module';
import { MemberModule } from 'src/member/member.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  imports: [TypeOrmModule.forFeature([Recommendation, Message]), 
    ConfigModule,
    MovieModule,
    GroupModule,
    AuthModule,
    MemberModule,
    MailModule
  ],
  exports: [TypeOrmModule, RecommendationService]
})
export class RecommendationModule 
{}
