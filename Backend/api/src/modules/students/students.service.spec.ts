import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentsService } from './students.service';
import { Student, User, Parent, Enrollment, LearningHistory, StudentVideo } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepo: Repository<Student>;
  let parentRepo: Repository<Parent>;
  let enrollmentRepo: Repository<Enrollment>;
  let learningHistoryRepo: Repository<LearningHistory>;
  let studentVideoRepo: Repository<StudentVideo>;

  const mockUser = {
    id: 1,
    email: 'student@test.com',
    fullName: 'Test Student',
    phone: '0123456789',
    avatarUrl: null,
  };

  const mockStudent = {
    id: 1,
    userId: 1,
    grade: 'Lớp 8',
    cefrLevel: 'A2',
    user: mockUser,
    assignedInpersonTeacher: null,
  };

  const mockStudentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockStudent]),
    })),
  };

  const mockParentRepo = {
    findOne: jest.fn(),
  };

  const mockEnrollmentRepo = {
    findOne: jest.fn(),
  };

  const mockLearningHistoryRepo = {
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockStudentVideoRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: mockStudentRepo },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Parent), useValue: mockParentRepo },
        { provide: getRepositoryToken(Enrollment), useValue: mockEnrollmentRepo },
        { provide: getRepositoryToken(LearningHistory), useValue: mockLearningHistoryRepo },
        { provide: getRepositoryToken(StudentVideo), useValue: mockStudentVideoRepo },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentRepo = module.get<Repository<Student>>(getRepositoryToken(Student));
    parentRepo = module.get<Repository<Parent>>(getRepositoryToken(Parent));
    enrollmentRepo = module.get<Repository<Enrollment>>(getRepositoryToken(Enrollment));
    learningHistoryRepo = module.get<Repository<LearningHistory>>(getRepositoryToken(LearningHistory));
    studentVideoRepo = module.get<Repository<StudentVideo>>(getRepositoryToken(StudentVideo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      mockStudentRepo.find.mockResolvedValue([mockStudent]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 1,
          name: 'Test Student',
          email: 'student@test.com',
          phone: '0123456789',
          grade: 'Lớp 8',
          cefrLevel: 'A2',
          avatarUrl: null,
          assignedTeacher: null,
        },
      ]);
      expect(mockStudentRepo.find).toHaveBeenCalledWith({
        relations: ['user', 'assignedInpersonTeacher', 'assignedInpersonTeacher.user'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a student by id', async () => {
      mockStudentRepo.findOne.mockResolvedValue(mockStudent);

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: 1,
        name: 'Test Student',
        email: 'student@test.com',
        phone: '0123456789',
        grade: 'Lớp 8',
        cefrLevel: 'A2',
        avatarUrl: null,
        assignedTeacher: null,
      });
    });

    it('should throw NotFoundException when student not found', async () => {
      mockStudentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByParentId', () => {
    it('should return students linked to a parent', async () => {
      const mockParent = { id: 1, userId: 10, user: { id: 10 } };
      mockParentRepo.findOne.mockResolvedValue(mockParent);

      const result = await service.findByParentId(1);

      expect(result).toHaveLength(1);
      expect(mockParentRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
    });

    it('should throw NotFoundException when parent not found', async () => {
      mockParentRepo.findOne.mockResolvedValue(null);

      await expect(service.findByParentId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEnrollment', () => {
    it('should return enrollment for a student', async () => {
      const mockEnrollment = {
        id: 1,
        status: 'active',
        enrolledAt: new Date(),
        currentModuleNumber: 1,
        course: {
          id: 1,
          name: 'Test Course',
          startDate: '2026-03-01',
          endDate: '2026-04-26',
          status: 'in_progress',
          modules: [],
        },
      };
      mockEnrollmentRepo.findOne.mockResolvedValue(mockEnrollment);

      const result = await service.getEnrollment(1);

      expect(result).toBeDefined();
      expect(result.course.name).toBe('Test Course');
    });

    it('should return null when no enrollment found', async () => {
      mockEnrollmentRepo.findOne.mockResolvedValue(null);

      const result = await service.getEnrollment(999);

      expect(result).toBeNull();
    });
  });

  describe('getProgressVideos', () => {
    it('should return before and after videos', async () => {
      const mockVideos = [
        { id: 1, videoType: 'before', fileUrl: '/videos/before.mp4', uploadedAt: new Date() },
        { id: 2, videoType: 'after', fileUrl: '/videos/after.mp4', uploadedAt: new Date() },
      ];
      mockStudentVideoRepo.find.mockResolvedValue(mockVideos);

      const result = await service.getProgressVideos(1, 1);

      expect(result.beforeVideo).toBeDefined();
      expect(result.afterVideo).toBeDefined();
      expect(result.beforeVideo.fileUrl).toBe('/videos/before.mp4');
    });

    it('should return null for missing videos', async () => {
      mockStudentVideoRepo.find.mockResolvedValue([]);

      const result = await service.getProgressVideos(1, 1);

      expect(result.beforeVideo).toBeNull();
      expect(result.afterVideo).toBeNull();
    });
  });
});

