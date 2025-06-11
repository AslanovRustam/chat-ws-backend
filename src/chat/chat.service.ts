import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';
import { Message } from 'src/message/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async createChat(ownerId: string): Promise<Chat> {
    const chat = new this.chatModel({
      ownerId,
      participants: [ownerId],
      createdAt: new Date(),
    });
    return await chat.save();
  }

  async findAllChats(): Promise<Chat[]> {
    return this.chatModel.find().exec();
  }

  async findChatsByUser(userId: string): Promise<Chat[]> {
    return this.chatModel.find({ participants: userId }).exec();
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return this.messageModel
      .find({ chatId })
      .populate('sender', 'username email')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findChatById(chatId: string): Promise<Chat | null> {
    return this.chatModel.findById(chatId).exec();
  }

  async findMessagesByChatId(chatId: string): Promise<Message[]> {
    return this.messageModel.find({ chatId }).sort({ createdAt: 1 }).exec();
  }

  async findChatByOwner(ownerId: string): Promise<Chat | null> {
    return await this.chatModel.findOne({ ownerId });
  }

  async addParticipant(chatId: string, userId: string): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    if (!chat.participants.includes(userId)) {
      chat.participants.push(userId);
      await chat.save();
    }

    return chat;
  }

  async getChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId);

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    return chat;
  }
}
