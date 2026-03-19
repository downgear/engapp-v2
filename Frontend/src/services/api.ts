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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

  async getChildAIPracticeStats(parentId: number, studentId: number, weeks: number = 8): Promise<AIPracticeWeeklyStats> {
    return fetchApi<AIPracticeWeeklyStats>(`/parents/${parentId}/children/${studentId}/ai-practice-stats?weeks=${weeks}`);
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
        speechToText?: string;
        responseDuration?: number;
        pauseDetection?: Record<string, unknown>;
        sessionLength?: number;
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

  async uploadStudentVideo(
    studentId: number,
    courseId: number,
    videoType: 'before' | 'after',
    file: File,
  ): Promise<ProgressVideos> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('videoType', videoType);
    formData.append('courseId', courseId.toString());

    const response = await fetch(`${API_BASE_URL}/students/${studentId}/upload-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async deleteStudentVideo(
    studentId: number,
    courseId: number,
    videoType: 'before' | 'after',
  ): Promise<ProgressVideos> {
    return fetchApi<ProgressVideos>(
      `/students/${studentId}/progress-video?videoType=${videoType}&courseId=${courseId}`,
      { method: 'DELETE' },
    );
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

  async getTeachingCourses(teacherId: number): Promise<TeachingCourse[]> {
    return fetchApi<TeachingCourse[]>(`/teachers/${teacherId}/teaching-courses`);
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

  async getStudentAIPracticeStats(studentId: number, weeks: number = 8): Promise<AIPracticeWeeklyStats> {
    return fetchApi<AIPracticeWeeklyStats>(`/students/${studentId}/ai-practice-stats?weeks=${weeks}`);
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

  // ============ Meeting Status ============

  async startMeeting(token: string, bookingId: number, teacherId: number): Promise<Booking> {
    return fetchApi(`/bookings/${bookingId}/start-meeting`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teacherId }),
    });
  },

  async endMeeting(token: string, bookingId: number, teacherId: number): Promise<Booking> {
    return fetchApi(`/bookings/${bookingId}/end-meeting`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teacherId }),
    });
  },

  async addTeacherFeedback(token: string, bookingId: number, teacherId: number, feedback: string): Promise<Booking> {
    return fetchApi(`/bookings/${bookingId}/teacher-feedback`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ teacherId, feedback }),
    });
  },

  async addStudentRating(token: string, bookingId: number, studentId: number, rating: number, comment?: string): Promise<Booking> {
    return fetchApi(`/bookings/${bookingId}/student-rating`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId, rating, comment }),
    });
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

  async createAdminUser(
    token: string,
    data: { email: string; password: string; fullName: string; phone?: string; role: string }
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
    return fetchApi('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateAdminUserRole(
    token: string,
    id: number,
    role: string
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
    return fetchApi(`/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
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

  // ============ Google Auth (for Teachers) ============

  /**
   * Exchange Google authorization code for tokens (GIS popup flow)
   * Frontend gets the code via popup, sends it here to exchange for tokens
   */
  async exchangeGoogleCode(token: string, code: string): Promise<{ success: boolean; email?: string }> {
    return fetchApi('/auth/google/exchange-code', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    });
  },

  async getGoogleConnectionStatus(token: string): Promise<{ connected: boolean; email?: string }> {
    return fetchApi('/auth/google/status', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async disconnectGoogle(token: string): Promise<{ success: boolean; message: string }> {
    return fetchApi('/auth/google/disconnect', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Programs (Public) ============

  async getAllPrograms(): Promise<ProgramResponse[]> {
    return fetchApi('/programs');
  },

  // ============ Programs (Admin) ============

  async createProgram(token: string, data: { name: string; description?: string }): Promise<ProgramResponse> {
    return fetchApi('/programs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateProgram(token: string, id: number, data: { name?: string; description?: string }): Promise<ProgramResponse> {
    return fetchApi(`/programs/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteProgram(token: string, id: number): Promise<{ success: boolean }> {
    return fetchApi(`/programs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Cohorts (Admin) ============

  async createCohort(token: string, data: { name: string; startDate: string; status?: string; programId: number }): Promise<CohortResponse> {
    return fetchApi('/programs/cohorts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateCohort(token: string, id: number, data: { name?: string; startDate?: string; status?: string }): Promise<CohortResponse> {
    return fetchApi(`/programs/cohorts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteCohort(token: string, id: number): Promise<{ success: boolean }> {
    return fetchApi(`/programs/cohorts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Cohort Courses (Admin) ============

  async createCohortCourse(token: string, data: { cohortId: number; courseId: number; teacherId?: number | null; level?: string; displayName?: string; description?: string; maxStudents?: number }): Promise<CohortCourseResponse> {
    return fetchApi('/programs/cohort-courses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateCohortCourse(token: string, id: number, data: { teacherId?: number | null; level?: string; displayName?: string; description?: string; maxStudents?: number }): Promise<CohortCourseResponse> {
    return fetchApi(`/programs/cohort-courses/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteCohortCourse(token: string, id: number): Promise<{ success: boolean }> {
    return fetchApi(`/programs/cohort-courses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Modules (Admin) ============

  async createModule(token: string, data: {
    courseId: number;
    moduleNumber: number;
    title: string;
    topic: string;
    description?: string;
    weekStartDate?: string;
    weekEndDate?: string;
    mondayContent?: ModuleContentData | null;
    aiPracticeContent?: AIPracticeContentData | null;
    teacherSessionContent?: TeacherSessionContentData | null;
  }): Promise<ModuleResponse> {
    return fetchApi('/programs/modules', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateModule(token: string, id: number, data: {
    moduleNumber?: number;
    title?: string;
    topic?: string;
    description?: string;
    weekStartDate?: string;
    weekEndDate?: string;
    mondayContent?: ModuleContentData | null;
    aiPracticeContent?: AIPracticeContentData | null;
    teacherSessionContent?: TeacherSessionContentData | null;
  }): Promise<ModuleResponse> {
    return fetchApi(`/programs/modules/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async deleteModule(token: string, id: number): Promise<{ success: boolean }> {
    return fetchApi(`/programs/modules/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Student Cohort Enrollments ============

  async enrollInCohortCourse(token: string, studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment> {
    return fetchApi('/programs/enroll', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId, cohortCourseId }),
    });
  },

  async getCohortEnrollment(token: string, studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment | null> {
    return fetchApi(`/programs/enrollment/${studentId}/${cohortCourseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getStudentCohortEnrollments(token: string, studentId: number): Promise<StudentCohortEnrollment[]> {
    return fetchApi(`/programs/enrollments/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async markCohortEnrollmentPaid(token: string, studentId: number, cohortCourseId: number): Promise<StudentCohortEnrollment> {
    return fetchApi('/programs/enrollment/pay', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId, cohortCourseId }),
    });
  },

  async checkCohortEnrollmentPaid(token: string, studentId: number, cohortCourseId: number): Promise<{ paid: boolean }> {
    return fetchApi(`/programs/enrollment/check/${studentId}/${cohortCourseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // ============ Weekly Focus (3L Model) ============

  async createOrUpdateWeeklyFocus(token: string, data: {
    moduleId: number;
    teacherId: number;
    weekTopic: string;
    speakingGoals?: string[];
    teacherNotes?: string;
  }): Promise<WeeklyFocusResponse> {
    return fetchApi('/weekly-focus', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async updateWeeklyFocus(token: string, id: number, data: {
    weekTopic?: string;
    speakingGoals?: string[];
    teacherNotes?: string;
  }): Promise<WeeklyFocusResponse> {
    return fetchApi(`/weekly-focus/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },

  async getWeeklyFocusByModule(moduleId: number): Promise<WeeklyFocusResponse | null> {
    return fetchApi(`/weekly-focus/module/${moduleId}`);
  },

  async getWeeklyFocusByTeacher(token: string, teacherId: number): Promise<WeeklyFocusResponse[]> {
    return fetchApi(`/weekly-focus/teacher/${teacherId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getMentorBrief(token: string, studentId: number, moduleId: number): Promise<MentorBriefResponse> {
    return fetchApi(`/weekly-focus/mentor-brief?studentId=${studentId}&moduleId=${moduleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

// ============ Program Types ============

export interface StudentCohortEnrollment {
  id: number;
  studentId: number;
  cohortCourseId: number;
  paid: boolean;
  paidAt: string | null;
  enrolledAt: string;
  cohortCourse?: CohortCourseResponse;
}

export interface ProgramResponse {
  id: number;
  name: string;
  description: string;
  cohorts: CohortResponse[];
}

export interface CohortResponse {
  id: number;
  name: string;
  startDate: string;
  status: string;
  courses: CohortCourseResponse[];
}

export interface ModuleContentData {
  vocabulary?: string[];
  grammar?: string;
  activities?: string;
  notes?: string;
}

export interface AIPracticeContentData {
  topics?: string[];
  exercises?: string;
  notes?: string;
}

export interface TeacherSessionContentData {
  goals?: string[];
  focus?: string;
  notes?: string;
}

export interface ModuleResponse {
  id: number;
  courseId?: number;
  moduleNumber: number;
  title: string;
  topic: string;
  description?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  mondayContent?: ModuleContentData | null;
  aiPracticeContent?: AIPracticeContentData | null;
  teacherSessionContent?: TeacherSessionContentData | null;
}

export interface CohortCourseResponse {
  id: number;
  courseId: number;
  name: string;
  description: string;
  level: string;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  enrolledStudents: number;
  maxStudents: number;
  teacherId?: number | null;
  teacher?: {
    id: number;
    name: string;
    email: string;
  } | null;
  modules: ModuleResponse[];
}

export interface TeachingCourse {
  id: number;
  courseId: number;
  name: string;
  description: string;
  level: string;
  enrolledStudents: number;
  maxStudents: number;
  status: string;
  startDate: string;
  endDate: string;
  cohort: {
    id: number;
    name: string;
    startDate: string;
    status: string;
  };
  program: {
    id: number;
    name: string;
  } | null;
  moduleCount: number;
}

// ============ Weekly Focus Types (3L Model) ============

export interface WeeklyFocusResponse {
  id: number;
  moduleId: number;
  teacherId: number;
  weekTopic: string;
  speakingGoals: string[];
  teacherNotes: string | null;
  createdAt: string;
  updatedAt: string;
  module?: {
    id: number;
    moduleNumber: number;
    title: string;
    topic: string;
  };
}

export interface MentorBriefResponse {
  weeklyFocus: WeeklyFocusResponse | null;
  aiPracticeCount: number;
  lastAiFeedbackSummary: string | null;
}

export interface AIPracticeWeeklyStats {
  weeklyData: {
    week: string;
    weekLabel: string;
    sessions: number;
    minutes: number;
  }[];
  totalSessions: number;
  totalMinutes: number;
  completedPracticeRounds: number;
  currentStreakDays: number;
  recommendedDailyMinutesMin: number;
  recommendedDailyMinutesMax: number;
}
