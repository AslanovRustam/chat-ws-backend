import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './message.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(
    @Body()
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const message = await this.messageService.createMessage(createMessageDto);
    return message;
  }

  @Get('chat/:chatId')
  findAllByChat(@Param('chatId') chatId: string): Promise<Message[]> {
    return this.messageService.findAllByChatId(chatId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Message> {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Body() body: { senderId: string },
  ): Promise<{ id: string }> {
    return this.messageService.delete(id, body.senderId);
  }

  @Post('voice')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/audio',
        filename: (_, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async createVoiceMessage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { chatId: string; senderId: string; senderName: string },
  ) {
    const audioUrl = `/uploads/audio/${file.filename}`;

    const newMessage = await this.messageService.createMessage({
      chatId: body.chatId,
      senderId: body.senderId,
      senderName: body.senderName,
      text: '',
      audioUrl,
    });

    return newMessage;
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/video',
        filename: (_, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async createVideoMessage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { chatId: string; senderId: string; senderName: string },
  ) {
    const videoUrl = `/uploads/video/${file.filename}`;

    const newMessage = await this.messageService.createMessage({
      chatId: body.chatId,
      senderId: body.senderId,
      senderName: body.senderName,
      text: '',
      videoUrl,
    });

    return newMessage;
  }

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/files',
        filename: (_, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async createFileMessage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { chatId: string; senderId: string; senderName: string },
  ) {
    const fileUrl = `/uploads/files/${file.filename}`;
    const originalName = file.originalname;

    const newMessage = await this.messageService.createMessage({
      chatId: body.chatId,
      senderId: body.senderId,
      senderName: body.senderName,
      text: '',
      fileUrl,
      fileName: originalName,
    });

    return newMessage;
  }
}
