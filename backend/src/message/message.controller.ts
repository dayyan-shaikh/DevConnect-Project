import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // send a message
  @Post()
  async send(@Body() dto: CreateMessageDto) {
    console.log('Received message data:', dto);
    console.log('Data types:', {
      senderId: typeof dto.senderId,
      receiverId: typeof dto.receiverId,
      content: typeof dto.content,
      contentValue: dto.content
    });
    
    // In production, replace dto.senderId with authenticated user id
    const saved = await this.messageService.create(dto);
    return saved;
  }

  // get conversation between current user and param userId
  @Get('conversation/:userA/:userB')
  async getConversation(
    @Param('userA') userA: string,
    @Param('userB') userB: string,
  ) {
    return this.messageService.getConversation(userA, userB);
  }

  // get conversation partners + last message for a user
  @Get('conversations/:userId')
  async getConversations(@Param('userId') userId: string) {
    return this.messageService.getConversationsForUser(userId);
  }
}
