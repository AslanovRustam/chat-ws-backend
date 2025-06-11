import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.DATABASE_URL ??
        (() => {
          throw new Error('DATABASE_URL is not defined');
        })(),
    ),
    AuthModule,
    UserModule,
    ChatModule,
    MessageModule,
  ],
})
export class AppModule {}
