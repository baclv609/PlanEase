import { ref, computed, watch } from "vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import dayjs from "dayjs";
import { RRule } from "rrule";

// Hàm chuyển đổi tần suất lặp lại
const convertFreq = (dateSpace) => {
  switch (dateSpace) {
    case "daily":
      return RRule.DAILY;
    case "weekly":
      return RRule.WEEKLY;
    case "monthly":
      return RRule.MONTHLY;
    case "yearly":
      return RRule.YEARLY;
    default:
      return null;
  }
};

// Chuyển đổi ngày trong tuần
const convertDayOfWeek = (day) => {
  const days = {
    mo: RRule.MO,
    tu: RRule.TU,
    we: RRule.WE,
    th: RRule.TH,
    fr: RRule.FR,
    sa: RRule.SA,
    su: RRule.SU,
  };
  return days[day] || null;
};

export function useCalendar(events, showModal, selectedEvent, isModalVisible) {
  const calendarKey = ref(0);
  const transformedEvents = ref([]);

  // Chuyển đổi dữ liệu sang dạng FullCalendar
  const transformEvent = (event) => {
    if (!event || !event.start_time || !event.end_time) return null;

    let fullCalendarEvent = {
      id: event.id?.toString() || undefined,
      title: event.title || "Không có tiêu đề",
      start: dayjs(event.start_time).toISOString(), // Chuyển sang chuẩn ISO
      end: dayjs(event.end_time).toISOString(),
      allDay: !!event.is_all_day,
      backgroundColor: event.color_code || "#3788d8",
      extendedProps: {
        description: event.description || "",
        location: event.location || "",
        isReminder: event.is_reminder || 0,
        reminder: event.reminder || [],
        user_ids: event.user_ids || [],
        isDone: event.is_done || 0,
        isRepeat: event.is_repeat || 0,
        isBusy: event.is_busy || 0,
      },
    };

    // Nếu sự kiện có lặp lại
    if (event.is_repeat && event.rrule) {
        const rruleOptions = {
            freq: convertFreq(event.rrule.date_space),
            interval: event.rrule.repeat_space || 1,
            dtstart: dayjs(event.start_time).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"), // Định dạng chuẩn UTC
            until: event.rrule.end_repeat ? dayjs(event.rrule.end_repeat).utc().format("YYYY-MM-DDTHH:mm:ss[Z]") : null,
            byweekday: event.rrule.day_of_week?.map(convertDayOfWeek).filter(Boolean) || undefined,
            bymonthday: event.rrule.day_of_month?.length ? event.rrule.day_of_month : undefined,
            bymonth: event.rrule.by_month?.length ? event.rrule.by_month : undefined,
          };
          
      // Loại bỏ các thuộc tính `null` hoặc `undefined`
      Object.keys(rruleOptions).forEach((key) => {
        if (rruleOptions[key] === null || rruleOptions[key] === undefined) {
          delete rruleOptions[key];
        }
      });

      fullCalendarEvent.rrule = rruleOptions;
    }

    return fullCalendarEvent;
  };

  watch(events, () => {
    console.log("Dữ liệu sự kiện cập nhật:", events.value);
    transformedEvents.value = events.value.map(transformEvent).filter(Boolean);
    console.log("Sự kiện sau khi chuyển đổi:", transformedEvents.value);
    calendarKey.value++;
  }, { immediate: true });

  const handleEventDrop = (info) => {
    const event = info.event;
    const newStart = dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss[Z]");
    const newEnd = dayjs(event.end).format("YYYY-MM-DDTHH:mm:ss[Z]");
    event.setProp("start", newStart);
    event.setProp("end", newEnd);

    axios.put(`/api/events/${event.id}`, {  
      start_time: newStart,
      end_time: newEnd,
    }).then((response) => {
      console.log("Event updated successfully:", response.data);
    }).catch((error) => {
      console.error("Error updating event:", error);
    })


  }  

  const handleDateClick = (info) => {
    selectedEvent.value = {
      title: "",
      start: info.dateStr,
      end: info.dateStr,
      color: "#3788d8",
      recurrence: "none",
    };
    isModalVisible.value = true;
  };

  const handleEventClick = (info) => {
    selectedEvent.value = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      color: info.event.backgroundColor,
      recurrence: info.event.extendedProps.recurrence || "none",
    };
    isModalVisible.value = true;
  };

  const calendarOptions = computed(() => ({
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      listPlugin,
      rrulePlugin,
    ],
    initialView: "timeGridWeek",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    locale: "vi",
    timeZone: "Asia/Ho_Chi_Minh",
    height: 720,
    slotLabelFormat: { hour: "numeric", minute: "2-digit", hour12: true },
    dayHeaderFormat: { weekday: "short", day: "numeric" },
    editable: true,
    selectable: true,
    events: transformedEvents.value,
    nowIndicator: true,
    dateClick: handleDateClick,
    eventClick: handleEventClick,
  }));

  return {
    calendarKey,
    calendarOptions,
    handleDateClick,
    handleEventClick,
  };
}
