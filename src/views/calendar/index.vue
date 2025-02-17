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



const router = useRouter();
const calendarKey = ref(0);
const events = ref([
  // Sự kiện một lần
  { id: "1", title: "Họp nhóm", start: "2025-02-20T10:00:00", color: "#1e90ff" },

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
const eventData = ref({ title: "", start: "", color: "#3788d8", recurrence: "none" });
const isEditing = ref(false);

const handleDateClick = (info) => {
  eventData.value = { title: "", start: info.dateStr, color: "#3788d8", recurrence: "none" };
  isEditing.value = false;
  showModal.value = true;
};

const handleEventClick = (info) => {
  eventData.value = { id: info.event.id, title: info.event.title, start: info.event.startStr, color: info.event.backgroundColor, recurrence: "none" };
  isEditing.value = true;
  showModal.value = true;
};

const saveEvent = () => {
  let newEvent = { ...eventData.value, id: String(events.value.length + 1) };
  if (eventData.value.recurrence !== "none") {
    newEvent.rrule = {
      freq: eventData.value.recurrence,
      dtstart: eventData.value.start,
      count: 10,
    };
    delete newEvent.start;
  }
  if (isEditing.value) {
    const index = events.value.findIndex(e => e.id === eventData.value.id);
    if (index !== -1) events.value[index] = newEvent;
  } else {
    events.value.push(newEvent);
  }
  showModal.value = false;
};

const handleDeleteEvent = (eventId) => {
  events.value = events.value.filter(e => e.id !== eventId);
};

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, rrulePlugin],
  initialView: "timeGridWeek",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
  },
  height: 720,
  // calendarWeekends: false, // Mặc định một ngày
  // calendaring: "true", // Chương trình đăng ký
  // businessHours: true, // Thời gian lớp học
  editable: true,
  selectable: true,
  events: events,
  dateClick: handleDateClick,
  eventClick: handleEventClick,
});
</script>

<template>
  <div>
    <FullCalendar :key="calendarKey" :options="calendarOptions" />
  </div>
</template>
