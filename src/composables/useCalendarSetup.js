import { ref, computed, watch, onMounted } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { RRule } from 'rrule';

import { defineStore } from 'pinia';
import scheduleApi from '@/api/scheduleApi';

import { DateTime } from 'luxon';
import luxonPlugin from '@fullcalendar/luxon3';

import { useSettingsStore } from '@/stores/settingsStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useCalendarDrop } from '@/composables/useCalendarDrop';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // Import CSS cho tooltip

dayjs.extend(utc);

const settingsStore = useSettingsStore();
const selectedTimezone = computed(() => settingsStore.timeZone);
const user_id = JSON.parse(localStorage.getItem('user')).id;
const calendarRef = ref(null);

// Kéo thả
const { eventDrop, eventResize } = useCalendarDrop();


function calculateDuration(start_time, end_time) {
  const start = new Date(start_time);
  const end = new Date(end_time);
  const diffMs = end - start; // Chênh lệch thời gian (milliseconds)

  const hours = Math.floor(diffMs / (1000 * 60 * 60)); // Chuyển đổi sang giờ
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // Lấy phút còn lại
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000); // Lấy giây còn lại

  // Định dạng theo HH:mm:ss
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// Use Calendar Events Composable
export function useCalendarEvents() {
  const rawEvents = ref([]);
  const { getSchedules } = scheduleApi;

  const fetchEvents = async () => {
    try {
      const response = await getSchedules();
      if (!Array.isArray(response.data.data)) {
        console.error('Lỗi: response.data không phải là một mảng!', response.data);
        return;
      }
      rawEvents.value = response.data.data || [];
      console.log(rawEvents.value);
    } catch (error) {
      console.error('Lỗi khi tải lịch trình:', error);
    }
  };

  const formattedEvents = computed(() =>
    rawEvents.value.map((event) => {
      const start = event.start_time
        ? DateTime.fromISO(event.start_time, { zone: 'utc' }).setZone(selectedTimezone.value).toISO() 
        : null;
      const end = event.end_time
        ? DateTime.fromISO(event.end_time, { zone: 'utc' }).setZone(selectedTimezone.value).toISO() 
        : null;

      const permissionUser = () => {
        if (event.user_id == user_id || (event.attendees && event.attendees.some(attendee => 
          attendee.user_id == user_id && attendee.role == 'editor'
        ))) {
          return true;
        }
        return false;
      }

      // Định dạng thời gian cho tooltip và hiển thị
      const formatTime = (date) => {
        if (!date) return null;
        const dateTime = DateTime.fromISO(date);
        return dateTime.toFormat(settingsStore.timeFormat === "12h" ? "hh:mm a" : "HH:mm");
      };

      return {
        id: event.id,
        title: event.title,
        uuid: event.uuid,
        description: event.description,
        user_id: event.user_id,
        type: event.type,
        start,
        end,
        timezone: event.timezone_code,
        tag_id: event.tag_id,
        tag_name: event.tag_name,
        allDay: event.is_all_day === 1,
        backgroundColor: event.color_code || '#3788d8',
        borderColor: event.color_code || '#3788d8',
        location: event.location,
        editable: permissionUser(),
        display: 'block',
        displayEventTime: true,
        displayEventEnd: true,
        extendedProps: {
          end_time: event.end_time,
          recurrence: event.is_repeat ?? 0,
          is_reminder: event.is_reminder === 1,
          reminder: event.reminder || [],
          attendees: event.attendees || [],
          is_done: event.is_done === 1,
          is_busy: event.is_busy === 1,
          freq: event.rrule.freq || 'daily',
          interval: event.rrule.interval || 1,
          until: event.rrule.until ? event.rrule.until.replace(' ', 'T') : null,
          count: event.rrule.count || null,
          byweekday: event.rrule.byweekday || null,
          bymonth: event.rrule.bymonth || null,
          bymonthday: event.rrule.bymonthday || null,
          formattedStartTime: formatTime(start),
          formattedEndTime: formatTime(end),
          messages: [],
          comments: [],
          attachments: [],
          status: event.status || 'pending',
          priority: event.priority || 'medium',
          category: event.category || 'general',
          created_at: event.created_at || new Date().toISOString(),
          updated_at: event.updated_at || new Date().toISOString()
        },
        exdate: Array.isArray(event.exclude_time)
            ? !event.is_all_day ? event.exclude_time.map((date) =>
              DateTime.fromISO(date, { zone: 'utc' }) // Xác định UTC
                  .setZone(selectedTimezone.value).toISO() // Chuyển về múi giờ setting
            ) : event.exclude_time.map((date) =>
              DateTime.fromISO(date, { zone: 'utc' })
                  .setZone(selectedTimezone.value)
                  .toFormat('yyyy-MM-dd') //allday chỉ lấy ngày
            ) 
          : undefined,
        rrule:
          event.is_repeat && event.rrule
            ? {
                dtstart: event.start_time
                ? event.is_all_day ? start.split('T')[0] : start
                : null,
                freq: event.rrule.freq || 'daily',
                interval: event.rrule.interval || 1,
                until: event.rrule.until ? event.is_all_day ? event.rrule.until.split('T')[0] : event.rrule.until.replace(' ', 'T') : null, // chỉ lấy ngày nếu all day
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
              }
            : null,
            allDayMaintainDuration: true, 
            duration: event.is_repeat ? calculateDuration(event.start_time, event.end_time) : null,
      };
    })
  );

  return {
    formattedEvents,
    fetchEvents,
  };
}

