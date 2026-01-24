import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      name: 'Lingriser API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth (login, register, profile)',
        students: '/api/students',
        teachers: '/api/teachers',
        courses: '/api/courses',
        bookings: '/api/bookings',
        parents: '/api/parents',
      },
    };
  }
}
