import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return API status info', () => {
      const result = appController.getHello();
      
      expect(result.name).toBe('Lingriser API');
      expect(result.version).toBe('1.0.0');
      expect(result.status).toBe('running');
      expect(result.endpoints).toBeDefined();
      expect(result.endpoints.students).toBe('/api/students');
      expect(result.endpoints.teachers).toBe('/api/teachers');
      expect(result.endpoints.courses).toBe('/api/courses');
      expect(result.endpoints.bookings).toBe('/api/bookings');
      expect(result.endpoints.parents).toBe('/api/parents');
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = appController.healthCheck();
      
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
    });
  });
});
