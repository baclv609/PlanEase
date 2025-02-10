<template>
    <div>
      <!-- Nút để bật/tắt cuối tuần -->
      <button @click="toggleWeekends">Toggle Weekends</button>
      
      <!-- Nút để thêm sự kiện -->
      <button @click="addEvent">Add Event</button>
  
      <!-- Hiển thị lịch với các tùy chọn cấu hình -->
      <FullCalendar 
        :plugins="calendarOptions.plugins"
        :initial-view="calendarOptions.initialView"
        :weekends="calendarOptions.weekends"
        :header-toolbar="headerToolbar"
        :events="events"
        @event-click="handleEventClick"
        @event-drop="handleEventDrop"
      />
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import FullCalendar from '@fullcalendar/vue3';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import listPlugin from '@fullcalendar/list';  // Plugin list
  import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin timegrid nếu muốn sử dụng các chế độ xem như day/week
  
  export default {
    components: {
      FullCalendar,
    },
    setup() {
      // Các sự kiện được lưu trong mảng
      const events = ref([
        {
          title: "Meeting with Bob",
          start: "2025-02-01T10:00:00",
          end: "2025-02-01T12:00:00",
          id: "event1",
        },
        {
          title: "Project Deadline",
          start: "2025-02-05T09:00:00",
          end: "2025-02-05T10:00:00",
          id: "event2",
        },
        {
          title: "Lunch with Sarah",
          start: "2025-02-07T13:00:00",
          end: "2025-02-07T14:00:00",
          id: "event3",
        },
      ]);
  
      // Cấu hình các plugin FullCalendar
      const calendarOptions = ref({
        plugins: [dayGridPlugin, interactionPlugin, listPlugin, timeGridPlugin], // Đảm bảo tất cả plugin đều có mặt
        initialView: 'dayGridMonth',  // Chế độ xem mặc định
        weekends: false, // Mặc định không hiển thị cuối tuần
      });
  
      // Cấu hình thanh công cụ (Header Toolbar)
      const headerToolbar = ref({
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek', // Các chế độ xem khác, nếu có listWeek thì phải đảm bảo listPlugin được cài
      });
  
      // Thêm sự kiện vào lịch
      const addEvent = () => {
        const newEvent = {
          title: 'New Event',
          start: '2025-02-10T10:00:00',
          end: '2025-02-10T12:00:00',
          id: 'newEvent',
        };
        events.value.push(newEvent); // Thêm sự kiện vào mảng events
      };
  
      // Xử lý sự kiện khi nhấp vào sự kiện
      const handleEventClick = (info) => {
        alert(`Event clicked: ${info.event.title}`);
      };
  
      // Xử lý sự kiện kéo thả
      const handleEventDrop = (info) => {
        console.log(
          `Event dropped: ${info.event.title} from ${info.oldStart} to ${info.event.start}`
        );
      };
  
      // Toggle cuối tuần
      const toggleWeekends = () => {
        calendarOptions.value.weekends = !calendarOptions.value.weekends;
      };
  
      return {
        calendarOptions,
        headerToolbar,
        events,
        addEvent,
        handleEventClick,
        handleEventDrop,
        toggleWeekends,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Styling for buttons */
  button {
    margin: 10px;
  }
  </style>
  