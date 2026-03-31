import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from "./dtos/new-message.dto";
import { Message } from "src/recommendation/entities/message.entity";
import { AuthenticatedSocket } from "./message-ws.gateways";

@Injectable()
export class MessageWsService
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    
  )
  {
  }
  async assignUserToSocket(userId: string)
  {
    const user = await this.userRepository.findOneBy({ id: userId });
    if(!user) throw new Error('User not found');
    return user;
  }
  async createMessage(client: AuthenticatedSocket, payload: NewMessageDto)
  {
    const newMessage = this.messageRepository.create({
      message: payload.message,
      user: client.user,
      recommendation: {id:payload.recommendationId} 
    })
    await this.messageRepository.save(newMessage);
    return newMessage;
  }
}
