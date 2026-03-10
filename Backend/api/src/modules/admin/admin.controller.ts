import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== STATISTICS ====================

  @Get('statistics/users')
  getUserStatistics() {
    return this.adminService.getUserStatistics();
  }

  @Get('statistics/visits')
  getVisitStatistics(@Query('hours') hours?: string) {
    return this.adminService.getVisitStatistics(
      hours ? parseInt(hours, 10) : 24,
    );
  }

  @Get('statistics/practice')
  getPracticeStatistics(@Query('hours') hours?: string) {
    return this.adminService.getPracticeStatistics(
      hours ? parseInt(hours, 10) : 24,
    );
  }

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      role,
      search,
    });
  }

  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { fullName?: string; email?: string; phone?: string },
  ) {
    return this.adminService.updateUser(id, data);
  }

  @Patch('users/:id/lock')
  toggleUserLock(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.toggleUserLock(id);
  }

  @Post('users')
  createUser(
    @Body()
    data: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      role: string;
    },
  ) {
    return this.adminService.createUser({
      ...data,
      role: data.role as UserRole,
    });
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { role: string },
  ) {
    return this.adminService.updateUserRole(id, data.role as UserRole);
  }
}
