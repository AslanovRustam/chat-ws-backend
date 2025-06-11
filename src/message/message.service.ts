import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel(createMessageDto);

    return message.save();
  }

  async findAllByChatId(chatId: string): Promise<Message[]> {
    return this.messageModel.find({ chatId }).exec();
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageModel.findById(id);
    if (!message) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const updatedMessage = await this.messageModel.findByIdAndUpdate(
      id,
      updateMessageDto,
      { new: true },
    );
    if (!updatedMessage) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }
    return updatedMessage;
  }

  async remove(id: string): Promise<void> {
    const result = await this.messageModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }
  }
}
