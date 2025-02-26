import { ref, computed, watch, onMounted } from "vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import dayjs from "dayjs";
import { RRule } from "rrule";
import utc from "dayjs/plugin/utc";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendarEvents } from "@/composables/useCalendarEvents";

const settingsStore = useSettingsStore(); // Khởi tạo Pinia Store

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
  const { formattedEvents, fetchEvents } = useCalendarEvents();

  const transformedEvents = ref([]);

 onMounted(async () => {
    await fetchEvents();
    console.log("formattedEvents", formattedEvents.value);
    // transformedEvents.value = formattedEvents.value.map(formattedEvents);
    console.log("transformedEvents.value", transformedEvents.value);
    transformedEvents.value = formattedEvents.value;
    console.log("transformedEvents.value", transformedEvents.value);
    
  });

  // Chuyển đổi dữ liệu sang dạng FullCalendar
  // const transformEvent = (event) => {
  //   if (!event || !event.start_time || !event.end_time) return null;

  //   let fullCalendarEvent = {
  //     id: event.id?.toString() || undefined,
  //     title: event.title || "Không có tiêu đề",
  //     start: dayjs(event.start_time).toISOString(),
  //     end: dayjs(event.end_time).toISOString(),
  //     allDay: !!event.is_all_day,
  //     backgroundColor: event.color_code || "#3788d8",
  //     extendedProps: {
  //       description: event.description || "",
  //       location: event.location || "",
  //       isReminder: event.is_reminder || 0,
  //       reminder: event.reminder || [],
  //     },
  //   };

  //   if (event.is_repeat && event.rrule) {
  //     try {
  //       console.log("Có RRule:", event.rrule);
  //       fullCalendarEvent.rrule = {
  //         freq: convertFreq(event.rrule.date_space),
  //         interval: event.rrule.repeat_space || 1,
  //         dtstart: dayjs(event.start_time)
  //           .utc()
  //           .format("YYYY-MM-DDTHH:mm:ss[Z]"),
  //         until: event.rrule.end_repeat
  //           ? dayjs(event.rrule.end_repeat)
  //               .utc()
  //               .format("YYYY-MM-DDTHH:mm:ss[Z]")
  //           : undefined,
  //         byweekday:
  //           event.rrule.day_of_week?.map(convertDayOfWeek).filter(Boolean) ||
  //           undefined,
  //         bymonthday: event.rrule.day_of_month?.length
  //           ? event.rrule.day_of_month
  //           : undefined,
  //         bymonth: event.rrule.by_month?.length
  //           ? event.rrule.by_month
  //           : undefined,
  //       };

  //       // Xóa các giá trị undefined
  //       Object.keys(fullCalendarEvent.rrule).forEach((key) => {
  //         if (fullCalendarEvent.rrule[key] === undefined)
  //           delete fullCalendarEvent.rrule[key];
  //       });
  //     } catch (error) {
  //       console.error("Lỗi khi tạo RRule:", error);
  //     }
  //   }

  //   return fullCalendarEvent;
  // };
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

  watch(
    () => ({
      titleFormat: settingsStore.titleFormat,
      columnHeaderFormat: settingsStore.columnHeaderFormat,
    }),
    () => {
      console.log("Cập nhật `titleFormat` hoặc `columnHeaderFormat` từ settingsStore...");
      calendarKey.value++; // Buộc FullCalendar render lại
    },
    { deep: true }
  );
  
