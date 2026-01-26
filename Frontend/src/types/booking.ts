/**
 * Booking-related types
 */

export interface Booking {
  id: number;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
  student?: { id: number; name: string };
  teacher?: { id: number; name: string };
  module?: { id: number; moduleNumber: number; title: string };
}
