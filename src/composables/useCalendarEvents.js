import { ref, computed, onMounted,watch } from "vue";
import axios from "axios";
import scheduleApi from "@/api/scheduleApi";
import { useSettingsStore } from "@/stores/settingsStore";
import moment from "moment-timezone"; 
import { DateTime } from 'luxon';
import luxonPlugin from '@fullcalendar/luxon3';

export function useCalendarEvents() {
  const settingsStore = useSettingsStore();
  const rawEvents = ref([]);
  const { getSchedules } = scheduleApi;

  const fetchEvents = async () => {
    try {
      const response = await getSchedules();
      if (!Array.isArray(response.data.data)) {
        console.error(
          "Lỗi: response.data không phải là một mảng!",
          response.data
        );
        return;
      }

      rawEvents.value = response.data.data;

    } catch (error) {
      console.error("Lỗi khi tải lịch trình:", error);
    }
  };

  watch(() => settingsStore.timeZone, (newTimezone) => {
    if (calendarRef.value) {
      const calendarApi = calendarRef.value.getApi();
      calendarApi.setOption('timeZone', newTimezone);
      calendarApi.refetchEvents(); // Cập nhật lại lịch
    }
  });
  const formatEventWithTimezone = (event) => {
    const tz = settingsStore.timeZone; 
    return {
      id: event.id,
      title: event.title,
      uuid: event.uuid,
      description: event.description,
      timeZone: event.timeZone,
      start: event.start_time ? DateTime.fromISO(event.start_time, { zone: tz }).toISO() : null,
      end: event.end_time ? DateTime.fromISO(event.end_time, { zone: tz }).toISO() : null,
      allDay: event.is_all_day === 1,
      backgroundColor: event.color_code || "#3788d8",
      borderColor: event.color_code || "#3788d8",
      location: event.location,
      extendedProps: {
        recurrence: event.is_repeat ?? 0,
        is_reminder: event.is_reminder === 1,
        reminder: event.reminder || [],
        attendees: event.attendees || [],
        is_done: event.is_done === 1,
        is_busy: event.is_busy === 1,
      },
      exdate: Array.isArray(event.exclude_time)
        ? event.exclude_time.map(date => new Date(date).toISOString().replace(".000Z", "").slice(0, 16))
        : undefined,
      rrule: event.is_repeat && event.rrule ? {
          dtstart: event.start_time ? DateTime.fromISO(event.start_time, { zone: tz }).toISO() : null,
          freq: event.rrule.freq || "daily",
          interval: event.rrule.interval || 1,
          until: event.rrule.until ? DateTime.fromISO(event.rrule.until, { zone: tz }).toISO() : null,
          count: event.rrule.count || null,
          byweekday: event.rrule.byweekday || null,
          bymonth: event.rrule.bymonth || null,
          bymonthday: event.rrule.bymonthday || null,
          byyearday: event.rrule.byyearday || null,
          byweekno: event.rrule.byweekno || null,
          byhour: event.rrule.byhour || null,
          byminute: event.rrule.byminute || null,
          bysecond: event.rrule.bysecond || null,
          wkst: event.rrule.wkst || null,
        } : null,
    };
  };

  const formattedEvents = computed(() =>
    rawEvents.value.map((event) => formatEventWithTimezone(event))
  );
  return {
    formattedEvents,
    fetchEvents,
  };
}
