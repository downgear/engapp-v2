/**
 * Teacher-related types
 */

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  teacherType: 'in_person' | 'video_call' | 'both';
  bio: string;
  specialties: string[];
  rating: number | null;
  reviewCount: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
