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
import { useCalendarStore } from "@/stores/calendarStore";

const dirApi = import.meta.env.VITE_API_BASE_URL;


const settingsStore = useSettingsStore(); // Khởi tạo Pinia Store
const calendarStore = useCalendarStore();

dayjs.extend(utc);

const showHolidays = ref(true); // Mặc định hiển thị ngày lễ
export const toggleHolidays = () => {
  showHolidays.value = !showHolidays.value;
};

export function useCalendar() {
  const calendarKey = ref(0);
  const showModal = ref(false);
  const selectedEvent = ref(null);
  const selectedEventAdd = ref(null);

  const isAddEventModalVisible = ref(false); // Modal thêm mới sự kiện
  const isEventDetailModalVisible = ref(false); // Modal chi tiết sự kiện

  const { formattedEvents, fetchEvents } = useCalendarEvents();

  const transformedEvents = ref([]);

  onMounted(async () => {
    await fetchEvents();

    transformedEvents.value = formattedEvents.value
      ? [...formattedEvents.value]
      : [];

    // lưu store
    if (formattedEvents.value) {
      formattedEvents.value.forEach(event => {
        calendarStore.addEventStore(event);
      });
    }
    console.log("Danh sách sự kiện sau khi fetch:", transformedEvents.value);
  });

  watch(
    () => ({
      titleFormat: settingsStore.titleFormat,
      columnHeaderFormat: settingsStore.columnHeaderFormat,
    }),
    () => {
      console.log(
        "Cập nhật `titleFormat` hoặc `columnHeaderFormat` từ settingsStore..."
      );
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
  watch(
    () => settingsStore.timeFormat,
    (newFormat) => {
      console.log("newFormat", newFormat);

      settingsStore.eventTimeFormat =
        newFormat === "24h"
          ? { hour: "2-digit", minute: "2-digit", hour12: false }
          : { hour: "2-digit", minute: "2-digit", hour12: true };
    }
  );

  // Click vào ô trống trên lịch để mở modal tạo sự kiện
  const openAddEventModal = (info) => {
    if (info.view.type == 'dayGridMonth') {
      selectedEventAdd.value = {
        start: info.dateStr,
        end: dayjs(info.dateStr).add(1, 'hour'),
      };
    }
    isAddEventModalVisible.value = true; // Chỉ mở modal Thêm sự kiện
  };
  const openEventDetailModal = (info) => {
    selectedEvent.value = {
      id: info.event.id,
      title: info.event.title,
      uuid: info.event.extendedProps.uuid,
      start: info.event.startStr,
      end: info.event.endStr,
      color: info.event.backgroundColor,
      is_all_day: info.event.allDay,
      recurrence: info.event.extendedProps.recurrence || "none",
      description: info.event.extendedProps.description || "",
      attendees: info.event.extendedProps.attendees,
      is_done: info.event.extendedProps.is_done,
      is_reminder: info.event.extendedProps.is_reminder ?? "none",
      reminder: info.event.extendedProps.reminder ?? "none",
      location: info.event.extendedProps.location,
    };

    isEventDetailModalVisible.value = true;
    // showModal.value = true;
  };

  // const handleEventDrop = (info) => {
  //   const event = info.event;
  //   const newStart = dayjs(event.start).format("YYYY-MM-DDTHH:mm:ss[Z]");
  //   const newEnd = dayjs(event.end).format("YYYY-MM-DDTHH:mm:ss[Z]");
  //   event.setProp("start", newStart);
  //   event.setProp("end", newEnd);
  // };

  const handleEventClick = (info) => {
    selectedEvent.value = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
      color: info.event.backgroundColor,
      is_all_day: info.event.allDay,
      recurrence: info.event.extendedProps.recurrence || "none",
      description: info.event.extendedProps.description || "",
      attendees: info.event.extendedProps.attendees,
      is_done: info.event.extendedProps.is_done,
      is_reminder: info.event.extendedProps.is_reminder ?? "none",
      reminder: info.event.extendedProps.reminder ?? "none",
      location: info.event.extendedProps.location,
    };
    isModalVisible.value = true;
    // showModal.value = true;
    console.log("isModalVisible:", isModalVisible.value);
    console.log("click sự kiện chỉnh sửa:", selectedEvent.value);
  };

  const handleDeleteEvent = async () => {
    // console.log('Call List sau khi xoa:', $id)
    await fetchEvents();
    transformedEvents.value = formattedEvents.value
      ? [...formattedEvents.value]
      : [];
  };

  const handleEventModalSuccess = async () => {
    // console.log('Call List sau khi xoa:', $id)
    await fetchEvents();
    transformedEvents.value = formattedEvents.value
      ? [...formattedEvents.value]
      : [];
  };

  const calendarOptions = computed(() => ({
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin,
      listPlugin,
      rrulePlugin,
    ],
    headerToolbar: false,
    locale: settingsStore.language,
    timeZone: settingsStore.timeZone,
    firstDay: settingsStore.firstDay,
    initialDate: settingsStore.initialDate,
    initialView: settingsStore.displayMode, 
    eventTimeFormat: settingsStore.eventTimeFormat,
    // columnHeaderFormat: settingsStore.columnHeaderFormat,
    dayHeaderFormat: settingsStore.dayHeaderFormat || {
      day: "numeric",
      weekday: "short",
    },
    titleFormat: settingsStore.titleFormat,
    validRange: settingsStore.validRange,
    editable: true,
    selectable: true,
    events: transformedEvents.value.length ? transformedEvents.value : [], // Đảm bảo không có lỗi
    nowIndicator: true,
    dateClick: openAddEventModal,
    eventClick: openEventDetailModal,

    select: (info) => {
      console.log(`Chọn từ ${info.startStr} đến ${info.endStr}`);

      if (info.view.type == 'dayGridMonth') {
        selectedEventAdd.value = {
          start: info.startStr,
          end: dayjs(info.endStr).subtract(1, 'day').add(1, 'hour'),
        };
      } else {
        selectedEventAdd.value = {
          start: info.startStr,
          end: info.endStr,
        };
      }
      console.log("selectedEventAdd", selectedEventAdd.value);
      isAddEventModalVisible.value = true; // Chỉ mở modal Thêm sự kiện
    },

    eventAdd: (info) => {
      console.log("Sự kiện mới được thêm:", info.event);
    },

    eventRemove: (info) => {
      console.log("Sự kiện đã bị xóa:", info.event);
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

    // eventChange: (info) => {
    //   console.log("Sự kiện được cập nhật:", info.event);
    // },


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
    


    eventResize: (info) => {
      console.log(
        `Sự kiện "${info.event.title}" kéo dài đến ${info.event.end}`
      );
    },
    eventReceive: (info) => {
      console.log("Nhận sự kiện từ bên ngoài:", info.event);
    },
    datesSet: (info) => {
      console.log(
        "Khoảng thời gian hiển thị:",
        info.startStr,
        "đến",
        info.endStr
      );
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
    transformedEvents,
    isAddEventModalVisible,
    isEventDetailModalVisible,
    selectedEvent,
    handleDeleteEvent,
    selectedEventAdd,
    handleEventModalSuccess,
    // openEventDetailModal,
  };
}
