<template>
  <div class="flex">
    <EventSidebar :events="events" @update:events="updateCalendarEvents" />
    <FullCalendar ref="calendarRef" :options="calendarOptions" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

// ... other imports and code ...

const calendarRef = ref(null);
const events = ref([]);
const displayedEvents = ref([]);

const updateCalendarEvents = (filteredEvents) => {
  console.log("Filtered events:", filteredEvents);
  displayedEvents.value = filteredEvents;

  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi();
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(filteredEvents);
  }
};

const calendarOptions = computed(() => ({
  events: displayedEvents.value,
}));

const fetchEvents = async () => {
  try {
    const response = await axios.get(`${dirApi}schedules`);
    if (response.data.code === 200) {
      events.value = response.data.data;
      displayedEvents.value = [...events.value];

      if (calendarRef.value) {
        const calendarApi = calendarRef.value.getApi();
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(displayedEvents.value);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải sự kiện:", error);
  }
};

onMounted(() => {
  fetchEvents();
});
</script>
