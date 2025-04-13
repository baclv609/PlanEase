import { ref, computed, watch, onMounted } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import rrulePlugin from '@fullcalendar/rrule';
import multiMonthPlugin from '@fullcalendar/multimonth';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { RRule } from 'rrule';

import { defineStore } from 'pinia';
import scheduleApi from '@/api/scheduleApi';

import { DateTime } from 'luxon';
import luxonPlugin from '@fullcalendar/luxon3';

import { useSettingsStore } from '@/stores/settingsStore';
import { useCalendarStore } from '@/stores/calendarStore';
import { useCalendarDrop } from '@/composables/useCalendarDrop';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useHiddenTagsStore } from '@/stores/hiddenTagsStore';

dayjs.extend(utc);
dayjs.extend(timezone);
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
      // console.log(rawEvents.value);
    } catch (error) {
      console.error('Lỗi khi tải lịch trình:', error);
    }
  };
  const formattedEvents = computed(() =>
    rawEvents.value.map((event) => {
      const start = event.start_time
        ? DateTime.fromISO(event.start_time, { zone: 'utc' })
          .setZone(selectedTimezone.value)
          .toISO()
        : null;
      const end = event.end_time
        ? DateTime.fromISO(event.end_time, { zone: 'utc' })
          .setZone(selectedTimezone.value)
          .toISO()
        : null;

      // Thêm xử lý múi giờ cho RRule
      const rruleStart = event.start_time
        ? DateTime.fromISO(event.start_time, { zone: 'utc' })
          .setZone(selectedTimezone.value)
          .toFormat(event.is_all_day ? 'yyyy-MM-dd' : 'yyyy-MM-dd\'T\'HH:mm:ss') //nếu cả ngày thì giờ
        : null;

      const rruleEnd = event.rrule && typeof event.rrule.until === 'string' && event.rrule.until.trim() !== ''
      ? DateTime.fromISO(event.rrule.until, { zone: 'utc' })
          .setZone(selectedTimezone.value)
          .toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
      : null;

      const isEditable = event.user_id == user_id ||
        (event.attendees && event.attendees.some(attendee =>
          attendee.user_id == user_id && attendee.role == 'editor'
        ));

      const formatTime = (date) => {
        if (!date) return null;
        return DateTime.fromISO(date)
          .toFormat(settingsStore.timeFormat === "12h" ? "hh:mm a" : "HH:mm");
      };

      const formattedStartTime = formatTime(start);
      const formattedEndTime = formatTime(end);

      let classDone = '';
      let eventTypeClass = '';
      if (event.is_done == 1) {
        classDone = 'task_done';
      }
      if (event.type == 'event') {
        eventTypeClass = 'calendar-event border border-l-4 p-[2px] font-semibold';
      }
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
        tag_color_code: event.tag_color_code,
        default_permission: event.default_permission,
        borderColor: event.tag_color_code || event.color_code,
        location: event.location,
        editable: isEditable,
        display: event.type == 'task' ? 'list-item' : 'block',
        classNames: [classDone, eventTypeClass],
        displayEventTime: true,
        displayEventEnd: true,
        extendedProps: {
          parent_id: event.parent_id || null,
          end_time: event.end_time,
          start_time: event.start_time,
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
          formattedStartTime,
          formattedEndTime,
          attachments: [],
          is_private: event.is_private ? true : false,
          created_at: event.created_at || new Date().toISOString(),
          updated_at: event.updated_at || new Date().toISOString()
        },
        exdate: Array.isArray(event.exclude_time)
          ? !event.is_all_day ? event.exclude_time.map((date) => {
            // Xử lý thời gian không có múi giờ
            const dateTime = DateTime.fromISO(date, { zone: 'utc' });
            return dateTime
              .setZone(selectedTimezone.value)
              .toISO({ suppressMilliseconds: true, includeOffset: false });
          }) : event.exclude_time.map((date) => {
            // Xử lý thời gian cho sự kiện cả ngày
            const dateTime = DateTime.fromISO(date, { zone: 'utc' });
            return dateTime
              .setZone(selectedTimezone.value)
              .startOf('day')
              .toFormat('yyyy-MM-dd');
          })
          : undefined,
        rrule:
          event.is_repeat && event.rrule
            ? {
              dtstart: rruleStart,
              freq: event.rrule.freq || null,
              interval: event.rrule.interval || 1,
              // nếu có count và until thì rrule mới có count và until
              ...(event.rrule.count != null ? { count: event.rrule.count } : {}),
              ...(typeof event.rrule.until == 'string' && event.rrule.until.trim() != ''
                  ? { until: rruleEnd }
                  : {}),
              byweekday: event.rrule.byweekday || null,
              bymonth: event.rrule.bymonth || null,
              bymonthday: event.rrule.bymonthday || null,
              byyearday: event.rrule.byyearday || null,
              byweekno: event.rrule.byweekno || null,
              byhour: event.rrule.byhour || null,
              byminute: event.rrule.byminute || null,
              bysecond: event.rrule.bysecond || null,
              wkst: event.rrule.wkst || 1,
              // tzid: event.timezone_code || selectedTimezone.value,
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


  const hiddenTagsStore = useHiddenTagsStore(); // Gọi store


  const transformedEvents = ref([]);

  // Hàm lọc sự kiện theo danh sách tag_id
  const filterEvents = (hiddenIds) => {
    // Phải filter từ formattedEvents thay vì transformedEvents để có dữ liệu gốc
    return formattedEvents.value.filter(event => {
      // Kiểm tra nếu hiddenIds là mảng hợp lệ
      if (!Array.isArray(hiddenIds)) {
        return true;
      }

      // Ẩn sự kiện có tag_id là null nếu null nằm trong hiddenIds
      if (hiddenIds.includes(null) && event.tag_id === null) {
        return false;
      }

      // Ẩn sự kiện có tag_id nằm trong danh sách hiddenIds
      if (hiddenIds.includes(event.tag_id)) {
        return false;
      }

      return true;
    });
  };

  const updateTransformedEvents = () => {
    // transformedEvents.value = filterEvents([]); // filterEvents([]) truyền vào tag muốn ân 

    transformedEvents.value = filterEvents(hiddenTagsStore.hiddenTags); // không muốn ẩn hiện thì comment 
    console.log(transformedEvents.value);

    // transformedEvents.value =[...transformedEvents.value ];  // giá trị mặc định k có ẩn hiện 

    transformedEvents.value.forEach((event) => calendarStore.addEventStore(event));

  };

  // watch theo dõi ẩn hiện tag 
  watch(() => hiddenTagsStore.hiddenTags, (newHiddenTags) => {
    // console.log("Hidden tags thay đổi:", newHiddenTags);
    updateTransformedEvents(); // cập nhật lịch
  }, { deep: true });

  onMounted(async () => {
    await fetchEvents();
    updateTransformedEvents();
  });

  watch(selectedTimezone, (newTimezone) => {
    // console.log(`Timezone đã thay đổi: ${newTimezone}`);
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
      dayHeaderFormat: settingsStore.dayHeaderFormat,
      timeFormat: settingsStore.timeFormat,
      displayMode: settingsStore.displayMode
    }),
    (newSettings) => {
      console.log("Calendar settings changed:", newSettings);
      if (calendarRef.value) {
        const calendarApi = calendarRef.value.getApi();

        // Cập nhật các tùy chọn
        calendarApi.setOption('titleFormat', newSettings.titleFormat);
        calendarApi.setOption('dayHeaderFormat', newSettings.dayHeaderFormat);
        calendarApi.setOption('eventTimeFormat', {
          hour: "2-digit",
          minute: "2-digit",
          hour12: newSettings.timeFormat === "12h"
        });

        // Cập nhật lại view hiện tại
        const currentView = calendarApi.view.type;
        calendarApi.changeView(currentView);

        // Cập nhật lại sự kiện
        calendarApi.refetchEvents();
      }
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
      parent_id: extendedProps.parent_id || null,
      title: event.title || '',
      uuid: extendedProps.uuid || null,
      user_id: extendedProps.user_id || null,
      type: extendedProps.type || 'task',
      start: event.startStr || '',
      end: event.endStr || '',
      start_time: extendedProps.start_time || null,
      end_time: extendedProps.end_time || null,
      tag_id: extendedProps.tag_id || null,
      tag_name: extendedProps.tag_name || '',
      tag_color_code: extendedProps.tag_color_code || null,
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
      is_private: extendedProps.is_private,
      info: event._def || null,
      attachments: extendedProps.attachments || [],
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

    await fetchEvents();
    updateTransformedEvents();
  };
  const isCalendarLoading = ref(false);

  const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin, luxonPlugin, multiMonthPlugin],
    headerToolbar: false,
    locale: settingsStore.language,
    dayMaxEvents: true,

    // height: 'calc(100vh - 200px)',
    contentHeight: 'calc(100vh - 170px)',
    // contentHeight: settingsStore.displayMode === 'dayGridMonth' ? 'calc(100vh - 200px)' : 'auto',

    
    // expandRows: true,

    allDaySlot: true,

    // chặn kéo thả vào allday trong timeGridWeek và timeGridDay
    eventAllow: (dropInfo, draggedEvent) => {
      const currentView = draggedEvent._context.viewApi.type; // Lấy loại view hiện tại

      // Chặn kéo thả trong chế độ timeGridWeek và timeGridDay
      if (currentView === 'timeGridWeek' || currentView === 'timeGridDay') {
        if(dropInfo.allDay) {
          return false; // Không cho phép kéo thả nếu là sự kiện cả ngày
        } else {
          return true;
        }
      }

      return true; // Cho phép kéo thả trong các chế độ khác
    },
    
    timeZone: selectedTimezone.value,
    now: dayjs().tz(settingsStore.timeZone || 'Asia/Saigon').startOf('day').toDate(),
    firstDay: settingsStore.firstDay,
    initialDate: settingsStore.initialDate || dayjs().format('YYYY-MM-DD'),
    initialView: settingsStore.displayMode || 'dayGridMonth',
    views: {
      multiMonthYear: {
        type: 'multiMonth',
        duration: { years: 1 },
        multiMonthMaxColumns: settingsStore.multiMonthMaxColumns || 3,
        multiMonthMinWidth: 300,
        showNonCurrentDates: settingsStore.showNonCurrentDates,
        titleFormat: settingsStore.titleFormat,
        dayMaxEvents: true,
        moreLinkContent: (args) => `+${args.num}`,
        multiMonthTitleFormat: { month: 'long' }
      },
      dayGridMonth: {
        type: 'dayGrid',
        duration: { months: 1 },
        titleFormat: { month: 'long', year: 'numeric' },
        dayMaxEvents: true,
        moreLinkContent: (args) => `+${args.num}`,
        dayCellClassNames: (arg) => {
          const today = dayjs().startOf('day');
          const cellDate = dayjs(arg.date).startOf('day');
          return today.isSame(cellDate) ? ['fc-day-today'] : [];
        }
      },
      listYear: {
        type: 'list',
        duration: { years: 1 },
        titleFormat: { year: 'numeric' },
        listDayFormat: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
        listDaySideFormat: false,
        noEventsContent: 'Không có sự kiện nào'
      },
      timeGridCustom: {
        type: 'timeGrid',
        duration: { days: 7 }, // Default to 7 days, will be updated based on route params
        slotDuration: '01:00:00',
        slotLabelFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: settingsStore.timeFormat === "12h"
        }
      }
    },
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
    dayHeaderFormat: settingsStore.dayHeaderFormat,
    titleFormat: settingsStore.titleFormat,
    validRange: settingsStore.validRange,
    editable: true,
    selectable: true,
    selectMirror: true,
    events: transformedEvents.value.length ? transformedEvents.value : [],
    eventDrop,
    eventResize,
    nowIndicator: true,
    dateClick: openAddEventModal,
    eventClick: openEventDetailModal,
    select: (info) => {
      if (!info.allDay) {
        selectedEventAdd.value = {
          start: dayjs(info.startStr).tz(selectedTimezone.value).format('YYYY-MM-DD HH:mm'),
          end: info.view.type == 'dayGridMonth'
            ? dayjs(info.endStr).tz(selectedTimezone.value).format('YYYY-MM-DD HH:mm')
            : dayjs(info.endStr).tz(selectedTimezone.value).format('YYYY-MM-DD HH:mm'),
          allDay: info.allDay,
        };
      } else {
        selectedEventAdd.value = {
          start: info.startStr,
          end: info.endStr,
          allDay: info.allDay,
        };
      }

      isAddEventModalVisible.value = true;
    },
    loading: (isLoading) => {
      isCalendarLoading.value = isLoading;
      // console.log(isLoading ? 'Đang tải sự kiện...' : 'Đã tải xong sự kiện');
    },
  }));

  // Cập nhật watcher cho view năm
  watch(
    () => ({
      multiMonthMaxColumns: settingsStore.multiMonthMaxColumns,
      showNonCurrentDates: settingsStore.showNonCurrentDates,
      displayMode: settingsStore.displayMode
    }),
    (newSettings) => {
      if (calendarRef.value && settingsStore.displayMode === 'multiMonthYear') {
        console.log('Updating year view settings:', newSettings);
        const calendarApi = calendarRef.value.getApi();

        const viewOptions = {
          type: 'multiMonth',
          duration: { years: 1 },
          multiMonthMaxColumns: newSettings.multiMonthMaxColumns,
          multiMonthMinWidth: 300,
          showNonCurrentDates: newSettings.showNonCurrentDates,
          titleFormat: { year: 'numeric' },
          dayMaxEvents: true,
          moreLinkContent: (args) => `+${args.num}`,
          multiMonthTitleFormat: { month: 'long' }
        };

        if (calendarApi.view.type === 'multiMonthYear') {
          calendarApi.setOption('views', { multiMonthYear: viewOptions });
        } else {
          calendarApi.changeView('multiMonthYear', viewOptions);
        }
      }
    },
    { deep: true }
  );

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
    isCalendarLoading,
  };
}

