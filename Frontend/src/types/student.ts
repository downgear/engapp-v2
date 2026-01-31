/**
 * Student-related types
 */

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

export interface LearningHistoryItem {
  id: number;
  activityType: 'in_person_class' | 'ai_practice' | 'video_call';
  startTime: string;
  endTime: string | null;
  status: string;
  bookingId: number | null;
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
