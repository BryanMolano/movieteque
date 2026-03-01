import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { InteractionController } from './interaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction } from './entities/interaction.entity';
import { RecommendationModule } from 'src/recommendation/recommendation.module';

@Module({
  controllers: [InteractionController],
  providers: [InteractionService],
  imports: [RecommendationModule,
    TypeOrmModule.forFeature([Interaction])],
  exports: [TypeOrmModule]
})
export class InteractionModule 
{}
