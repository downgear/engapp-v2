import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoursesService } from './courses.service';
import { Course, Module, CourseStatus } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepo: Repository<Course>;
  let moduleRepo: Repository<Module>;

  const mockCourse = {
    id: 1,
    name: 'Lingriser Spring 2026',
    description: 'English speaking course',
    startDate: '2026-03-01',
    endDate: '2026-04-26',
    registrationOpenDate: '2026-02-01',
    registrationCloseDate: '2026-02-28',
    price: 2000000,
    status: CourseStatus.IN_PROGRESS,
    classDay: 'monday',
    classStartTime: '08:00',
    classEndTime: '09:30',
    modules: [],
  };

  const mockModule = {
    id: 1,
    courseId: 1,
    moduleNumber: 1,
    title: 'Module 1 - Introduction',
    topic: 'Work',
    description: 'Introduction to work vocabulary',
    learningOutcomes: '["Learn basic vocabulary", "Practice pronunciation"]',
    weekStartDate: '2026-03-01',
    weekEndDate: '2026-03-07',
  };

  const mockCourseRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockModuleRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(Module), useValue: mockModuleRepo },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    courseRepo = module.get<Repository<Course>>(getRepositoryToken(Course));
    moduleRepo = module.get<Repository<Module>>(getRepositoryToken(Module));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      mockCourseRepo.find.mockResolvedValue([mockCourse]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Lingriser Spring 2026');
      expect(mockCourseRepo.find).toHaveBeenCalledWith({ order: { startDate: 'DESC' } });
    });
  });

  describe('findCurrent', () => {
    it('should return the current in-progress course', async () => {
      mockCourseRepo.findOne.mockResolvedValue({ ...mockCourse, modules: [mockModule] });

      const result = await service.findCurrent();

      expect(result).toBeDefined();
      expect(result.status).toBe(CourseStatus.IN_PROGRESS);
    });

    it('should return the most recent course if no in-progress course', async () => {
      mockCourseRepo.findOne
        .mockResolvedValueOnce(null) // No in-progress
        .mockResolvedValueOnce({ ...mockCourse, status: 'completed', modules: [] });

      const result = await service.findCurrent();

      expect(result).toBeDefined();
    });

    it('should return null if no courses exist', async () => {
      mockCourseRepo.findOne.mockResolvedValue(null);

      const result = await service.findCurrent();

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a course by id', async () => {
      mockCourseRepo.findOne.mockResolvedValue({ ...mockCourse, modules: [mockModule] });

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Lingriser Spring 2026');
    });

    it('should throw NotFoundException when course not found', async () => {
      mockCourseRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getModules', () => {
    it('should return modules for a course', async () => {
      mockModuleRepo.find.mockResolvedValue([mockModule]);

      const result = await service.getModules(1);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Module 1 - Introduction');
      expect(result[0].learningOutcomes).toEqual(['Learn basic vocabulary', 'Practice pronunciation']);
    });
  });

  describe('getModule', () => {
    it('should return a module by id', async () => {
      mockModuleRepo.findOne.mockResolvedValue(mockModule);

      const result = await service.getModule(1);

      expect(result.id).toBe(1);
      expect(result.topic).toBe('Work');
    });

    it('should throw NotFoundException when module not found', async () => {
      mockModuleRepo.findOne.mockResolvedValue(null);

      await expect(service.getModule(999)).rejects.toThrow(NotFoundException);
    });
  });
});

