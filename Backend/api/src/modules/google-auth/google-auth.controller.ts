import { Controller, Get, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('auth/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(private readonly googleAuthService: GoogleAuthService) {}

  /**
   * Exchange authorization code for tokens (GIS popup flow)
   * Frontend gets the code via Google popup, sends it here
   */
  @Post('exchange-code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async exchangeCode(
    @CurrentUser('userId') userId: number,
    @Body('code') code: string,
  ) {
    if (!code) {
      return { success: false, error: 'Authorization code is required' };
    }

    try {
      const teacherId = await this.googleAuthService.getTeacherIdFromUserId(userId);
      const result = await this.googleAuthService.exchangeCodeForTokens(code, teacherId);
      
      this.logger.log(`Google OAuth success for teacher ${teacherId} (${result.email})`);
      
      return { 
        success: true, 
        email: result.email,
      };
    } catch (error) {
      this.logger.error(`Google OAuth exchange failed: ${error.message}`);
      return { 
        success: false, 
        error: error.message,
      };
    }
  }

  /**
   * Check if teacher has connected Google account
   */
  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getConnectionStatus(@CurrentUser('userId') userId: number) {
    const teacherId = await this.googleAuthService.getTeacherIdFromUserId(userId);
    return this.googleAuthService.isConnected(teacherId);
  }

  /**
   * Disconnect Google account
   */
  @Get('disconnect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async disconnect(@CurrentUser('userId') userId: number) {
    const teacherId = await this.googleAuthService.getTeacherIdFromUserId(userId);
    await this.googleAuthService.disconnect(teacherId);
    return { success: true, message: 'Google account disconnected' };
  }
}
