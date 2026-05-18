import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  getOrCreateConversation(@CurrentUser('userId') userId: number) {
    return this.chatService.getOrCreateConversation(userId);
  }

  @Get('conversations/my')
  getUserConversations(@CurrentUser('userId') userId: number) {
    return this.chatService.getUserConversations(userId);
  }

  @Get('user/unread-count')
  getUserUnreadCount(@CurrentUser('userId') userId: number) {
    return this.chatService.getUserUnreadCount(userId);
  }

  @Get('conversations/:id/messages')
  getConversationMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') role: string,
  ) {
    if (role === UserRole.ADMIN) {
      return this.chatService.getAdminConversationMessages(id, userId);
    }
    return this.chatService.getConversationMessages(id, userId);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') role: string,
    @Body('message') message: string,
  ) {
    if (role === UserRole.ADMIN) {
      return this.chatService.sendAdminMessage(id, userId, message);
    }
    return this.chatService.sendMessage(id, userId, message);
  }

  @Get('admin/conversations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllConversations(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getAllConversations({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('admin/unread-count')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminUnreadCount() {
    return this.chatService.getAdminUnreadCount();
  }

  @Patch('admin/conversations/:id/close')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  closeConversation(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.closeConversation(id);
  }
}
