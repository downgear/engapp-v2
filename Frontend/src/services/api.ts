/**
 * API Service - Connects to Lingriser Backend
 */

import type {
  Child,
  ProgressVideos,
  LearningHistoryItem,
  Enrollment,
  Course,
  Module,
  Teacher,
  TimeSlot,
  Booking,
  Connection,
  Notification,
} from '@/types';

// Use VITE_API_URL from environment, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============ API Functions ============

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const { headers: optionHeaders, ...restOptions } = options || {};
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders as Record<string, string>),
    },
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

  // ============ Payments ============

  /**
   * Create a pending payment session
   * Returns transaction code to include in bank transfer
   */
  async createPendingPayment(studentId: number): Promise<{ 
    transactionCode: string; 
    amount: number;
    expiresIn: number;
  }> {
    return fetchApi('/payments/create-pending', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  /**
   * Check payment status (poll this to detect when payment is confirmed)
   */
  async checkPaymentStatus(studentId: number): Promise<{ 
    paid: boolean; 
    paidAt: string | null;
    pendingPayment?: {
      transactionCode: string;
      amount: number;
      expiresAt: string;
    };
  }> {
    return fetchApi(`/payments/status/${studentId}`);
  },

  /**
   * Manual payment confirmation (for demo/admin)
   */
  async processPayment(studentId: number, moduleId: number): Promise<{ success: boolean; message: string }> {
    return fetchApi<{ success: boolean; message: string }>('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ studentId, moduleId }),
    });
  },

  // ============ Admin ============

  async getAdminUserStatistics(token: string): Promise<{
    total: number;
    breakdown: Array<{ role: string; count: number; percentage: number }>;
  }> {
    return fetchApi('/admin/statistics/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminVisitStatistics(token: string, hours: number = 24): Promise<{
    total: number;
    hourlyData: Array<{ hour: string; count: number }>;
  }> {
    return fetchApi(`/admin/statistics/visits?hours=${hours}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminPracticeStatistics(token: string, hours: number = 24): Promise<{
    aiPractice: { total: number; hourlyData: Array<{ hour: string; count: number }> };
    videoCall: { total: number; hourlyData: Array<{ hour: string; count: number }> };
  }> {
    return fetchApi(`/admin/statistics/practice?hours=${hours}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminUsers(
    token: string,
    options: { page?: number; limit?: number; role?: string; search?: string } = {}
  ): Promise<{
    users: Array<{
      id: number;
      email: string;
      fullName: string;
      phone: string | null;
      role: string;
      avatarUrl: string | null;
      isLocked: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.role) params.append('role', options.role);
    if (options.search) params.append('search', options.search);
    return fetchApi(`/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminUserById(token: string, id: number): Promise<{
    id: number;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    avatarUrl: string | null;
    isLocked: boolean;
    createdAt: string;
    updatedAt: string;
  }> {
    return fetchApi(`/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async updateAdminUser(
    token: string,
    id: number,
    data: { fullName?: string; email?: string; phone?: string }
  ): Promise<{
    id: number;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    avatarUrl: string | null;
    isLocked: boolean;
    createdAt: string;
    updatedAt: string;
  }> {
    return fetchApi(`/admin/users/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async toggleAdminUserLock(token: string, id: number): Promise<{
    id: number;
    isLocked: boolean;
    message: string;
  }> {
    return fetchApi(`/admin/users/${id}/lock`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Chat (User) ============

  async getOrCreateConversation(token: string): Promise<{
    id: number;
    userId: number;
    user: { id: number; fullName: string; email: string; role: string } | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }> {
    return fetchApi('/chat/conversations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getUserConversations(token: string): Promise<Array<{
    id: number;
    userId: number;
    status: string;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
  }>> {
    return fetchApi('/chat/conversations/my', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getConversationMessages(token: string, conversationId: number): Promise<Array<{
    id: number;
    conversationId: number;
    senderId: number;
    sender: { id: number; fullName: string; role: string } | null;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>> {
    return fetchApi(`/chat/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async sendChatMessage(token: string, conversationId: number, message: string): Promise<{
    id: number;
    conversationId: number;
    senderId: number;
    message: string;
    isRead: boolean;
    createdAt: string;
  }> {
    return fetchApi(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
    });
  },

  async getUserUnreadCount(token: string): Promise<{ count: number }> {
    return fetchApi('/chat/user/unread-count', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Chat (Admin) ============

  async getAdminConversations(token: string, options: { status?: string; page?: number; limit?: number } = {}): Promise<{
    conversations: Array<{
      id: number;
      userId: number;
      user: { id: number; fullName: string; email: string; role: string } | null;
      status: string;
      unreadCount: number;
      lastMessage: { message: string; createdAt: string } | null;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    return fetchApi(`/chat/admin/conversations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getAdminUnreadCount(token: string): Promise<{ count: number }> {
    return fetchApi('/chat/admin/unread-count', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async closeConversation(token: string, conversationId: number): Promise<{ id: number; status: string }> {
    return fetchApi(`/chat/admin/conversations/${conversationId}/close`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
