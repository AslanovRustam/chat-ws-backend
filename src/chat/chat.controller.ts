import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.schema';
import { Message } from 'src/message/message.schema';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';

@Controller('chats')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  @Get('')
  async getAllChats(): Promise<
    { chat: Chat; lastMessage: Message | undefined }[]
  > {
    const chats = await this.chatService.findAllChats();

    const updatedChats = await Promise.all(
      chats.map(async (chat) => {
        const messages = await this.messageService.findAllByChatId(chat.id);
        const lastMessage = messages.at(-1);
        return { chat, lastMessage };
      }),
    );
    if (!chats) {
      throw new NotFoundException(`Chats not found`);
    }
    return updatedChats;
  }

  @Get('user/:userId')
  async getChatsByUser(@Param('userId') userId: string): Promise<Chat[]> {
    const chats = await this.chatService.findChatsByUser(userId);
    if (!chats.length) {
      throw new NotFoundException(`No chats found for user ${userId}`);
    }
    return chats;
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string): Promise<Chat> {
    const chat = await this.chatService.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }
    return chat;
  }

  @Get(':chatId/messages')
  async getMessagesByChat(@Param('chatId') chatId: string): Promise<Message[]> {
    const messages = await this.chatService.findMessagesByChatId(chatId);
    return messages;
  }

  @Get(':chatId/participants')
  async getChatParticipant(
    @Param('chatId') chatId: string,
  ): Promise<{ id: string; username: string; email: string }[]> {
    const chat = await this.chatService.findChatById(chatId);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    const participantIds = chat.participants;

    if (!participantIds || !participantIds.length) {
      return [];
    }

    const users = await Promise.all(
      participantIds.map((userId) => this.userService.findOneById(userId)),
    );

    return users.map((user) => ({
      id: user.id ?? '',
      username: user.username,
      email: user.email ?? '',
    }));
  }
}
