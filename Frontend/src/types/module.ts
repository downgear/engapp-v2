/**
 * Module-related types
 */

export interface ModuleContent {
  vocabulary?: string[];
  grammar?: string;
  activities?: string;
  notes?: string;
}

export interface AIPracticeContent {
  topics?: string[];
  exercises?: string;
  notes?: string;
}

export interface TeacherSessionContent {
  goals?: string[];
  focus?: string;
  notes?: string;
}

export interface Module {
  id: number;
  moduleNumber: number;
  title: string;
  topic: string;
  description?: string;
  weekStartDate: string;
  weekEndDate: string;
  mondayContent?: ModuleContent | null;
  aiPracticeContent?: AIPracticeContent | null;
  teacherSessionContent?: TeacherSessionContent | null;
}
