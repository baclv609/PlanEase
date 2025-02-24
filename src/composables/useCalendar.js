import { ref, computed, watch } from "vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import dayjs from "dayjs";
import { RRule } from "rrule";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const showHolidays = ref(true); // Mặc định hiển thị ngày lễ

export const toggleHolidays = () => {
  showHolidays.value = !showHolidays.value;
};

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
      start: dayjs(event.start_time).toISOString(),
      end: dayjs(event.end_time).toISOString(),
      allDay: !!event.is_all_day,
      backgroundColor: event.color_code || "#3788d8",
      extendedProps: {
        description: event.description || "",
        location: event.location || "",
        isReminder: event.is_reminder || 0,
        reminder: event.reminder || [],
      },
    };

    if (event.is_repeat && event.rrule) {
      try {
        console.log("Có RRule:", event.rrule);
        fullCalendarEvent.rrule = {
          freq: convertFreq(event.rrule.date_space),
          interval: event.rrule.repeat_space || 1,
          dtstart: dayjs(event.start_time)
            .utc()
            .format("YYYY-MM-DDTHH:mm:ss[Z]"),
          until: event.rrule.end_repeat
            ? dayjs(event.rrule.end_repeat)
                .utc()
                .format("YYYY-MM-DDTHH:mm:ss[Z]")
            : undefined,
          byweekday:
            event.rrule.day_of_week?.map(convertDayOfWeek).filter(Boolean) ||
            undefined,
          bymonthday: event.rrule.day_of_month?.length
            ? event.rrule.day_of_month
            : undefined,
          bymonth: event.rrule.by_month?.length
            ? event.rrule.by_month
            : undefined,
        };

        // Xóa các giá trị undefined
        Object.keys(fullCalendarEvent.rrule).forEach((key) => {
          if (fullCalendarEvent.rrule[key] === undefined)
            delete fullCalendarEvent.rrule[key];
        });
      } catch (error) {
        console.error("Lỗi khi tạo RRule:", error);
      }
    }

    return fullCalendarEvent;
  };
  watch(
    events,
    (newEvents) => {
      console.log("Dữ liệu sự kiện mới cập nhật:", newEvents);
  
      if (!Array.isArray(newEvents)) {
        console.error("Lỗi: `events` không phải là một mảng!");
        return;
      }
  
      transformedEvents.value = newEvents.map(transformEvent).filter(Boolean);
      console.log("Sự kiện sau khi transform:", transformedEvents.value);
  
      calendarKey.value++;
    },
    { deep: true, immediate: true }
  );
  
  

  const handleEventDrop = (info) => {
    const event = info.event;
    const newStart = dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss[Z]");
    const newEnd = dayjs(event.end).format("YYYY-MM-DDTHH:mm:ss[Z]");
    event.setProp("start", newStart);
    event.setProp("end", newEnd);

    axios
      .put(`/api/events/${event.id}`, {
        start_time: newStart,
        end_time: newEnd,
      })
      .then((response) => {
        console.log("Event updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error updating event:", error);
      });
  };

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

  const calendarOptions = computed(() => {
    console.log(
      "Danh sách sự kiện truyền vào FullCalendar:",
      transformedEvents.value
    );

    return {
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
    };
  });

  return {
    calendarKey,
    calendarOptions,
    handleDateClick,
    handleEventClick,
  };
}
