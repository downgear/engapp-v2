import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking, Student, Teacher, Module, LearningHistory, BookingStatus, TeacherType } from '../../entities';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepo: Repository<Booking>;
  let studentRepo: Repository<Student>;
  let teacherRepo: Repository<Teacher>;
  let moduleRepo: Repository<Module>;
  let learningHistoryRepo: Repository<LearningHistory>;

  const mockStudent = { id: 1, userId: 1 };
  const mockTeacher = { id: 1, userId: 2, teacherType: TeacherType.VIDEO_CALL };
  const mockModule = { id: 1, moduleNumber: 1, title: 'Module 1' };

  const mockBooking = {
    id: 1,
    studentId: 1,
    teacherId: 1,
    moduleId: 1,
    bookingDate: '2026-03-07',
    slotStartTime: '09:00',
    slotEndTime: '10:00',
    status: BookingStatus.CONFIRMED,
    createdAt: new Date(),
    student: { id: 1, user: { fullName: 'Test Student' } },
    teacher: { id: 1, user: { fullName: 'Test Teacher' } },
    module: mockModule,
  };

  const mockBookingRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockStudentRepo = {
    findOne: jest.fn(),
  };

  const mockTeacherRepo = {
    findOne: jest.fn(),
  };

  const mockModuleRepo = {
    findOne: jest.fn(),
  };

  const mockLearningHistoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepo },
        { provide: getRepositoryToken(Student), useValue: mockStudentRepo },
        { provide: getRepositoryToken(Teacher), useValue: mockTeacherRepo },
        { provide: getRepositoryToken(Module), useValue: mockModuleRepo },
        { provide: getRepositoryToken(LearningHistory), useValue: mockLearningHistoryRepo },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepo = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    studentRepo = module.get<Repository<Student>>(getRepositoryToken(Student));
    teacherRepo = module.get<Repository<Teacher>>(getRepositoryToken(Teacher));
    moduleRepo = module.get<Repository<Module>>(getRepositoryToken(Module));
    learningHistoryRepo = module.get<Repository<LearningHistory>>(getRepositoryToken(LearningHistory));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      studentId: 1,
      teacherId: 1,
      moduleId: 1,
      bookingDate: '2026-03-07',
      slotStartTime: '09:00',
    };

    it('should create a booking successfully', async () => {
      mockStudentRepo.findOne.mockResolvedValue(mockStudent);
      mockTeacherRepo.findOne.mockResolvedValue(mockTeacher);
      mockModuleRepo.findOne.mockResolvedValue(mockModule);
      mockBookingRepo.findOne.mockResolvedValue(null); // No existing booking
      mockBookingRepo.create.mockReturnValue(mockBooking);
      mockBookingRepo.save.mockResolvedValue(mockBooking);

      const result = await service.create(createDto);

      expect(result.id).toBe(1);
      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockStudentRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when teacher not found', async () => {
      mockStudentRepo.findOne.mockResolvedValue(mockStudent);
      mockTeacherRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for in-person only teacher', async () => {
      mockStudentRepo.findOne.mockResolvedValue(mockStudent);
      mockTeacherRepo.findOne.mockResolvedValue({ ...mockTeacher, teacherType: 'in_person' });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when slot is already booked', async () => {
      mockStudentRepo.findOne.mockResolvedValue(mockStudent);
      mockTeacherRepo.findOne.mockResolvedValue(mockTeacher);
      mockModuleRepo.findOne.mockResolvedValue(mockModule);
      mockBookingRepo.findOne.mockResolvedValue(mockBooking); // Existing booking

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStudent', () => {
    it('should return bookings for a student', async () => {
      mockBookingRepo.find.mockResolvedValue([mockBooking]);

      const result = await service.findByStudent(1);

      expect(result).toHaveLength(1);
      expect(result[0].student.name).toBe('Test Student');
    });
  });

  describe('findByTeacher', () => {
    it('should return bookings for a teacher', async () => {
      mockBookingRepo.find.mockResolvedValue([mockBooking]);

      const result = await service.findByTeacher(1);

      expect(result).toHaveLength(1);
      expect(result[0].teacher.name).toBe('Test Teacher');
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      mockBookingRepo.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('complete', () => {
    it('should complete a booking and create learning history', async () => {
      mockBookingRepo.findOne.mockResolvedValue({ ...mockBooking });
      mockBookingRepo.save.mockResolvedValue({ ...mockBooking, status: BookingStatus.COMPLETED });
      mockLearningHistoryRepo.create.mockReturnValue({});
      mockLearningHistoryRepo.save.mockResolvedValue({});

      const result = await service.complete(1);

      expect(mockLearningHistoryRepo.create).toHaveBeenCalled();
      expect(mockLearningHistoryRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);

      await expect(service.complete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel a booking', async () => {
      mockBookingRepo.findOne.mockResolvedValue({ ...mockBooking });
      mockBookingRepo.save.mockResolvedValue({ ...mockBooking, status: BookingStatus.CANCELLED });

      const result = await service.cancel(1);

      expect(mockBookingRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);

      await expect(service.cancel(999)).rejects.toThrow(NotFoundException);
    });
  });
});

