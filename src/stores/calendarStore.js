import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useCalendarEvents } from "@/composables/useCalendarEvents";
import dayjs from "dayjs";
import { DateTime } from "luxon"; 

export const useCalendarStore = defineStore("calendar", () => {
  const { formattedEvents, fetchEvents } = useCalendarEvents();

  const storeEvents = ref([]);
  const selectedEvent = ref(null);
  const selectedEventAdd = ref(null);

  const isAddEventModalVisible = ref(false);
  const isEventDetailModalVisible = ref(false);
  const selectedTimezone = ref("UTC"); // Múi giờ mặc định

  const loadEvents = async () => {
    await fetchEvents();
    storeEvents.value = formattedEvents.value ? [...formattedEvents.value] : [];
    updateEventTimes(); 
  };

  const addEventStore = (event) => {
    if (Array.isArray(event)) {
      storeEvents.value = [...storeEvents.value, ...event];
    } else {
      storeEvents.value.push(event);
    }
    updateEventTimes();
  };

  const updateEvent = (updatedEvent) => {
    const index = storeEvents.value.findIndex((e) => e.id === updatedEvent.id);
    if (index !== -1) {
      storeEvents.value[index] = updatedEvent;
    }
  };

  const deleteEvent = (eventId) => {
    storeEvents.value = storeEvents.value.filter((e) => e.id !== eventId);
  };

  const getEventsByDate = (date) => {
    console.log("🔎 Tìm sự kiện cho ngày:", date);
    console.log("📅 Tất cả sự kiện:", storeEvents.value);
  
    return storeEvents.value.filter((event) => {
      const eventStart = dayjs(event.start).format("YYYY-MM-DD");
      console.log(`🕒 Kiểm tra: ${event.title} | ${eventStart}`);
      return eventStart === date;
    });
  };
  
  const updateEventTimes = () => {
    storeEvents.value = storeEvents.value.map((event) => {
      const start = event.start ? DateTime.fromISO(event.start, { zone: 'utc' }).setZone(selectedTimezone.value).toISO() : null;
      const end = event.end ? DateTime.fromISO(event.end, { zone: 'utc' }).setZone(selectedTimezone.value).toISO() : null;

      return {
        ...event,
        start,
        end,
      };
    });
  };
  const updateTimezone = (newTimezone) => {
    selectedTimezone.value = newTimezone;
    updateEventTimes(); // Cập nhật thời gian khi thay đổi múi giờ
  };
  return {
    storeEvents,
    selectedEvent,
    selectedEventAdd,
    isAddEventModalVisible,
    isEventDetailModalVisible,
    loadEvents,
    addEventStore,
    updateEvent,
    deleteEvent,
    getEventsByDate,
    updateEventTimes,
    updateTimezone
  };
});
