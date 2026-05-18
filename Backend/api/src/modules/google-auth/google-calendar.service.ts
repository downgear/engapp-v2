import { Injectable, Logger } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { GoogleAuthService } from './google-auth.service';

export interface CreateMeetingParams {
  teacherId: number;
  studentName: string;
  teacherName: string;
  moduleTitle: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  studentEmail?: string;
}

export interface MeetingResult {
  meetingLink: string;
  googleEventId: string;
  hangoutLink: string;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly googleAuthService: GoogleAuthService) {}

  async createMeeting(params: CreateMeetingParams): Promise<MeetingResult> {
    const {
      teacherId,
      studentName,
      teacherName,
      moduleTitle,
      bookingDate,
      startTime,
      endTime,
      studentEmail,
    } = params;

    const authClient = await this.googleAuthService.getAuthenticatedClient(teacherId);
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    const startDateTime = `${bookingDate}T${startTime}:00`;
    const endDateTime = `${bookingDate}T${endTime}:00`;

    const event: calendar_v3.Schema$Event = {
      summary: `Lingriser - ${moduleTitle}`,
      description: `Buổi học 1-1 với học viên ${studentName}\n\nChủ đề: ${moduleTitle}\nGiáo viên: ${teacherName}\n\n---\nĐược tạo tự động bởi Lingriser`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      conferenceData: {
        createRequest: {
          requestId: `lingriser-${teacherId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    if (studentEmail) {
      event.attendees = [
        { email: studentEmail, displayName: studentName },
      ];
    }

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: studentEmail ? 'all' : 'none',
      });

      const createdEvent = response.data;
      const meetingLink = createdEvent.hangoutLink || createdEvent.conferenceData?.entryPoints?.[0]?.uri || '';

      this.logger.log(`Created Google Meet for teacher ${teacherId}: ${meetingLink}`);

      return {
        meetingLink,
        googleEventId: createdEvent.id || '',
        hangoutLink: createdEvent.hangoutLink || '',
      };
    } catch (error) {
      this.logger.error(`Failed to create Google Calendar event: ${error.message}`);
      throw error;
    }
  }

  async cancelMeeting(teacherId: number, googleEventId: string): Promise<void> {
    try {
      const authClient = await this.googleAuthService.getAuthenticatedClient(teacherId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
        sendUpdates: 'all',
      });

      this.logger.log(`Cancelled Google Calendar event: ${googleEventId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel Google Calendar event: ${error.message}`);
    }
  }

  async updateMeeting(
    teacherId: number,
    googleEventId: string,
    updates: Partial<CreateMeetingParams>,
  ): Promise<MeetingResult | null> {
    try {
      const authClient = await this.googleAuthService.getAuthenticatedClient(teacherId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      // Get existing event
      const existing = await calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId,
      });

      const event = existing.data;

      // Apply updates
      if (updates.bookingDate && updates.startTime) {
        event.start = {
          dateTime: `${updates.bookingDate}T${updates.startTime}:00`,
          timeZone: 'Asia/Ho_Chi_Minh',
        };
      }
      if (updates.bookingDate && updates.endTime) {
        event.end = {
          dateTime: `${updates.bookingDate}T${updates.endTime}:00`,
          timeZone: 'Asia/Ho_Chi_Minh',
        };
      }

      // Update event
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: event,
        sendUpdates: 'all',
      });

      const updatedEvent = response.data;

      return {
        meetingLink: updatedEvent.hangoutLink || '',
        googleEventId: updatedEvent.id || '',
        hangoutLink: updatedEvent.hangoutLink || '',
      };
    } catch (error) {
      this.logger.error(`Failed to update Google Calendar event: ${error.message}`);
      return null;
    }
  }
}
