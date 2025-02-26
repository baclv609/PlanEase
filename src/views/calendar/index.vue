<script setup>
import { ref, onMounted  } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import { RRule } from "rrule";
import { useRouter } from "vue-router";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendar } from "@/composables/useCalendar.js";

import EventModal from "./components/EventModal.vue";
import dayjs from "dayjs";

const settingsStore = useSettingsStore();
const calendarRef = ref(null);

const { calendarKey, calendarOptions } = useCalendar();

onMounted(() => {
  settingsStore.setCalendarRef(calendarRef.value);
});

const router = useRouter();

const selectedEvent = ref(null);
// const events =ref([
//   // 1️⃣ Lặp lại hàng ngày (Daily)
//   {
//     id: 1,
//     title: "Daily Meeting",
//     start: "2025-03-01T09:00:00",
//     end: "2025-03-01T09:30:00",
//     is_repeat: 1,
//     color_code: "#008080",
//     rrule: {
//       freq: "daily",
//       interval: 1, // Mỗi ngày 1 lần
//       until: "2025-06-01T09:30:00Z",
//     },
//   },
  
//   // 2️⃣ Lặp lại cách ngày (Every 2 Days)
//   {
//     id: 2,
//     title: "Gym Workout",
//     start: "2025-03-02T07:00:00",
//     end: "2025-03-02T08:30:00",
//     is_repeat: 1,
//     color_code: "#FF4500",
//     rrule: {
//       freq: "daily",
//       interval: 2, // Cách 2 ngày một lần
//       until: "2025-06-01T08:30:00Z",
//     },
//   },

//   // 3️⃣ Lặp lại hàng tuần (Weekly)
//   {
//     id: 3,
//     title: "Weekly Team Sync",
//     start: "2025-03-03T10:00:00",
//     end: "2025-03-03T11:00:00",
//     is_repeat: 1,
//     color_code: "#FF5733",
//     rrule: {
//       freq: "weekly",
//       interval: 1,
//       until: "2025-07-01T11:00:00Z",
//       byweekday: ["mo", "we", "fr"], // Lặp lại vào thứ 2, 4, 6
//     },
//   },

//   // 4️⃣ Lặp lại cách tuần (Every 2 Weeks)
//   {
//     id: 4,
//     title: "Biweekly Catch-up",
//     start: "2025-03-10T14:00:00",
//     end: "2025-03-10T15:00:00",
//     is_repeat: 1,
//     color_code: "#FFD700",
//     rrule: {
//       freq: "weekly",
//       interval: 2, // Cách 2 tuần một lần
//       until: "2025-12-01T15:00:00Z",
//       byweekday: ["tu"], // Thứ 3 mỗi 2 tuần
//     },
//   },

//   // 5️⃣ Lặp lại hàng tháng (Monthly)
//   {
//     id: 5,
//     title: "Monthly Report Submission",
//     start: "2025-03-05T15:00:00",
//     end: "2025-03-05T16:00:00",
//     is_repeat: 1,
//     color_code: "#33FF57",
//     rrule: {
//       freq: "monthly",
//       interval: 1,
//       until: "2025-12-01T16:00:00Z",
//       bymonthday: [5], // Mỗi tháng vào ngày 5
//     },
//   },

//   // 6️⃣ Lặp lại vào ngày cuối tháng
//   {
//     id: 6,
//     title: "Payroll Processing",
//     start: "2025-03-31T18:00:00",
//     end: "2025-03-31T19:00:00",
//     is_repeat: 1,
//     color_code: "#DC143C",
//     rrule: {
//       freq: "monthly",
//       interval: 1,
//       until: "2026-03-31T19:00:00Z",
//       bymonthday: [-1], // Ngày cuối cùng của mỗi tháng
//     },
//   },

//   // 7️⃣ Lặp lại vào tuần thứ 2 của tháng
//   {
//     id: 7,
//     title: "Leadership Meeting",
//     start: "2025-03-10T09:00:00",
//     end: "2025-03-10T10:00:00",
//     is_repeat: 1,
//     color_code: "#8A2BE2",
//     rrule: {
//       freq: "monthly",
//       interval: 1,
//       until: "2025-12-10T10:00:00Z",
//       byweekday: ["mo"], // Thứ Hai
//       bysetpos: 2, // Tuần thứ 2 trong tháng
//     },
//   },

//   // 8️⃣ Lặp lại hàng năm (Yearly)
//   {
//     id: 8,
//     title: "Company Anniversary",
//     start: "2025-08-15T09:00:00",
//     end: "2025-08-15T10:00:00",
//     is_repeat: 1,
//     color_code: "#FFD700",
//     rrule: {
//       freq: "yearly",
//       interval: 1,
//       until: "2030-08-15T10:00:00Z",
//     },
//   },

//   // 9️⃣ Lặp lại vào một số tháng trong năm
//   {
//     id: 9,
//     title: "Vietnamese National Holidays",
//     start: "2025-05-01T00:00:00",
//     end: "2025-05-01T23:59:59",
//     is_repeat: 1,
//     color_code: "#1E90FF",
//     rrule: {
//       freq: "yearly",
//       interval: 1,
//       until: "2030-09-02T23:59:59Z",
//       bymonth: [5, 9], // Lặp lại vào tháng 5 và tháng 9
//       bymonthday: [1, 2], // Ngày 1 tháng 5 & 2 tháng 9
//     },
//   },

