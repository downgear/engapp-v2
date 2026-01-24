import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InauguralRegistration } from '../../entities/inaugural-registration.entity';
import { CreateInauguralRegistrationDto } from './dto/create-inaugural-registration.dto';

@Injectable()
export class InauguralRegistrationsService {
  constructor(
    @InjectRepository(InauguralRegistration)
    private readonly registrationRepository: Repository<InauguralRegistration>,
  ) {}

  async create(dto: CreateInauguralRegistrationDto): Promise<InauguralRegistration> {
    const registration = this.registrationRepository.create({
      parentName: dto.parent_name,
      phone: dto.phone,
      email: dto.email,
      primaryGoal: dto.primary_goal,
      wantsToSignup: dto.wants_to_signup,
      interestReason: dto.interest_reason,
      rejectionReason: dto.rejection_reason,
    });
    
    return this.registrationRepository.save(registration);
  }

  async findAll(): Promise<InauguralRegistration[]> {
    return this.registrationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<InauguralRegistration | null> {
    return this.registrationRepository.findOne({ where: { id } });
  }
}


