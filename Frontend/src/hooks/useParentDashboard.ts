import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { Child, ProgressVideos, LearningHistoryItem, Enrollment } from "@/types";

// Default parent ID for demo
const DEMO_PARENT_ID = 1;

interface UseChildrenResult {
  children: Child[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseProgressVideosResult {
  progressVideos: ProgressVideos | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseLearningHistoryResult {
  learningHistory: LearningHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseEnrollmentResult {
  enrollment: Enrollment | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch children data for parent dashboard
 */
export function useChildren(parentId: number = DEMO_PARENT_ID): UseChildrenResult {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getChildren(parentId);
      setChildren(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch children"));
    } finally {
      setIsLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return { children, isLoading, error, refetch: fetchChildren };
}

/**
 * Hook to fetch progress videos for a specific child
 */
export function useProgressVideos(
  studentId: number | null,
  courseId: number = 1,
  parentId: number = DEMO_PARENT_ID
): UseProgressVideosResult {
  const [progressVideos, setProgressVideos] = useState<ProgressVideos | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgressVideos = useCallback(async () => {
    if (!studentId) {
      setProgressVideos(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getChildProgressVideos(parentId, studentId, courseId);
      setProgressVideos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch progress videos"));
    } finally {
      setIsLoading(false);
    }
  }, [studentId, courseId, parentId]);

  useEffect(() => {
    fetchProgressVideos();
  }, [fetchProgressVideos]);

  return { progressVideos, isLoading, error, refetch: fetchProgressVideos };
}

/**
 * Hook to fetch learning history for a specific child
 */
export function useLearningHistory(
  studentId: number | null,
  moduleId?: number,
  parentId: number = DEMO_PARENT_ID
): UseLearningHistoryResult {
  const [learningHistory, setLearningHistory] = useState<LearningHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLearningHistory = useCallback(async () => {
    if (!studentId) {
      setLearningHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getChildLearningHistory(parentId, studentId, moduleId);
      setLearningHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch learning history"));
    } finally {
      setIsLoading(false);
    }
  }, [studentId, moduleId, parentId]);

  useEffect(() => {
    fetchLearningHistory();
  }, [fetchLearningHistory]);

  return { learningHistory, isLoading, error, refetch: fetchLearningHistory };
}

/**
 * Hook to fetch enrollment for a specific child
 */
export function useEnrollment(
  studentId: number | null,
  parentId: number = DEMO_PARENT_ID
): UseEnrollmentResult {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnrollment = useCallback(async () => {
    if (!studentId) {
      setEnrollment(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getChildEnrollment(parentId, studentId);
      setEnrollment(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch enrollment"));
    } finally {
      setIsLoading(false);
    }
  }, [studentId, parentId]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  return { enrollment, isLoading, error, refetch: fetchEnrollment };
}