//   // 🔟 Lặp lại theo mô hình cụ thể (Ví dụ: ngày thứ 2 đầu tiên của quý)
//   {
//     id: 10,
//     title: "Quarterly Business Review",
//     start: "2025-04-07T10:00:00",
//     end: "2025-04-07T11:30:00",
//     is_repeat: 1,
//     color_code: "#FF1493",
//     rrule: {
//       freq: "monthly",
//       interval: 3, // Mỗi 3 tháng một lần
//       until: "2026-12-01T11:30:00Z",
//       byweekday: ["mo"], // Chỉ thứ 2
//       bysetpos: 1, // Tuần đầu tiên của tháng
//     },
//   },
// ]);


const showModal = ref(false);
const eventData = ref({
  title: "",
  start: null, // Sửa "" -> null
  color: "#3788d8",
  recurrence: "none",
  repeatCount: 1,
  description: "",
});

const isEditing = ref(false);
const isModalVisible = ref(false);

// Dữ liệu form sự kiện mới
const newEvent = ref({
  title: "",
  start: "",
  color: "#3788d8",
  recurrence: "none",
});

const handleDateClick = (info) => {
  console.log("Click vào ngày:", info.dateStr);
  selectedEvent.value = {
    title: "",
    start: info.dateStr,
    end: info.dateStr,
    color: "#3788d8",
    recurrence: "none",
  };
  isModalVisible.value = true;
  console.log("isModalVisible:", isModalVisible.value);
};

const handleEventClick = (info) => {
  console.log("Click vào sự kiện:", info.event);
  selectedEvent.value = {
    id: info.event.id,
    title: info.event.title,
    start: info.event.startStr,
    end: info.event.endStr,
    color: info.event.backgroundColor,
    recurrence: info.event.extendedProps.recurrence || "none",
  };
  isModalVisible.value = true;
  console.log("isModalVisible:", isModalVisible.value);
};

const addEvent = (eventData) => {
  if (eventData.recurrence === "none") {
    eventData.start = dayjs(eventData.start).format("YYYY-MM-DDTHH:mm:ss");
  } else {
    eventData.rrule = {
      freq: eventData.recurrence,
      dtstart: dayjs(eventData.start).format("YYYY-MM-DDTHH:mm:ss"),
      count: 10,
    };
    delete eventData.start;
  }

  events.value.push({ id: String(events.value.length + 1), ...eventData });
  showModal.value = false; // Đóng modal sau khi lưu
};

const saveEvent = (eventData) => {
  if (eventData.recurrence === "none") {
    eventData.start = dayjs(eventData.start).format("YYYY-MM-DDTHH:mm:ss");
  } else {
    eventData.rrule = {
      freq: eventData.recurrence,
      dtstart: dayjs(eventData.start).format("YYYY-MM-DDTHH:mm:ss"),
      count: eventData.repeatCount,
    };
    delete eventData.start;
  }

  if (eventData.id) {
    // Chỉnh sửa sự kiện
    const index = events.value.findIndex((e) => e.id === eventData.id);
    if (index !== -1) events.value[index] = eventData;
  } else {
    // Thêm sự kiện mới
    eventData.id = String(events.value.length + 1);
    events.value.push(eventData);
  }

  isModalVisible.value = false;
};

const handleCancel = () => {
  isModalVisible.value = false;
};

// const calendarOptions = ref({
//   plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin],
//   initialView: "timeGridWeek",
//   // isModalVisible: true, // Mạc định một ngày
//   headerToolbar: {
//     left: "prev,next today",
//     center: "title",
//     right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
//   },
//   height: 720,
//   // calendarWeekends: false, // Mặc định một ngày
//   // calendaring: "true", // Chương trình đăng ký
//   // businessHours: true, // Thời gian lớp học
//   editable: true,
//   selectable: true,
//   events: events,

//   // Lắng nghe sự kiện khi click vào ngày
//   dateClick: (info) => {
//     console.log("Ngày được click:", info.dateStr);
//     handleDateClick(info);
//     // mở modal tạo sự kiện
//   },

//   // Lắng nghe sự kiện khi click vào một sự kiện
//   eventClick: (info) => {
//     console.log("Sự kiện được click:", info.event);
//     handleEventClick(info);
//   },

//   // Lắng nghe sự kiện khi kéo thả sự kiện
//   eventDrop: (info) => {
//     console.log("Sự kiện bị di chuyển:", info.event);
//   },

//   // Lắng nghe sự kiện khi thay đổi kích thước sự kiện
//   eventResize: (info) => {
//     console.log("Sự kiện bị thay đổi kích thước:", info.event);
//   },

//   // Lắng nghe sự kiện khi chọn một khoảng thời gian
//   select: (info) => {
//     console.log("Khoảng thời gian được chọn:", info.startStr, " - ", info.endStr);
//   },
// });
</script>

<template>
  <div>
    <a-button type="primary" @click="showModal = true" style="margin-top: 10px">
      Thêm Sự Kiện
    </a-button>

    <FullCalendar  ref="calendarRef" :key="calendarKey" :options="calendarOptions" />

    <EventModal
      :visible="isModalVisible"
      :event="selectedEvent"
      @save="saveEvent"
      @cancel="handleCancel"
    />
  </div>
</template>

