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

  // ==================== USER ENDPOINTS ====================

  /**
   * Get or create a conversation for current user
   */
  @Post('conversations')
  getOrCreateConversation(@CurrentUser('userId') userId: number) {
    return this.chatService.getOrCreateConversation(userId);
  }

  /**
   * Get all conversations for current user
   */
  @Get('conversations/my')
  getUserConversations(@CurrentUser('userId') userId: number) {
    return this.chatService.getUserConversations(userId);
  }

  /**
   * Get messages for a conversation (for user)
   */
  @Get('conversations/:id/messages')
  getConversationMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') role: string,
  ) {
    // If admin, use admin endpoint
    if (role === UserRole.ADMIN) {
      return this.chatService.getAdminConversationMessages(id, userId);
    }
    return this.chatService.getConversationMessages(id, userId);
  }

  /**
   * Send a message to a conversation (for user)
   */
  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') role: string,
    @Body('message') message: string,
  ) {
    // If admin, use admin endpoint
    if (role === UserRole.ADMIN) {
      return this.chatService.sendAdminMessage(id, userId, message);
    }
    return this.chatService.sendMessage(id, userId, message);
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all conversations (admin only)
   */
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

  /**
   * Get unread count (admin only)
   */
  @Get('admin/unread-count')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAdminUnreadCount() {
    return this.chatService.getAdminUnreadCount();
  }

  /**
   * Close a conversation (admin only)
   */
  @Patch('admin/conversations/:id/close')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  closeConversation(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.closeConversation(id);
  }
}
