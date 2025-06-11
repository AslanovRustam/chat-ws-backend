import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway(3002, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createChat')
  async handleCreateChat(
    @MessageBody() data: { ownerId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const newChat = await this.chatService.createChat(data.ownerId);
      client.emit('chatCreated', newChat);
    } catch (err) {
      client.emit('error', { message: 'Error creating chat' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      chatId: string;
      senderId: string;
      senderName: string;
      text: string;
    },
  ) {
    const messageWithTimestamp = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.server.to(data.chatId).emit('newMessage', messageWithTimestamp);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.chatService.addParticipant(data.chatId, data.userId);

    const updatedChat = await this.chatService.getChatById(data.chatId);

    client.join(data.chatId);
    client.emit('chatJoined', updatedChat);
  }
}
