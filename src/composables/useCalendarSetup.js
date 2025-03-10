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


import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // Import CSS cho tooltip

dayjs.extend(utc);

const settingsStore = useSettingsStore();
const selectedTimezone = computed(() => settingsStore.timeZone);

const calendarRef = ref(null);


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
        console.log("selectedTimezone", selectedTimezone.value);
      const rrule =
        event.is_repeat && event.rrule
          ? {
              dtstart: event.start_time
                ? new Date(event.start_time).toISOString().replace('.000Z', '')
                : null,
              ...event.rrule,
            }
          : null;

      return {
        id: event.id,
        title: event.title,
        uuid: event.uuid,
        description: event.description,
        start,
        end,
        timezone: event.timezone_code,
        allDay: event.is_all_day === 1,
        backgroundColor: event.color_code || '#3788d8',
        borderColor: event.color_code || '#3788d8',
        location: event.location,
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
        },
        exdate: Array.isArray(event.exclude_time)
          ? event.exclude_time.map((date) =>
              new Date(date).toISOString().replace('.000Z', '').slice(0, 16)
            )
          : undefined,
        rrule:
          event.is_repeat && event.rrule
            ? {
                dtstart: event.start_time
                ? new Date(event.start_time).toISOString().replace('.000Z', '')
                : null,
                freq: event.rrule.freq || 'daily',
                interval: event.rrule.interval || 1,
                until: event.rrule.until ? event.rrule.until.replace(' ', 'T') : null,
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
      settingsStore.eventTimeFormat =
        newFormat === '24h'
          ? { hour: '2-digit', minute: '2-digit', hour12: false }
          : { hour: '2-digit', minute: '2-digit', hour12: true };
    }
  );

  const openAddEventModal = (info) => {
    if (info.view.type === 'dayGridMonth') {
      selectedEventAdd.value = {
        start: info.dateStr,
        end: dayjs(info.dateStr).add(1, 'hour'),
      };
    }
    isAddEventModalVisible.value = true;
  };


  const openEventDetailModal = (info) => {
    selectedEvent.value = {
      id: info.event.id,
      title: info.event.title,
      uuid: info.event.extendedProps.uuid,
      start: info.event.startStr,
      end: info.event.endStr,
      end_time: info.event.extendedProps.end_time,
      timezone: info.event.extendedProps.timezone,
      color: info.event.backgroundColor,
      is_all_day: info.event.allDay,
      recurrence: info.event.extendedProps.recurrence || 'none',
      description: info.event.extendedProps.description || '',
      attendees: info.event.extendedProps.attendees,
      is_done: info.event.extendedProps.is_done,
      is_reminder: info.event.extendedProps.is_reminder ?? 'none',
      reminder: info.event.extendedProps.reminder ?? 'none',
      location: info.event.extendedProps.location,
      info: info.event._def,
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
    timeZone: selectedTimezone.value,
    firstDay: settingsStore.firstDay,
    initialDate: settingsStore.initialDate,
    initialView: settingsStore.displayMode,
    eventTimeFormat: settingsStore.eventTimeFormat,
    dayHeaderFormat: settingsStore.dayHeaderFormat || { weekday: 'short', day: 'numeric' },
    titleFormat: settingsStore.titleFormat,
    validRange: settingsStore.validRange,
    editable: true,
    selectable: true,
    events: transformedEvents.value.length ? transformedEvents.value : [],
    nowIndicator: true,
    dateClick: openAddEventModal,
    eventClick: openEventDetailModal,
    select: (info) => {
      selectedEventAdd.value = {
        start: info.startStr,
        end:
          info.view.type === 'dayGridMonth'
            ? dayjs(info.endStr).subtract(1, 'day').add(1, 'hour')
            : info.endStr,
      };
      isAddEventModalVisible.value = true;
    },
    loading: (isLoading) => {
      console.log(isLoading ? 'Đang tải sự kiện...' : 'Đã tải xong sự kiện');
    },
    // Kéo thả
    eventDrop: async (info) => {
      try {
        // Lấy thông tin sự kiện sau khi kéo
        const taskId = info.event.id;
        const newStart = info.event.start.toISOString();
        const newEnd = info.event.end ? info.event.end.toISOString() : null;

        // Hiển thị xác nhận với người dùng
        const confirmMove = window.confirm(
          `Bạn có chắc muốn chuyển sự kiện "${info.event.title}" sang ngày ${newStart} không?`
        );

        if (!confirmMove) {
          info.revert(); // Nếu chọn "Hủy", hoàn tác
          return;
        }

        // Gửi yêu cầu cập nhật task lên API
        const response = await fetch(`${dirApi}tasks/${taskId}/onDrag`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ start: newStart, end: newEnd }),
        });

        if (!response.ok) {
          throw new Error("Cập nhật thất bại");
        }

        alert(`Sự kiện "${info.event.title}" đã được cập nhật thành công.`);
      } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện:", error);
        alert("Đã xảy ra lỗi khi cập nhật sự kiện!");
        info.revert(); // Hoàn tác nếu có lỗi
      }
    },

     // Update task
    eventChange: async (info) => {
      try {
        const taskId = info.event.id;
        const newStart = info.event.start.toISOString().replace("T", " ").substring(0, 19);
        const newEnd = info.event.end ? info.event.end.toISOString().replace("T", " ").substring(0, 19) : null;
    
        const updatedData = {
          start_time: newStart,
          end_time: newEnd,
          code: "EDIT_N", // Cập nhật bình thường
        };
    
        const response = await fetch(`${dirApi}tasks/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
    
        if (!response.ok) {
          throw new Error("Cập nhật thất bại");
        }
    
        console.log(`Sự kiện "${info.event.title}" đã được cập nhật.`);
      } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện:", error);
        alert("Đã xảy ra lỗi khi cập nhật!");
        info.revert(); // Hoàn tác nếu lỗi
      }
    },
    // eventDidMount: (info) => {
    //   // Khởi tạo tooltip cho sự kiện
    //   const { title, start, end, location, description } = info.event;
    
    //   // Định dạng thời gian
    //   const startTime = start
    //   ? dayjs(start).isSame(dayjs(), 'day')
    //     ? "Hôm nay " + dayjs(start).format("HH:mm")
    //     : dayjs(start).format("DD/MM/YYYY HH:mm")
    //   : "Không có thời gian bắt đầu";
    
    // const endTime = end
    //   ? dayjs(end).isSame(dayjs(), 'day')
    //     ? "Hôm nay " + dayjs(end).format("HH:mm")
    //     : dayjs(end).format("DD/MM/YYYY HH:mm")
    //   : "Không có thời gian kết thúc";
    
    //   tippy(info.el, {
    //     content: `
    //       <strong>${title || "Không có tiêu đề"}</strong><br>
    //       ${startTime} - ${endTime}<br>
    //       Địa điểm: ${location || "Không có thông tin"}<br>
    //       Mô tả: ${description || "Không có mô tả"}
    //     `,
    //     allowHTML: true,
    //     interactive: true,
    //     theme: 'light',
    //   });
    // }
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

