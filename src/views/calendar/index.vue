<script setup>
import { ref, onMounted } from "vue";
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
import EventDetailModal from "./components/EventDetailsModal.vue";
import dayjs from "dayjs";

const settingsStore = useSettingsStore();
const calendarRef = ref(null);

// Trạng thái modal
// const isModalVisible = ref(false);
// const showModal = ref(false);
// const selectedEvent = ref(null);

const { calendarKey, calendarOptions, selectedEvent, isAddEventModalVisible,
  isEventDetailModalVisible, handleDeleteEvent } = useCalendar(calendarRef);

onMounted(() => {
  settingsStore.setCalendarRef(calendarRef.value);
});

const router = useRouter();

const eventData = ref({
  title: "",
  start: null, // Sửa "" -> null
  color: "#3788d8",
  recurrence: "none",
  repeatCount: 1,
  description: "",
});

const isEditing = ref(false);
// const isModalVisible = ref(false);

// Dữ liệu form sự kiện mới
const newEvent = ref({
  title: "",
  start: "",
  color: "#3788d8",
  recurrence: "none",
});

const closeDetailModal = () => {
  isEventDetailModalVisible.value = false;
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
  // showModal.value = false; // Đóng modal sau khi lưu
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

// Đóng modal
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
    <!-- <a-button type="primary" @click="showModal = true" style="margin-top: 10px">
      Thêm Sự Kiện
    </a-button> -->

    <FullCalendar ref="calendarRef" :key="calendarKey" :options="calendarOptions" />

    <EventModal :visible="isAddEventModalVisible" :event="selectedEvent" @save="saveEvent" @cancelAddEventModalVisible="isAddEventModalVisible = false" />

    <EventDetailModal :visible="isEventDetailModalVisible" :event="selectedEvent" @closeEventDetailModalVisible="closeDetailModal" @delete="handleDeleteEvent" />
  </div>
</template>
