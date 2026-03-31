import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageWsGateway } from './message-ws.gateways';
import { MessageWsService } from './message-ws.service';

@Module({
  providers: [MessageWsGateway, MessageWsService],
  imports: [AuthModule]
})
export class MessageWsModule 
{}
