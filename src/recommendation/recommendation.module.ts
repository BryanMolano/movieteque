import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { Message } from './entities/message.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { MovieModule } from 'src/movie/movie.module';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  imports: [TypeOrmModule.forFeature([Recommendation, 
    ConfigModule,
    MovieModule,
    AuthModule,
    Message])],
  exports: [TypeOrmModule]
})
export class RecommendationModule 
{}
