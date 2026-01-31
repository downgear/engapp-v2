/**
 * Booking-related types
 */

export type MeetingStatus = 'pending' | 'in_progress' | 'ended';

export interface Booking {
  id: number;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  meetingStatus: MeetingStatus;
  meetingLink?: string | null;
  googleEventId?: string | null;
  endedAt?: string | null;
  teacherFeedback?: string | null;
  studentRating?: number | null;
  studentComment?: string | null;
  createdAt: string;
  student?: { id: number; name: string };
  teacher?: { id: number; name: string };
  module?: { id: number; moduleNumber: number; title: string };
}
