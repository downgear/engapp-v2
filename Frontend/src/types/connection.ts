/**
 * Connection-related types
 */

export interface Connection {
  id: number;
  linkedUserId: number;
  linkType: 'parent' | 'teacher';
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  teacher?: {
    id: number;
    teacherType: 'in_person' | 'video_call' | 'both';
    bio?: string;
    specialties?: string[];
  };
}
