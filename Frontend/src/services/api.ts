/**
 * API Service - Connects to Lingriser Backend
 */

// Use VITE_API_URL from environment, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============ Types ============

export interface Child {
  id: number;
  name: string;
  email: string;
  phone: string;
  grade: string;
  cefrLevel: string;
  avatarUrl: string | null;
  assignedTeacher: {
    id: number;
    name: string;
  } | null;
}

export interface ProgressVideos {
  beforeVideo: {
    fileUrl: string;
    fileName: string | null;
    uploadedAt: string;
    duration: number | null;
  } | null;
  afterVideo: {
    fileUrl: string;
    fileName: string | null;
    uploadedAt: string;
    duration: number | null;
  } | null;
}

export interface Module {
  id: number;
  moduleNumber: number;
  title: string;
  topic: string;
  weekStartDate: string;
  weekEndDate: string;
}

export interface Enrollment {
  id: number;
  status: string;
  enrolledAt: string;
  currentModuleNumber: number;
  course: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    modules: Module[];
  };
}

export interface LearningHistoryItem {
  id: number;
  activityType: 'in_person_class' | 'ai_practice' | 'video_call';
  startTime: string;
  endTime: string | null;
  status: string;
  module: {
    id: number;
    moduleNumber: number;
    title: string;
  };
  aiFeedback: {
    feedbackText: string;
    pronunciationNotes: string | null;
    grammarNotes: string | null;
    fluencyNotes: string | null;
    vocabularyNotes: string | null;
    overallScore: number | null;
  } | null;
  teacherFeedback: {
    feedbackText: string;
    confidenceNotes: string | null;
    improvementSuggestions: string | null;
    teacherName: string;
  } | null;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  teacherType: 'in_person' | 'video_call' | 'both';
  bio: string;
  specialties: string[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

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

export interface Course {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  price: number;
  status: string;
  classDay: string;
  classStartTime: string;
  classEndTime: string;
  modules?: Module[];
}

// ============ API Functions ============

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // ============ Parents ============
  
  async getChildren(parentId: number = 1): Promise<Child[]> {
    return fetchApi<Child[]>(`/parents/${parentId}/children`);
  },

  async getChildLearningHistory(parentId: number, studentId: number, moduleId?: number): Promise<LearningHistoryItem[]> {
    const query = moduleId ? `?moduleId=${moduleId}` : '';
    return fetchApi<LearningHistoryItem[]>(`/parents/${parentId}/children/${studentId}/learning-history${query}`);
  },

  async getChildEnrollment(parentId: number, studentId: number): Promise<Enrollment | null> {
    return fetchApi<Enrollment>(`/parents/${parentId}/children/${studentId}/enrollment`);
  },

  async getChildProgressVideos(parentId: number, studentId: number, courseId: number): Promise<ProgressVideos> {
    return fetchApi<ProgressVideos>(`/parents/${parentId}/children/${studentId}/progress-videos?courseId=${courseId}`);
  },

  // ============ Students ============

  async getStudents(): Promise<Child[]> {
    return fetchApi<Child[]>('/students');
  },

  async getStudent(id: number): Promise<Child> {
    return fetchApi<Child>(`/students/${id}`);
  },

  async getStudentEnrollment(studentId: number): Promise<Enrollment | null> {
    return fetchApi<Enrollment>(`/students/${studentId}/enrollment`);
  },

  async getStudentLearningHistory(studentId: number, moduleId?: number): Promise<LearningHistoryItem[]> {
    const query = moduleId ? `?moduleId=${moduleId}` : '';
    return fetchApi<LearningHistoryItem[]>(`/students/${studentId}/learning-history${query}`);
  },

  async createStudentLearningHistory(
    studentId: number,
    data: {
      moduleId?: number;
      activityType?: 'in_person_class' | 'ai_practice' | 'video_call';
      startTime?: string;
      endTime?: string;
      aiFeedback?: {
        feedbackText?: string;
        pronunciationNotes?: string | null;
        grammarNotes?: string | null;
        fluencyNotes?: string | null;
        vocabularyNotes?: string | null;
        overallScore?: number | null;
      };
    }
  ): Promise<LearningHistoryItem[]> {
    return fetchApi<LearningHistoryItem[]>(`/students/${studentId}/learning-history`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getStudentProgressVideos(studentId: number, courseId: number): Promise<ProgressVideos> {
    return fetchApi<ProgressVideos>(`/students/${studentId}/progress-videos?courseId=${courseId}`);
  },

  // ============ Teachers ============

  async getTeachers(): Promise<Teacher[]> {
    return fetchApi<Teacher[]>('/teachers');
  },

  async getVideoCallTeachers(): Promise<Teacher[]> {
    return fetchApi<Teacher[]>('/teachers/video-call');
  },

  async getTeacher(id: number): Promise<Teacher> {
    return fetchApi<Teacher>(`/teachers/${id}`);
  },

  async getTeacherAvailability(teacherId: number, date: string): Promise<{ date: string; slots: TimeSlot[]; message?: string }> {
    return fetchApi(`/teachers/${teacherId}/availability?date=${date}`);
  },

  // ============ Courses ============

  async getCourses(): Promise<Course[]> {
    return fetchApi<Course[]>('/courses');
  },

  async getCurrentCourse(): Promise<Course | null> {
    return fetchApi<Course>('/courses/current');
  },

  async getCourse(id: number): Promise<Course> {
    return fetchApi<Course>(`/courses/${id}`);
  },

  async getCourseModules(courseId: number): Promise<Module[]> {
    return fetchApi<Module[]>(`/courses/${courseId}/modules`);
  },

  async getCourseModule(moduleId: number): Promise<Module> {
    return fetchApi<Module>(`/courses/modules/${moduleId}`);
  },

  // ============ Bookings ============

  async createBooking(data: {
    studentId: number;
    teacherId: number;
    moduleId: number;
    bookingDate: string;
    slotStartTime: string;
  }): Promise<Booking> {
    return fetchApi<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getStudentBookings(studentId: number): Promise<Booking[]> {
    return fetchApi<Booking[]>(`/bookings?studentId=${studentId}`);
  },

  async getBooking(id: number): Promise<Booking> {
    return fetchApi<Booking>(`/bookings/${id}`);
  },

  async cancelBooking(id: number): Promise<Booking> {
    return fetchApi<Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' });
  },

  async completeBooking(id: number): Promise<Booking> {
    return fetchApi<Booking>(`/bookings/${id}/complete`, { method: 'PATCH' });
  },

  // ============ Connections ============

  async getStudentConnections(studentId: number): Promise<Connection[]> {
    return fetchApi<Connection[]>(`/students/${studentId}/connections`);
  },

  async createConnection(data: {
    studentId: number;
    email: string;
    linkType: 'parent' | 'teacher';
  }): Promise<Connection> {
    return fetchApi<Connection>('/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteConnection(connectionId: number): Promise<void> {
    return fetchApi<void>(`/connections/${connectionId}`, { method: 'DELETE' });
  },

  // ============ Notifications ============

  async getNotifications(userId: number): Promise<Notification[]> {
    return fetchApi<Notification[]>(`/notifications?userId=${userId}`);
  },

  async getUnreadNotificationCount(userId: number): Promise<{ count: number }> {
    return fetchApi<{ count: number }>(`/notifications/unread-count?userId=${userId}`);
  },

  async markNotificationAsRead(notificationId: number): Promise<void> {
    return fetchApi<void>(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    return fetchApi<void>(`/notifications/mark-all-read?userId=${userId}`, { method: 'PATCH' });
  },

  // ============ Inaugural Registrations ============

  async submitInauguralRegistration(data: {
    parentName: string;
    phone: string;
    email: string;
    primaryGoal?: string;
    wantsToSignup: boolean;
    interestReason?: string;
    rejectionReason?: string;
  }): Promise<{ id: number }> {
    return fetchApi<{ id: number }>('/inaugural-registrations', {
      method: 'POST',
      body: JSON.stringify({
        parent_name: data.parentName,
        phone: data.phone,
        email: data.email,
        primary_goal: data.primaryGoal || null,
        wants_to_signup: data.wantsToSignup,
        interest_reason: data.interestReason || null,
        rejection_reason: data.rejectionReason || null,
      }),
    });
  },
};

// Notification type
export interface Notification {
  id: number;
  type: 'connection_request' | 'connection_accepted' | 'booking_reminder' | 'general';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Connection type
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
