import { Injectable, Logger, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { TeacherGoogleToken, Teacher } from '../../entities';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private oauth2Client: OAuth2Client;

  constructor(
    @InjectRepository(TeacherGoogleToken)
    private readonly tokenRepo: Repository<TeacherGoogleToken>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async exchangeCodeForTokens(code: string, teacherId: number): Promise<{ success: boolean; email?: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken({
        code,
        redirect_uri: 'postmessage', // Special value for popup flow
      });
      
      if (!tokens.refresh_token) {
        this.logger.warn('No refresh token received. User may have already authorized.');
      }

      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const email = userInfo.data.email || '';

      const expiresAt = tokens.expiry_date 
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000); // Default 1 hour

      let tokenRecord = await this.tokenRepo.findOne({
        where: { teacherId },
      });

      if (tokenRecord) {
        tokenRecord.accessToken = tokens.access_token || tokenRecord.accessToken;
        tokenRecord.refreshToken = tokens.refresh_token || tokenRecord.refreshToken;
        tokenRecord.expiresAt = expiresAt;
        tokenRecord.scope = tokens.scope || tokenRecord.scope;
        tokenRecord.googleEmail = email;
      } else {
        tokenRecord = this.tokenRepo.create({
          teacherId,
          accessToken: tokens.access_token!,
          refreshToken: tokens.refresh_token!,
          expiresAt,
          scope: tokens.scope,
          googleEmail: email,
        });
      }

      await this.tokenRepo.save(tokenRecord);
      this.logger.log(`Saved Google tokens for teacher ${teacherId} (${email})`);

      return { success: true, email };
    } catch (error) {
      this.logger.error(`Failed to exchange code for tokens: ${error.message}`);
      throw new UnauthorizedException('Failed to authorize with Google');
    }
  }

  async getAuthenticatedClient(teacherId: number): Promise<OAuth2Client> {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { teacherId },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Teacher has not connected Google account');
    }

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    client.setCredentials({
      access_token: tokenRecord.accessToken,
      refresh_token: tokenRecord.refreshToken,
      expiry_date: tokenRecord.expiresAt.getTime(),
    });

    if (new Date() >= tokenRecord.expiresAt) {
      this.logger.log(`Refreshing expired token for teacher ${teacherId}`);
      
      try {
        const { credentials } = await client.refreshAccessToken();
        
        tokenRecord.accessToken = credentials.access_token!;
        if (credentials.expiry_date) {
          tokenRecord.expiresAt = new Date(credentials.expiry_date);
        }
        await this.tokenRepo.save(tokenRecord);
        
        client.setCredentials(credentials);
      } catch (error) {
        this.logger.error(`Failed to refresh token: ${error.message}`);
        throw new UnauthorizedException('Google token expired. Please reconnect.');
      }
    }

    return client;
  }

  async isConnected(teacherId: number): Promise<{ connected: boolean; email?: string }> {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { teacherId },
    });

    if (!tokenRecord) {
      return { connected: false };
    }

    return { 
      connected: true, 
      email: tokenRecord.googleEmail || undefined,
    };
  }

  async disconnect(teacherId: number): Promise<void> {
    const tokenRecord = await this.tokenRepo.findOne({
      where: { teacherId },
    });

    if (tokenRecord) {
      try {
        const client = await this.getAuthenticatedClient(teacherId);
        await client.revokeCredentials();
      } catch (error) {
        this.logger.warn(`Failed to revoke token: ${error.message}`);
      }

      await this.tokenRepo.remove(tokenRecord);
      this.logger.log(`Disconnected Google account for teacher ${teacherId}`);
    }
  }

  async getTeacherIdFromUserId(userId: number): Promise<number> {
    const teacher = await this.teacherRepo.findOne({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacher.id;
  }
}
