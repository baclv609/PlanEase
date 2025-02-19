<script setup>
import { ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import rrulePlugin from "@fullcalendar/rrule";
import { RRule } from "rrule";
import { useRouter } from "vue-router";

import EventModal from "./components/EventModal.vue";
import dayjs from "dayjs";

const router = useRouter();
const calendarKey = ref(0);
const selectedEvent = ref(null);
const events = ref([
  // Sự kiện một lần
  { id: "1", title: "Họp nhóm", start: "2025-02-17 12:11:12", color: "#1e90ff" },

  // Sự kiện một lần
  { id: "2", title: "Deadline dự án", start: "2025-02-21T14:00:00", color: "#ff4500" },

  // Họp hàng tuần vào thứ Tư, lặp lại 10 lần
  {
    id: "3",
    title: "Họp hàng tuần",
    rrule: {
      freq: "weekly",
      dtstart: "2025-02-19T09:00:00",
      count: 10, // Giới hạn 10 lần lặp lại
    },
    color: "#00a65a",
  },

  // Sự kiện diễn ra hàng ngày, kéo dài đến hết tháng 3/2025
  {
    id: "4",
    title: "Báo cáo hàng ngày",
    rrule: {
      freq: "daily",
      dtstart: "2025-02-19T08:00:00",
      until: "2025-03-31T23:59:59",
    },
    color: "#ff6347",
  },

  // Họp hàng tháng vào ngày 15
  {
    id: "5",
    title: "Họp quản lý",
    rrule: {
      freq: "monthly",
      bymonthday: 15, // Ngày 15 hàng tháng
      dtstart: "2025-02-15T10:00:00",
      count: 6, // Lặp lại 6 lần
    },
    color: "#008080",
  },

  // Họp hàng năm vào ngày 1/5
  {
    id: "6",
    title: "Kỷ niệm ngày thành lập",
    rrule: {
      freq: "yearly",
      bymonth: 5, // Tháng 5
      bymonthday: 1, // Ngày 1
      dtstart: "2025-05-01T09:00:00",
      count: 5, // Lặp lại 5 lần
    },
    color: "#800080",
  },

  // Lớp học vào thứ Hai, thứ Tư, thứ Sáu hàng tuần, lặp lại trong 3 tháng
  {
    id: "7",
    title: "Lớp học nâng cao",
    rrule: {
      freq: "weekly",
      byweekday: ["mo", "we", "fr"], // Thứ Hai, Thứ Tư, Thứ Sáu
      dtstart: "2025-02-19T14:00:00",
      until: "2025-05-19T23:59:59",
    },
    color: "#ff8c00",
  },

  // Cuộc họp vào thứ Hai đầu tiên của mỗi tháng, kéo dài 6 tháng
  {
    id: "8",
    title: "Cuộc họp lãnh đạo",
    rrule: {
      freq: "monthly",
      bysetpos: 1, // Lấy tuần đầu tiên
      byweekday: "mo", // Thứ Hai
      dtstart: "2025-02-03T09:00:00",
      count: 6, // Lặp lại 6 lần
    },
    color: "#4682b4",
  },

  // Báo cáo cuối quý (tháng 3, 6, 9, 12)
  {
    id: "9",
    title: "Báo cáo cuối quý",
    rrule: {
      freq: "yearly",
      bymonth: [3, 6, 9, 12], // Chỉ diễn ra vào các tháng này
      bymonthday: 30, // Ngày 30
      dtstart: "2025-03-30T10:00:00",
      count: 8, // 8 lần (2 năm)
    },
    color: "#a52a2a",
  },

  // Họp hàng tuần vào thứ Ba, kéo dài 5 tuần
  {
    id: "10",
    title: "Họp phân tích dự án",
    rrule: {
      freq: "weekly",
      byweekday: "tu", // Chỉ vào thứ Ba
      dtstart: "2025-02-20T11:00:00",
      count: 5,
    },
    color: "#ff1493",
  },

  // Nhắc nhở tập thể dục mỗi sáng thứ Bảy, kéo dài 1 năm
  {
    id: "11",
    title: "Tập thể dục buổi sáng",
    rrule: {
      freq: "weekly",
      byweekday: "sa", // Thứ Bảy
      dtstart: "2025-02-22T06:30:00",
      until: "2026-02-22T23:59:59",
    },
    color: "#20b2aa",
  },

  // Kiểm tra định kỳ vào ngày 10 & 25 hàng tháng
  {
    id: "12",
    title: "Kiểm tra hệ thống",
    rrule: {
      freq: "monthly",
      bymonthday: [10, 25], // Ngày 10 và 25 hàng tháng
      dtstart: "2025-02-10T08:00:00",
      count: 12, // Lặp lại 12 lần
    },
    color: "#ff69b4",
  },
]);

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

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin],
  initialView: "timeGridWeek",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  },
  height: 720,
  // calendarWeekends: false, // Mặc định một ngày
  // calendaring: "true", // Chương trình đăng ký
  // businessHours: true, // Thời gian lớp học
  editable: true,
  selectable: true,
  events: events,

  // Lắng nghe sự kiện khi click vào ngày
  dateClick: (info) => {
    console.log("Ngày được click:", info.dateStr);
    handleDateClick(info);
    // mở modal tạo sự kiện
  },

  // Lắng nghe sự kiện khi click vào một sự kiện
  eventClick: (info) => {
    console.log("Sự kiện được click:", info.event);
    handleEventClick(info);
  },

  // Lắng nghe sự kiện khi kéo thả sự kiện
  eventDrop: (info) => {
    console.log("Sự kiện bị di chuyển:", info.event);
  },

  // Lắng nghe sự kiện khi thay đổi kích thước sự kiện
  eventResize: (info) => {
    console.log("Sự kiện bị thay đổi kích thước:", info.event);
  },

  // Lắng nghe sự kiện khi chọn một khoảng thời gian
  select: (info) => {
    console.log("Khoảng thời gian được chọn:", info.startStr, " - ", info.endStr);
  },
});
</script>

<template>
  <div>
    <a-button type="primary" @click="showModal = true" style="margin-top: 10px">
      Thêm Sự Kiện
    </a-button>

    <FullCalendar :key="calendarKey" :options="calendarOptions" />

    <EventModal
      :visible="isModalVisible"
      :event="selectedEvent"
      @save="saveEvent"
      @cancel="handleCancel"
    />
  </div>
</template>

