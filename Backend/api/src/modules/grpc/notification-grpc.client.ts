import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(process.cwd(), 'proto', 'notification.proto');

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

  private wrapString(val?: string): { value: string } | undefined {
    return val != null ? { value: val } : undefined;
  }

  private wrapBool(val?: boolean): { value: boolean } | undefined {
    return val != null ? { value: val } : undefined;
  }

  private wrapInt(val?: number): { value: number } | undefined {
    return val != null ? { value: val } : undefined;
  }

  createNotification(data: {
    recipient_id?: string;
    type?: string;
    title?: string;
    message?: string;
    data?: string;
  }) {
    return this.call(this.notificationClient, 'createNotification', {
      recipient_id: this.wrapString(data.recipient_id),
      type: this.wrapString(data.type),
      title: this.wrapString(data.title),
      message: this.wrapString(data.message),
      data: this.wrapString(data.data),
    });
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
    }>(this.notificationClient, 'listNotifications', {
      recipient_id: this.wrapString(data.recipient_id),
      type: this.wrapString(data.type),
      is_read: this.wrapBool(data.is_read),
      page: this.wrapInt(data.page),
      limit: this.wrapInt(data.limit),
    });
  }

  markAsRead(data: { id?: string }) {
    return this.call(this.notificationClient, 'markAsRead', {
      id: this.wrapString(data.id),
    });
  }

  markAllAsRead(data: { recipient_id?: string }) {
    return this.call(this.notificationClient, 'markAllAsRead', {
      recipient_id: this.wrapString(data.recipient_id),
    });
  }

  getNotification(data: { id?: string }) {
    return this.call(this.notificationClient, 'getNotification', {
      id: this.wrapString(data.id),
    });
  }

  deleteNotification(data: { id?: string }) {
    return this.call(this.notificationClient, 'deleteNotification', {
      id: this.wrapString(data.id),
    });
  }

  getPreferences(data: { identity_id?: string }) {
    return this.call(this.preferencesClient, 'getPreferences', {
      identity_id: this.wrapString(data.identity_id),
    });
  }

  updatePreferences(data: {
    identity_id?: string;
    email_enabled?: boolean;
    push_enabled?: boolean;
    achievement_enabled?: boolean;
    report_enabled?: boolean;
    system_enabled?: boolean;
  }) {
    return this.call(this.preferencesClient, 'updatePreferences', {
      identity_id: this.wrapString(data.identity_id),
      email_enabled: this.wrapBool(data.email_enabled),
      push_enabled: this.wrapBool(data.push_enabled),
      achievement_enabled: this.wrapBool(data.achievement_enabled),
      report_enabled: this.wrapBool(data.report_enabled),
      system_enabled: this.wrapBool(data.system_enabled),
    });
  }
}
