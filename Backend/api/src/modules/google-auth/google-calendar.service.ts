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

  /**
   * Create a Google Calendar event with Google Meet link
   */
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

    // Get authenticated client for this teacher
    const authClient = await this.googleAuthService.getAuthenticatedClient(teacherId);
    
    // Create calendar API client
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Build datetime strings (ISO 8601)
    const startDateTime = `${bookingDate}T${startTime}:00`;
    const endDateTime = `${bookingDate}T${endTime}:00`;

    // Event details
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
      // Add Google Meet conferencing
      conferenceData: {
        createRequest: {
          requestId: `lingriser-${teacherId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      // Send notifications
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 }, // 1 hour before
          { method: 'popup', minutes: 10 }, // 10 minutes before
        ],
      },
    };

    // Add student as attendee if email provided
    if (studentEmail) {
      event.attendees = [
        { email: studentEmail, displayName: studentName },
      ];
    }

    try {
      // Create event with conferencing
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1, // Required for Meet link
        sendUpdates: studentEmail ? 'all' : 'none', // Send invite if student email provided
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

  /**
   * Cancel/delete a Google Calendar event
   */
  async cancelMeeting(teacherId: number, googleEventId: string): Promise<void> {
    try {
      const authClient = await this.googleAuthService.getAuthenticatedClient(teacherId);
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
        sendUpdates: 'all', // Notify attendees
      });

      this.logger.log(`Cancelled Google Calendar event: ${googleEventId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel Google Calendar event: ${error.message}`);
      // Don't throw - event might already be deleted
    }
  }

  /**
   * Update a Google Calendar event
   */
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
