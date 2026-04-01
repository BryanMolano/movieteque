import { JwtService } from "@nestjs/jwt";
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage } from "@nestjs/websockets";
import { JwtPayload } from "src/auth/interfaces/jwt-payload.interface";
import { NewMessageDto } from "./dtos/new-message.dto";
import { MessageWsService } from "./message-ws.service";
import { Server, Socket } from 'socket.io';
import { User } from "src/user/entities/user.entity";

export interface AuthenticatedSocket extends Socket {
  user: User;
}
@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  )
  {
  }


  async handleConnection(client: AuthenticatedSocket)
  {
    const token = client.handshake.auth.token as string;
    let payload: JwtPayload;
    try
    {
      payload = this.jwtService.verify(token);
      const user = await this.messageWsService.assignUserToSocket(payload.id);
      client.user = user;
      client.emit('connection-ready')
    }
    catch (error)
    {
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: AuthenticatedSocket)
  {
    if(client.user)
    {
      //implicitamente se borra creo
      console.log(`Usuario desconectado: ${client.user.username}`);
    }
  }

  @SubscribeMessage('join-room')
  async onJoinRoom(client:AuthenticatedSocket, recommendationId: string)
  {
    if(!client.user) return;
    await client.join(recommendationId);
    console.log(`${client.user.username} entered the chat of the recommendation with dis id: ${recommendationId}`);
  }

  @SubscribeMessage('leave-room')
  async onExitRoom(client:AuthenticatedSocket, recommendationId: string)
  {
    await client.leave(recommendationId);
    console.log(`${client.user.username} exited the chat of the recommendation with dis id: ${recommendationId}`);
  }

  @SubscribeMessage('message-from-client')
  async onMessageFromClient(client: AuthenticatedSocket, payload: NewMessageDto)
  {
    const message = await this.messageWsService.createMessage(client, payload);
    this.wss.to(payload.recommendationId).emit('message-from-server', message
    )
  }
}
