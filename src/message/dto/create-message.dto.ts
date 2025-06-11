import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  senderName: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  audioUrl?: string;
}
