import { Module } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { InteractionController } from './interaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction } from './entities/interaction.entity';
import { RecommendationModule } from 'src/recommendation/recommendation.module';
import { MemberModule } from 'src/member/member.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [InteractionController],
  providers: [InteractionService],
  imports: [RecommendationModule,
    MemberModule,
    UserModule,
    AuthModule,
    MailModule,
    TypeOrmModule.forFeature([Interaction])],
  exports: [TypeOrmModule]
})
export class InteractionModule 
{}
