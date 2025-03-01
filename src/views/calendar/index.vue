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

const {
  calendarKey,
  calendarOptions,
  selectedEvent,
  selectedEventAdd,
  isAddEventModalVisible,
  isEventDetailModalVisible,
  handleDeleteEvent,
} = useCalendar(calendarRef);

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
};

const saveEvent = (eventData) => {
  // if (eventData.recurrence === "none") {
  //   eventData.start = dayjs(eventData.start).format("YYYY-MM-DDTHH:mm:ss");
  // } else {
  //   eventData.rrule = {
  //     freq: eventData.recurrence,
  //     dtstart: dayjs(eventData.start).format("YYYY-MM-DDTHH:mm:ss"),
  //     count: eventData.repeatCount,
  //   };
  //   delete eventData.start;
  // }

  // if (eventData.id) {
  //   // Chỉnh sửa sự kiện
  //   const index = events.value.findIndex((e) => e.id === eventData.id);
  //   if (index !== -1) events.value[index] = eventData;
  // } else {
  //   // Thêm sự kiện mới
  //   eventData.id = String(events.value.length + 1);
  //   events.value.push(eventData);
  // }

  isModalVisible.value = false;
};

// Đóng modal
const handleCancel = () => {
  isModalVisible.value = false;
};
</script>

<template>
  <div>
    <FullCalendar ref="calendarRef" :key="calendarKey" :options="calendarOptions" />

    <EventModal
      :visible="isAddEventModalVisible"
      :event="selectedEventAdd"
      @save="saveEvent"
      @cancelAddEventModalVisible="isAddEventModalVisible = false"
    />

    <EventDetailModal
      :visible="isEventDetailModalVisible"
      :event="selectedEvent"
      @closeEventDetailModalVisible="closeDetailModal"
      @delete="handleDeleteEvent"
    />
  </div>
</template>
