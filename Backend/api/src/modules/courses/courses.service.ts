import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, Module, CourseStatus } from '../../entities';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
  ) {}

  async findAll() {
    const courses = await this.courseRepo.find({
      order: { startDate: 'DESC' },
    });
    return courses.map((c) => this.formatCourse(c));
  }

  async findCurrent() {
    const course = await this.courseRepo.findOne({
      where: { status: CourseStatus.IN_PROGRESS },
      relations: ['modules'],
    });

    if (!course) {
      // Return the most recent course
      const recentCourse = await this.courseRepo.findOne({
        order: { startDate: 'DESC' },
        relations: ['modules'],
      });
      return recentCourse ? this.formatCourseWithModules(recentCourse) : null;
    }

    return this.formatCourseWithModules(course);
  }

  async findOne(id: number) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['modules'],
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.formatCourseWithModules(course);
  }

  async getModules(courseId: number) {
    const modules = await this.moduleRepo.find({
      where: { courseId },
      order: { moduleNumber: 'ASC' },
    });

    return modules.map((m) => this.formatModule(m));
  }

  async getModule(moduleId: number) {
    const module = await this.moduleRepo.findOne({
      where: { id: moduleId },
      relations: ['course'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    return this.formatModule(module);
  }

  private formatCourse(course: Course) {
    return {
      id: course.id,
      name: course.name,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      registrationOpenDate: course.registrationOpenDate,
      registrationCloseDate: course.registrationCloseDate,
      price: course.price,
      status: course.status,
      classDay: course.classDay,
      classStartTime: course.classStartTime,
      classEndTime: course.classEndTime,
    };
  }

  private formatCourseWithModules(course: Course) {
    return {
      ...this.formatCourse(course),
      modules: course.modules
        ?.sort((a, b) => a.moduleNumber - b.moduleNumber)
        .map((m) => this.formatModule(m)),
    };
  }

  private formatModule(module: Module) {
    let learningOutcomes: string[] = [];
    try {
      learningOutcomes = module.learningOutcomes
        ? JSON.parse(module.learningOutcomes)
        : [];
    } catch {
      learningOutcomes = [];
    }

    return {
      id: module.id,
      moduleNumber: module.moduleNumber,
      title: module.title,
      topic: module.topic,
      description: module.description,
      learningOutcomes,
      weekStartDate: module.weekStartDate,
      weekEndDate: module.weekEndDate,
      mondayContent: module.mondayContent ?? null,
      aiPracticeContent: module.aiPracticeContent ?? null,
      teacherSessionContent: module.teacherSessionContent ?? null,
    };
  }
}

