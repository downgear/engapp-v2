import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { ChatConversation, ConversationStatus } from '../../entities/chat-conversation.entity';
import { ChatMessage } from '../../entities/chat-message.entity';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatConversation)
    private readonly conversationRepo: Repository<ChatConversation>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ==================== USER ENDPOINTS ====================

  /**
   * Get or create a conversation for a user
   */
  async getOrCreateConversation(userId: number) {
    // Check if user has an open conversation
    let conversation = await this.conversationRepo.findOne({
      where: { userId, status: ConversationStatus.OPEN },
      relations: ['user', 'admin'],
    });

    if (!conversation) {
      // Create new conversation
      conversation = this.conversationRepo.create({
        userId,
        status: ConversationStatus.OPEN,
      });
      await this.conversationRepo.save(conversation);
      
      // Reload with relations
      conversation = await this.conversationRepo.findOne({
        where: { id: conversation.id },
        relations: ['user', 'admin'],
      });
    }

    return this.formatConversation(conversation!);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: number) {
    const conversations = await this.conversationRepo.find({
      where: { userId },
      relations: ['user', 'admin'],
      order: { updatedAt: 'DESC' },
    });

    return Promise.all(conversations.map(async (conv) => {
      const unreadCount = await this.messageRepo.count({
        where: {
          conversationId: conv.id,
          senderId: Not(userId),
          isRead: false,
        },
      });
      return { ...this.formatConversation(conv), unreadCount };
    }));
  }

  /**
   * Get messages for a conversation (for user)
   */
  async getConversationMessages(conversationId: number, userId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user has access
    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const messages = await this.messageRepo.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    // Mark messages from other user as read
    await this.messageRepo.update(
      { conversationId, senderId: Not(userId), isRead: false },
      { isRead: true },
    );

    return messages.map((msg) => this.formatMessage(msg));
  }

  /**
   * Send a message (for user)
   */
  async sendMessage(conversationId: number, userId: number, messageText: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (conversation.status === ConversationStatus.CLOSED) {
      throw new ForbiddenException('Conversation is closed');
    }

    const message = this.messageRepo.create({
      conversationId,
      senderId: userId,
      message: messageText,
    });
    await this.messageRepo.save(message);

    // Update conversation updatedAt
    conversation.updatedAt = new Date();
    await this.conversationRepo.save(conversation);

    // Reload with sender
    const savedMessage = await this.messageRepo.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });

    return this.formatMessage(savedMessage!);
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Get all conversations (for admin)
   */
  async getAllConversations(options: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.conversationRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.user', 'user')
      .leftJoinAndSelect('conv.admin', 'admin');

    if (status && status !== 'all') {
      queryBuilder.where('conv.status = :status', { status });
    }

    const [conversations, total] = await queryBuilder
      .orderBy('conv.updatedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await this.messageRepo.count({
          where: {
            conversationId: conv.id,
            senderId: conv.userId, // Messages from user (not admin)
            isRead: false,
          },
        });
        
        // Get last message
        const lastMessage = await this.messageRepo.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        return {
          ...this.formatConversation(conv),
          unreadCount,
          lastMessage: lastMessage ? {
            message: lastMessage.message,
            createdAt: lastMessage.createdAt,
          } : null,
        };
      }),
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get messages for a conversation (for admin)
   */
  async getAdminConversationMessages(conversationId: number, adminId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const messages = await this.messageRepo.find({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });

    // Mark messages from user as read
    await this.messageRepo.update(
      { conversationId, senderId: conversation.userId, isRead: false },
      { isRead: true },
    );

    // Assign admin if not assigned
    if (!conversation.adminId) {
      conversation.adminId = adminId;
      await this.conversationRepo.save(conversation);
    }

    return messages.map((msg) => this.formatMessage(msg));
  }

  /**
   * Send a message (for admin)
   */
  async sendAdminMessage(conversationId: number, adminId: number, messageText: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.status === ConversationStatus.CLOSED) {
      throw new ForbiddenException('Conversation is closed');
    }

    // Assign admin if not assigned
    if (!conversation.adminId) {
      conversation.adminId = adminId;
    }

    const message = this.messageRepo.create({
      conversationId,
      senderId: adminId,
      message: messageText,
    });
    await this.messageRepo.save(message);

    // Update conversation updatedAt
    conversation.updatedAt = new Date();
    await this.conversationRepo.save(conversation);

    // Reload with sender
    const savedMessage = await this.messageRepo.findOne({
      where: { id: message.id },
      relations: ['sender'],
    });

    return this.formatMessage(savedMessage!);
  }

  /**
   * Close a conversation (for admin)
   */
  async closeConversation(conversationId: number) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    conversation.status = ConversationStatus.CLOSED;
    await this.conversationRepo.save(conversation);

    return { id: conversationId, status: ConversationStatus.CLOSED };
  }

  /**
   * Get unread count for admin
   */
  async getAdminUnreadCount() {
    // Count messages from users in open conversations that are unread
    const count = await this.messageRepo
      .createQueryBuilder('msg')
      .innerJoin('msg.conversation', 'conv')
      .innerJoin('conv.user', 'user')
      .where('msg.sender_id = conv.user_id') // Message from user
      .andWhere('msg.is_read = false')
      .andWhere('conv.status = :status', { status: ConversationStatus.OPEN })
      .getCount();

    return { count };
  }

  // ==================== HELPERS ====================

  private formatConversation(conv: ChatConversation) {
    return {
      id: conv.id,
      userId: conv.userId,
      user: conv.user ? {
        id: conv.user.id,
        fullName: conv.user.fullName,
        email: conv.user.email,
        role: conv.user.role,
        avatarUrl: conv.user.avatarUrl,
      } : null,
      adminId: conv.adminId,
      admin: conv.admin ? {
        id: conv.admin.id,
        fullName: conv.admin.fullName,
      } : null,
      status: conv.status,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  }

  private formatMessage(msg: ChatMessage) {
    return {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      sender: msg.sender ? {
        id: msg.sender.id,
        fullName: msg.sender.fullName,
        role: msg.sender.role,
        avatarUrl: msg.sender.avatarUrl,
      } : null,
      message: msg.message,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    };
  }
}
