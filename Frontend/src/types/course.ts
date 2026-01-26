/**
 * Course and Module-related types
 */

import { Module } from './module';

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
