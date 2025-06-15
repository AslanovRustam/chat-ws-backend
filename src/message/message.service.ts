import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './message.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

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

  async delete(id: string, requesterId: string): Promise<{ id: string }> {
    const message = await this.messageModel.findById(id);

    if (!message) {
      throw new NotFoundException(`Message with id ${id} not found`);
    }

    if (message.senderId !== requesterId) {
      throw new Error('You can only delete your own messages');
    }
    // Start - delete files associated with the message
    const deleteFileIfExists = async (publicUrl?: string) => {
      if (!publicUrl) return;

      // Remove the first slash if there is one
      const relativePath = publicUrl.startsWith('/')
        ? publicUrl.slice(1)
        : publicUrl;

      // Add the path to the project root
      const fullPath = path.resolve(
        process.cwd(),
        'public',
        relativePath.replace(/^uploads[\\/]/, 'uploads/'),
      );

      try {
        await fs.promises.access(fullPath, fs.constants.F_OK);
        await fs.promises.unlink(fullPath);
        console.log(`✅ File deleted: ${fullPath}`);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`❌ Error deleting file: ${fullPath}`, err.message);
        }
      }
    };

    await Promise.all([
      deleteFileIfExists(message.audioUrl),
      deleteFileIfExists(message.videoUrl),
      deleteFileIfExists(message.fileUrl),
    ]);
    // End - delete files associated with the message

    await this.messageModel.findByIdAndDelete(id);

    return { id };
  }
}
