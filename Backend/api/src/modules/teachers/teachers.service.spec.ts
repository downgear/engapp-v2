import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeachersService } from './teachers.service';
import { Teacher, User, Booking, TeacherType } from '../../entities';
import { NotFoundException } from '@nestjs/common';

describe('TeachersService', () => {
  let service: TeachersService;
  let teacherRepo: Repository<Teacher>;
  let bookingRepo: Repository<Booking>;

  const mockUser = {
    id: 2,
    email: 'teacher@test.com',
    fullName: 'Test Teacher',
    phone: '0123456789',
    avatarUrl: null,
  };

  const mockTeacher = {
    id: 1,
    userId: 2,
    teacherType: TeacherType.VIDEO_CALL,
    bio: 'Experienced teacher',
    specialties: '["speaking", "pronunciation"]',
    user: mockUser,
  };

  const mockTeacherRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockTeacher]),
    })),
    manager: {
      query: jest.fn(),
    },
  };

  const mockBookingRepo = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        { provide: getRepositoryToken(Teacher), useValue: mockTeacherRepo },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepo },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    teacherRepo = module.get<Repository<Teacher>>(getRepositoryToken(Teacher));
    bookingRepo = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of teachers', async () => {
      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        name: 'Test Teacher',
        email: 'teacher@test.com',
        phone: '0123456789',
        avatarUrl: null,
        teacherType: TeacherType.VIDEO_CALL,
        bio: 'Experienced teacher',
        specialties: ['speaking', 'pronunciation'],
      });
    });

    it('should filter teachers by type', async () => {
      await service.findAll(TeacherType.VIDEO_CALL);

      expect(mockTeacherRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findVideoCallTeachers', () => {
    it('should return only video call teachers', async () => {
      const result = await service.findVideoCallTeachers();

      expect(result).toHaveLength(1);
      expect(result[0].teacherType).toBe(TeacherType.VIDEO_CALL);
    });
  });

  describe('findOne', () => {
    it('should return a teacher by id', async () => {
      mockTeacherRepo.findOne.mockResolvedValue(mockTeacher);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Teacher');
    });

    it('should throw NotFoundException when teacher not found', async () => {
      mockTeacherRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailability', () => {
    it('should return available slots for Saturday', async () => {
      mockTeacherRepo.manager.query.mockResolvedValue([
        { slot_start_time: '09:00', is_available: 1 },
        { slot_start_time: '10:00', is_available: 1 },
        { slot_start_time: '11:00', is_available: 0 },
      ]);
      mockBookingRepo.find.mockResolvedValue([]);

      // Saturday date
      const result = await service.getAvailability(1, '2026-03-07');

      expect(result.slots).toHaveLength(2);
      expect(result.slots[0].isAvailable).toBe(true);
    });

    it('should return empty slots for weekdays', async () => {
      // Monday date
      const result = await service.getAvailability(1, '2026-03-02');

      expect(result.slots).toHaveLength(0);
      expect(result.message).toContain('only available on Saturday and Sunday');
    });

    it('should mark booked slots as unavailable', async () => {
      mockTeacherRepo.manager.query.mockResolvedValue([
        { slot_start_time: '09:00', is_available: 1 },
        { slot_start_time: '10:00', is_available: 1 },
      ]);
      mockBookingRepo.find.mockResolvedValue([
        { slotStartTime: '09:00', status: 'confirmed' },
      ]);

      const result = await service.getAvailability(1, '2026-03-07');

      expect(result.slots[0].isAvailable).toBe(false);
      expect(result.slots[1].isAvailable).toBe(true);
    });
  });
});

