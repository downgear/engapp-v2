/**
 * Notification-related types
 */

export interface Notification {
  id: number;
  type: 'connection_request' | 'connection_accepted' | 'booking_reminder' | 'general';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}