// watch(
//     () => ({
//       timeFormat: settingsStore.timeFormat,
//     }),
//     () => {
//       console.log("Cập nhật lịch từ Pinia Settings Store...");
//       calendarKey.value++; // Buộc FullCalendar render lagi
// });
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
      console.log("Chế độ xem mới:", newView);
      calendarOptions.value.initialView = newView;
      calendarKey.value++; // Buộc FullCalendar render lại
    }
  );
  watch(() => settingsStore.timeFormat, (newFormat) => {
    console.log("newFormat", newFormat);
    
    settingsStore.eventTimeFormat = newFormat === "24h"
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : { hour: "2-digit", minute: "2-digit", hour12: true };
  });
  

  // const handleEventDrop = (info) => {
  //   const event = info.event;
  //   const newStart = dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss[Z]");
  //   const newEnd = dayjs(event.end).format("YYYY-MM-DDTHH:mm:ss[Z]");
  //   event.setProp("start", newStart);
  //   event.setProp("end", newEnd);

  //   axios
  //     .put(`/api/events/${event.id}`, {
  //       start_time: newStart,
  //       end_time: newEnd,
  //     })
  //     .then((response) => {
  //       console.log("Event updated successfully:", response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error updating event:", error);
  //     });
  // };

  const handleDateClick = (info) => {
    // selectedEvent.value = {
    //   title: "",
    //   start: info.dateStr,
    //   end: info.dateStr,
    //   color: "#3788d8",
    //   recurrence: "none",
    // };
    // isModalVisible.value = true;
    console.log("Click vào ngày:", info.dateStr);
    alert(`Tạo sự kiện mới vào ngày ${info.dateStr}`);
  };
  const handleEventDrop = (info) => {
    const event = info.event;
    const newStart = dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss[Z]");
    const newEnd = dayjs(event.end).format("YYYY-MM-DDTHH:mm:ss[Z]");
    event.setProp("start", newStart);
    event.setProp("end", newEnd);
  }

  const handleEventClick = (info) => {
    // selectedEvent.value = {
    //   id: info.event.id,
    //   title: info.event.title,
    //   start: info.event.startStr,
    //   end: info.event.endStr,
    //   color: info.event.backgroundColor,
    //   recurrence: info.event.extendedProps.recurrence || "none",
    // };
    // isModalVisible.value = true;
    console.log("Click vào sự kiện:", info.event);
  };

  // const calendarOptions = computed(() => {
  //   console.log(
  //     "Danh sách sự kiện truyền vào FullCalendar:",
  //     transformedEvents.value
  //   );

  //   return {
  //     plugins: [
  //       dayGridPlugin,
  //       timeGridPlugin,
  //       interactionPlugin,
  //       listPlugin,
  //       rrulePlugin,
  //     ],
  //     initialView: "timeGridWeek",
  //     headerToolbar: {
  //       left: "prev,next today",
  //       center: "title",
  //       right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  //     },
  //     locale: "vi",
  //     timeZone: "Asia/Ho_Chi_Minh",
  //     height: 720,
  //     slotLabelFormat: { hour: "numeric", minute: "2-digit", hour12: true },
  //     dayHeaderFormat: { weekday: "short", day: "numeric" },
  //     editable: true,
  //     selectable: true,
  //     events: transformedEvents.value,
  //     nowIndicator: true,
  //     dateClick: handleDateClick,
  //     eventClick: handleEventClick,
  //   };
  // });

  const calendarOptions = computed(() => ({
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      listPlugin,
      rrulePlugin,
    ],
    locale: settingsStore.language,
    timeZone: settingsStore.timeZone,
    firstDay: settingsStore.firstDay,
    initialDate: settingsStore.initialDate,
    initialView: settingsStore.displayMode, // 🔹 Thêm vào đây
    eventTimeFormat: settingsStore.eventTimeFormat,
    // columnHeaderFormat: settingsStore.columnHeaderFormat,
    dayHeaderFormat: settingsStore.dayHeaderFormat || { weekday: "short", day: "numeric" },
    titleFormat: settingsStore.titleFormat,
    validRange: settingsStore.validRange,
    editable: true,
    selectable: true,
    events: transformedEvents.value,
    nowIndicator: true,
    dateClick: handleDateClick,
    eventClick: handleEventClick,
    eventDrop: handleEventDrop,
   
    select: (info) => {
      console.log(`Chọn từ ${info.startStr} đến ${info.endStr}`);
    },

    eventAdd: (info) => {
      console.log("Sự kiện mới được thêm:", info.event);
    },
    eventChange: (info) => {
      console.log("Sự kiện được cập nhật:", info.event);
    },
    eventRemove: (info) => {
      console.log("Sự kiện đã bị xóa:", info.event);
    },
    
    eventDrop: (info) => {
      console.log(`Sự kiện "${info.event.title}" đã được kéo sang ngày ${info.event.start}`);
    },
    eventResize: (info) => {
      console.log(`Sự kiện "${info.event.title}" kéo dài đến ${info.event.end}`);
    },
    eventReceive: (info) => {
      console.log("Nhận sự kiện từ bên ngoài:", info.event);
    },
    datesSet: (info) => {
      console.log("Khoảng thời gian hiển thị:", info.startStr, "đến", info.endStr);
    },
    // viewDidMount: (info) => {
    //   console.log("View đã được tải:", info.view.type);
    // },
    loading: (isLoading) => {
      console.log(isLoading ? "Đang tải sự kiện..." : "Đã tải xong sự kiện");
    },
    // eventContent: (arg) => {
    //   return { html: `<b>${arg.event.title}</b>` };
    // },
    // eventPositioned: (info) => {
    //   console.log("Sự kiện đã được hiển thị trên giao diện:", info.event.title);
    // },
    // resourceAdd: (info) => {
    //   console.log("Tài nguyên mới được thêm:", info.resource);
    // },
    // resourceChange: (info) => {
    //   console.log("Tài nguyên đã thay đổi:", info.resource);
    // },
    // resourceRemove: (info) => {
    //   console.log("Tài nguyên đã bị xóa:", info.resource);
    // }
    
        
    
  }));
  

  return {
    calendarKey,
    calendarOptions,
    handleDateClick,
    handleEventClick,
  };
}
