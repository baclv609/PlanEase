import { useSettingsStore } from '@/stores/settingsStore';
import googleCalendarService from './googleCalendarService';
import holidayService from './holidayService';
import dayjs from 'dayjs';

class SyncService {
  constructor() {
    this.syncInterval = null;
  }

  // Lấy store khi cần thiết
  getSettingsStore() {
    return useSettingsStore();
  }

  startAutoSync() {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    const settings = this.getSettingsStore().googleCalendar;
    if (!settings.autoSync || !settings.selectedCalendars.length) {
      return;
    }

    const intervalMinutes = parseInt(settings.syncInterval);
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMinutes * 60 * 1000);

    // Perform initial sync
    this.performSync();
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async performSync() {
    const settings = this.getSettingsStore().googleCalendar;
    if (!settings.selectedCalendars.length) {
      return;
    }

    try {
      const now = dayjs();
      const timeMin = now.subtract(1, 'day');
      const timeMax = now.add(Number(settings.syncRange), 'day');

      // Đồng bộ sự kiện từ các calendar đã chọn
      for (const calendarId of settings.selectedCalendars) {
        const events = await googleCalendarService.getEvents(calendarId, timeMin, timeMax);
        await googleCalendarService.syncEvents(events);
      }

      // Đồng bộ ngày nghỉ nếu được bật
      if (settings.includeHolidays) {
        // Đồng bộ ngày nghỉ từ Google Calendar
        await holidayService.syncGoogleHolidays(settings.selectedCalendars[0]);
        
        // Lấy và đồng bộ ngày nghỉ từ API
        const holidays = await holidayService.fetchHolidays(timeMin, timeMax);
        await googleCalendarService.syncEvents(holidays.map(holiday => ({
          summary: holiday.name,
          start: { date: holiday.date },
          end: { date: holiday.date },
          description: holiday.description,
          eventType: 'holiday'
        })));
      }

      await this.getSettingsStore().updateGoogleCalendarSettings({
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error during auto sync:', error);
    }
  }
}

export default new SyncService(); 