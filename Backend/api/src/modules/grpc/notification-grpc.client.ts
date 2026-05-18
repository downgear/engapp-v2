import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '..', '..', '..', 'proto', 'notification.proto');

@Injectable()
export class NotificationGrpcClient implements OnModuleInit {
  private readonly logger = new Logger(NotificationGrpcClient.name);
  private notificationClient: any;
  private preferencesClient: any;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url =
      this.configService.get<string>('NOTIFICATION_GRPC_URL') ||
      `${this.configService.get<string>('NOTIFICATION_GRPC_HOST', 'localhost')}:${this.configService.get<string>('NOTIFICATION_GRPC_PORT', '50060')}`;

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    this.notificationClient = new proto.notification.NotificationService(
      url,
      grpc.credentials.createInsecure(),
    );
    this.preferencesClient = new proto.notification.NotificationPreferencesService(
      url,
      grpc.credentials.createInsecure(),
    );
    this.logger.log(`Notification gRPC client connected to ${url}`);
  }

  private call<T>(client: any, method: string, request: any): Promise<T> {
    return new Promise((resolve, reject) => {
      client[method](request, (error: any, response: T) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  createNotification(data: {
    recipient_id?: string;
    type?: string;
    title?: string;
    message?: string;
    data?: string;
  }) {
    return this.call(this.notificationClient, 'createNotification', data);
  }

  listNotifications(data: {
    recipient_id?: string;
    type?: string;
    is_read?: boolean;
    page?: number;
    limit?: number;
  }) {
    return this.call<{
      notifications: any[];
      total_count: number;
      unread_count: number;
    }>(this.notificationClient, 'listNotifications', data);
  }

  markAsRead(data: { id?: string }) {
    return this.call(this.notificationClient, 'markAsRead', data);
  }

  markAllAsRead(data: { recipient_id?: string }) {
    return this.call(this.notificationClient, 'markAllAsRead', data);
  }

  getNotification(data: { id?: string }) {
    return this.call(this.notificationClient, 'getNotification', data);
  }

  deleteNotification(data: { id?: string }) {
    return this.call(this.notificationClient, 'deleteNotification', data);
  }

  getPreferences(data: { identity_id?: string }) {
    return this.call(this.preferencesClient, 'getPreferences', data);
  }

  updatePreferences(data: {
    identity_id?: string;
    email_enabled?: boolean;
    push_enabled?: boolean;
    achievement_enabled?: boolean;
    report_enabled?: boolean;
    system_enabled?: boolean;
  }) {
    return this.call(this.preferencesClient, 'updatePreferences', data);
  }
}
