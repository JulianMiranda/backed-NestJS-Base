import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from 'src/schemas/message.schema';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Message',
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [MessageRepository],
  controllers: [MessageController],
})
export class MessageModule {}
