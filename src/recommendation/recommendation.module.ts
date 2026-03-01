import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recommendation } from './entities/recommendation.entity';
import { Message } from './entities/message.entity';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  imports: [TypeOrmModule.forFeature([Recommendation, Message])],
  exports: [TypeOrmModule]
})
export class RecommendationModule 
{}
