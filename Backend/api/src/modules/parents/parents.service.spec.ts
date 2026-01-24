import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentsService } from './parents.service';
import { Parent, User, Payment } from '../../entities';
import { StudentsService } from '../students/students.service';
import { NotFoundException } from '@nestjs/common';

describe('ParentsService', () => {
  let service: ParentsService;
  let parentRepo: Repository<Parent>;
  let paymentRepo: Repository<Payment>;
  let studentsService: StudentsService;

  const mockUser = {
    id: 3,
    email: 'parent@test.com',
    fullName: 'Test Parent',
    phone: '0123456789',
    avatarUrl: null,
  };

  const mockParent = {
    id: 1,
    userId: 3,
    user: mockUser,
  };

  const mockChild = {
    id: 1,
    name: 'Test Student',
    email: 'student@test.com',
    grade: 'Lớp 8',
    cefrLevel: 'A2',
  };

  const mockPayment = {
    id: 1,
    parentId: 1,
    studentId: 1,
    courseId: 1,
    amount: 2000000,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionId: 'TXN123',
    paidAt: new Date(),
    createdAt: new Date(),
    student: { id: 1, user: { fullName: 'Test Student' } },
    course: { id: 1, name: 'Lingriser Spring 2026' },
  };

  const mockParentRepo = {
    findOne: jest.fn(),
  };

  const mockPaymentRepo = {
    find: jest.fn(),
  };

  const mockStudentsService = {
    findByParentId: jest.fn(),
    getLearningHistory: jest.fn(),
    getEnrollment: jest.fn(),
    getProgressVideos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        { provide: getRepositoryToken(Parent), useValue: mockParentRepo },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepo },
        { provide: StudentsService, useValue: mockStudentsService },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
    parentRepo = module.get<Repository<Parent>>(getRepositoryToken(Parent));
    paymentRepo = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    studentsService = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a parent by id', async () => {
      mockParentRepo.findOne.mockResolvedValue(mockParent);

      const result = await service.findOne(1);

      expect(result).toEqual({
        id: 1,
        name: 'Test Parent',
        email: 'parent@test.com',
        phone: '0123456789',
        avatarUrl: null,
      });
    });

    it('should throw NotFoundException when parent not found', async () => {
      mockParentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChildren', () => {
    it('should return children linked to parent', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);

      const result = await service.getChildren(1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Student');
    });
  });

  describe('getChildLearningHistory', () => {
    it('should return learning history for linked child', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);
      mockStudentsService.getLearningHistory.mockResolvedValue([]);

      const result = await service.getChildLearningHistory(1, 1);

      expect(mockStudentsService.getLearningHistory).toHaveBeenCalledWith(1, undefined);
    });

    it('should throw NotFoundException for unlinked child', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);

      await expect(service.getChildLearningHistory(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChildEnrollment', () => {
    it('should return enrollment for linked child', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);
      mockStudentsService.getEnrollment.mockResolvedValue({ id: 1, status: 'active' });

      const result = await service.getChildEnrollment(1, 1);

      expect(result.status).toBe('active');
    });

    it('should throw NotFoundException for unlinked child', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);

      await expect(service.getChildEnrollment(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChildProgressVideos', () => {
    it('should return progress videos for linked child', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);
      mockStudentsService.getProgressVideos.mockResolvedValue({
        beforeVideo: { fileUrl: '/videos/before.mp4' },
        afterVideo: { fileUrl: '/videos/after.mp4' },
      });

      const result = await service.getChildProgressVideos(1, 1, 1);

      expect(result.beforeVideo).toBeDefined();
      expect(result.afterVideo).toBeDefined();
    });

    it('should throw NotFoundException for unlinked child', async () => {
      mockStudentsService.findByParentId.mockResolvedValue([mockChild]);

      await expect(service.getChildProgressVideos(1, 999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPayments', () => {
    it('should return payments for parent', async () => {
      mockPaymentRepo.find.mockResolvedValue([mockPayment]);

      const result = await service.getPayments(1);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(2000000);
      expect(result[0].student.name).toBe('Test Student');
      expect(result[0].course.name).toBe('Lingriser Spring 2026');
    });
  });
});