// Use Calendar Composable
export function useCalendar(calendarRef) {
  const showHolidays = ref(true);
  const calendarKey = ref(0);
  const selectedEvent = ref(null);
  const selectedEventAdd = ref(null);
  const isAddEventModalVisible = ref(false);
  const isEventDetailModalVisible = ref(false);
  const { formattedEvents, fetchEvents } = useCalendarEvents();

  const calendarStore = useCalendarStore();

  const transformedEvents = ref([]);

  const updateTransformedEvents = () => {
    transformedEvents.value = [...formattedEvents.value];
    transformedEvents.value.forEach((event) => calendarStore.addEventStore(event));
    console.log('transformedEvents', transformedEvents.value);
  };

  onMounted(async () => {
    await fetchEvents();
    updateTransformedEvents();
  });

  watch(selectedTimezone, (newTimezone) => {
    console.log(`Timezone đã thay đổi: ${newTimezone}`);
    updateTransformedEvents();
    if (calendarRef.value) {
        const calendarApi = calendarRef.value.getApi();
        calendarApi.setOption('timeZone', newTimezone);
        calendarApi.refetchEvents(); // Cập nhật lại lịch
      }
  });

  watch(
    () => ({
      titleFormat: settingsStore.titleFormat,
      columnHeaderFormat: settingsStore.columnHeaderFormat,
    }),
    () => {
      calendarKey.value++;
    },
    { deep: true }
  );
  watch(
    () => ({
      timeZone: settingsStore.timeZone,
      firstDay: settingsStore.firstDay,
      initialDate: settingsStore.initialDate,
      eventTimeFormat: settingsStore.eventTimeFormat,
      columnHeaderFormat: settingsStore.columnHeaderFormat,
      titleFormat: settingsStore.titleFormat,
      validRange: settingsStore.validRange,
    }),
    () => {
      console.log("Cập nhật lịch từ Pinia Settings Store...");
      if (calendarRef.value) {
        const calendarApi = calendarRef.value.getApi();
        calendarApi.setOption('eventTimeFormat', settingsStore.eventTimeFormat);
        calendarApi.refetchEvents();
      }
      calendarKey.value++; // Buộc FullCalendar render lại
    },
    { deep: true }
  );
  watch(
    () => settingsStore.displayMode,
    (newView) => {
      calendarOptions.value.initialView = newView;
      calendarKey.value++;
    }
  );

  watch(
    () => settingsStore.timeFormat,
    (newFormat) => {
      console.log("Cập nhật định dạng thời gian:", newFormat);
      if (calendarRef.value) {
        const calendarApi = calendarRef.value.getApi();
        calendarApi.setOption('eventTimeFormat', settingsStore.eventTimeFormat);
        calendarApi.refetchEvents();
      }
      calendarKey.value++;
    }
  );

  const openAddEventModal = (info) => {
    if (info.view.type === 'dayGridMonth') {
      selectedEventAdd.value = {
        start: info.dateStr,
        end: dayjs(info.dateStr).add(1, 'day').format('YYYY-MM-DD'), // Kết thúc vào ngày tiếp theo
        allDay: info.allDay, // Xác định đây là sự kiện cả ngày
      };
    } else {
      // Nếu ở chế độ khác (week, day), mặc định sự kiện kéo dài 30p
      selectedEventAdd.value = {
        start: info.dateStr,
        end: info.allDay ? dayjs(info.dateStr).add(1, 'day').format('YYYY-MM-DD') : dayjs(info.dateStr).add(30, 'minutes').format(),
        allDay: info.allDay,
      };
    }
    
    isAddEventModalVisible.value = true;
  };
  
  const openEventDetailModal = (info) => {
    const event = info.event;
    const extendedProps = event.extendedProps || {};
    
    selectedEvent.value = {
      id: event.id,
      title: event.title || '',
      uuid: extendedProps.uuid || null,
      user_id: extendedProps.user_id || null,
      type: extendedProps.type || 'task',
      start: event.startStr || '',
      end: event.endStr || '',
      tag_id: extendedProps.tag_id || null,
      tag_name: extendedProps.tag_name || '',
      timezone: extendedProps.timezone || settingsStore.timeZone,
      color: event.backgroundColor || '#3788d8',
      is_all_day: event.allDay || false,
      recurrence: extendedProps.recurrence || 0,
      description: extendedProps.description || '',
      attendees: extendedProps.attendees || [],
      is_done: extendedProps.is_done || false,
      is_reminder: extendedProps.is_reminder || false,
      reminder: extendedProps.reminder || [],
      location: extendedProps.location || '',
      info: event._def || null,
      messages: extendedProps.messages || [],
      comments: extendedProps.comments || [],
      attachments: extendedProps.attachments || [],
      status: extendedProps.status || 'pending',
      priority: extendedProps.priority || 'medium',
      category: extendedProps.category || 'general',
      created_at: extendedProps.created_at || new Date().toISOString(),
      updated_at: extendedProps.updated_at || new Date().toISOString()
    };
    
    isEventDetailModalVisible.value = true;
  };
  const handleEventModalSuccess = async () => {
    await fetchEvents();
    updateTransformedEvents();
  };
  const handleDeleteEvent = async (eventId) => {
    // console.log("eventId", eventId);
    // // Xóa sự kiện từ transformedEvents
    // transformedEvents.value = transformedEvents.value.filter(event => event.id !== eventId);
    
    // // Cập nhật lại lịch
    // if (calendarRef.value) {
    //   console.log('delete');
    //   const calendarApi = calendarRef.value.getApi();
    //   calendarApi.removeEvent(eventId); // Loại bỏ sự kiện khỏi lịch
    // }
    await fetchEvents();
    updateTransformedEvents();
  };
  const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin, luxonPlugin],
    headerToolbar: false,
    locale: settingsStore.language,
    dayMaxEvents: 4,
    timeZone: selectedTimezone.value,
    firstDay: settingsStore.firstDay,
    initialDate: settingsStore.initialDate,
    initialView: settingsStore.displayMode,
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: settingsStore.timeFormat === "12h"
    },
    slotLabelFormat: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: settingsStore.timeFormat === "12h"
    },
    dayHeaderFormat: settingsStore.dayHeaderFormat || { 
      weekday: 'short', 
      day: 'numeric',
      hour: "2-digit",
      minute: "2-digit",
      hour12: settingsStore.timeFormat === "12h"
    },
    titleFormat: settingsStore.titleFormat,
    validRange: settingsStore.validRange,
    editable: true,
    selectable: true,
    selectMirror: true,
    snapDuration: '00:15:00',
    slotDuration: '00:30:00',
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    events: transformedEvents.value.length ? transformedEvents.value : [],
    eventDrop,
    eventResize,
    nowIndicator: true,
    dateClick: openAddEventModal,
    eventClick: openEventDetailModal,
    select: (info) => {
      selectedEventAdd.value = {
        start: info.startStr,
        end: info.view.type === 'dayGridMonth'
          ? dayjs(info.endStr).subtract(1, 'day').format('YYYY-MM-DD')
          : info.endStr,
        allDay: info.allDay,
      };
      isAddEventModalVisible.value = true;
    },
    loading: (isLoading) => {
      console.log(isLoading ? 'Đang tải sự kiện...' : 'Đã tải xong sự kiện');
    },
  }));
  return {
    calendarKey,
    calendarOptions,
    transformedEvents,
    isAddEventModalVisible,
    isEventDetailModalVisible,
    handleEventModalSuccess,
    selectedEvent,
    handleDeleteEvent,
    selectedEventAdd,
  };
}

