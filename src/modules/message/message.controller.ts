import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Message } from 'src/dto/message.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { MongoQuery } from '../../dto/mongo-query.dto';
import { ENTITY } from '../../enums/entity.enum';
import { TransformQuery } from '../../pipes/transform-query.pipe';
import { MessageRepository } from './message.repository';

@Controller(ENTITY.MESSAGES)
@UseGuards(AuthenticationGuard)
export class MessageController {
  constructor(private messageRepository: MessageRepository) {}

  @Post('/getList')
  @UsePipes(new TransformQuery())
  getList(@Body() query: MongoQuery): any {
    return this.messageRepository.getList(query);
  }
  @Get('/getMessages/:id')
  getMessages(@Param('id') id: string, @Req() req): any {
    return this.messageRepository.getMessages(id, { ...req.user });
  }

  @Get('/getOne/:id')
  getOne(@Param('id') id: string): Promise<Message> {
    return this.messageRepository.getOne(id);
  }

  @Delete('/delete/:id')
  delete(@Param('id') id: string): Promise<boolean> {
    return this.messageRepository.delete(id);
  }
}
