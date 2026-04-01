import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageWsGateway } from './message-ws.gateways';
import { MessageWsService } from './message-ws.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/recommendation/entities/message.entity';
import { Recommendation } from 'src/recommendation/entities/recommendation.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  providers: [MessageWsGateway, MessageWsService],
  imports: [AuthModule,TypeOrmModule.forFeature([Recommendation, Message, User])]
})
export class MessageWsModule 
{}
