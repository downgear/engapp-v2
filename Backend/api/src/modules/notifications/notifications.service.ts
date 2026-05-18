import { Injectable } from '@nestjs/common';
import { NotificationGrpcClient } from '../grpc/notification-grpc.client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationGrpc: NotificationGrpcClient,
  ) {}

  async getByUserId(identityId: string) {
    const result = await this.notificationGrpc.listNotifications({
      recipient_id: identityId,
      limit: 20,
    });
    return (result.notifications || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data ? (typeof n.data === 'string' ? JSON.parse(n.data) : n.data) : null,
      isRead: n.is_read,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));
  }

  async getUnreadCount(identityId: string) {
    const result = await this.notificationGrpc.listNotifications({
      recipient_id: identityId,
      is_read: false,
      limit: 1,
    });
    return { count: result.unread_count || 0 };
  }

  async markAsRead(id: string) {
    await this.notificationGrpc.markAsRead({ id });
    return { success: true };
  }

  async markAllAsRead(identityId: string) {
    await this.notificationGrpc.markAllAsRead({ recipient_id: identityId });
    return { success: true };
  }
}
