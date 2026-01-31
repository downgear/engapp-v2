import { Controller, Get, Query, Res, UseGuards, Logger } from '@nestjs/common';
import type { Response } from 'express';
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
   * Get Google OAuth authorization URL
   * Teacher clicks this to connect their Google account
   */
  @Get('connect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER)
  async getAuthUrl(@CurrentUser('userId') userId: number) {
    const teacherId = await this.googleAuthService.getTeacherIdFromUserId(userId);
    const url = this.googleAuthService.getAuthUrl(teacherId);
    return { url };
  }

  /**
   * OAuth2 callback handler
   * Google redirects here after authorization
   */
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string, // teacherId
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    // Frontend URL to redirect after auth
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

    if (error) {
      this.logger.error(`Google OAuth error: ${error}`);
      return res.redirect(`${frontendUrl}/teacher-dashboard?google_auth=error&message=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/teacher-dashboard?google_auth=error&message=missing_params`);
    }

    try {
      const teacherId = parseInt(state, 10);
      const result = await this.googleAuthService.handleCallback(code, teacherId);
      
      this.logger.log(`Google OAuth success for teacher ${teacherId}`);
      
      return res.redirect(
        `${frontendUrl}/teacher-dashboard?google_auth=success&email=${encodeURIComponent(result.email || '')}`
      );
    } catch (error) {
      this.logger.error(`Google OAuth callback failed: ${error.message}`);
      return res.redirect(
        `${frontendUrl}/teacher-dashboard?google_auth=error&message=${encodeURIComponent(error.message)}`
      );
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
