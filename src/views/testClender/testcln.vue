<template>
    <Qalendar
       :style="{ height: '600px' }"
      :selected-date="new Date(2022, 0, 8)"
      :events="events"
      :config="config"
      @event-was-dragged="handleEventDragged"
      @event-was-clicked="handleEventClick"
      @event-was-resized="handleEventResized"
      @interval-was-clicked="handleIntervalClick"
      @updated-period="handleUpdatedPeriod"
      @updated-mode="handleUpdatedMode"
      @edit-event="handleEditEvent"
      @delete-event="handleDeleteEvent"
      @datetime-was-clicked="handleDatetimeClick"
      @date-was-clicked="handleDateClick"
    />
  </template>
  
  <script setup>
  // Import các thành phần cần thiết
  import { ref } from "vue";
  import { Qalendar } from "qalendar";
  
  const events = ref([
    // Các sự kiện hiện có
    {
      title: "Meeting with Dora",
      with: "Albert Einstein",
      time: { start: "2022-01-01 04:52", end: "2022-01-01 05:37" },
      color: "green",
      isEditable: true,
      id: "de471c78cb5c",
      recurrence_type: "weekly", // Loại lặp lại (daily, weekly, monthly)
      week_days: ["monday", "wednesday"], // Các ngày trong tuần lặp lại
      description: "Think of me as Yoda. Only instead of being little and green, I wear suites and I'm awesome.",
    },
    // Các sự kiện khác ...
  ]);
  
  
  // Xử lý khi nhấp vào một sự kiện
  const handleEventClick = (event) => {
    console.log("Sự kiện đã nhấp vào:", event);
    // Hiển thị chi tiết hoặc chỉnh sửa sự kiện
  };
  
  // Xử lý khi sự kiện bị kéo
  const handleEventDragged = (event) => {
    console.log("Sự kiện đã bị kéo:", event);
    // Cập nhật sự kiện với thời gian mới
  };
  
  // Xử lý khi sự kiện bị thay đổi kích thước
  const handleEventResized = (event) => {
    console.log("Sự kiện đã thay đổi kích thước:", event);
    // Cập nhật sự kiện với thời gian mới
  };
  
  // Xử lý khi người dùng nhấp vào một khoảng thời gian
  const handleIntervalClick = (interval) => {
    console.log("Khoảng thời gian đã nhấp vào:", interval);
    // Xử lý khoảng thời gian người dùng chọn
  };
  
  // Xử lý khi người dùng thay đổi khoảng thời gian trong trình chọn ngày
  const handleUpdatedPeriod = (period) => {
    console.log("Khoảng thời gian mới được chọn:", period);
    // Cập nhật khoảng thời gian đã chọn
  };
  
  // Xử lý khi người dùng thay đổi chế độ xem lịch
  const handleUpdatedMode = (mode, period) => {
    console.log("Chế độ mới:", mode);
    console.log("Khoảng thời gian của chế độ mới:", period);
    // Cập nhật chế độ xem lịch và khoảng thời gian
  };
  
  // Xử lý khi người dùng nhấp vào biểu tượng chỉnh sửa sự kiện
  const handleEditEvent = (event) => {
    console.log("Sự kiện chỉnh sửa:", event);
    // Mở form chỉnh sửa sự kiện
  };
  
  // Xử lý khi người dùng nhấp vào biểu tượng xóa sự kiện
  const handleDeleteEvent = (event) => {
    console.log("Sự kiện xóa:", event);
    // Xóa sự kiện khỏi danh sách
  };
  
  // Xử lý khi người dùng nhấp vào một ngày giờ trong chế độ tuần
  const handleDatetimeClick = (datetime) => {
    console.log("Ngày giờ đã nhấp vào:", datetime);
    // Xử lý ngày giờ người dùng chọn
  };
  
  // Xử lý khi người dùng nhấp vào một ngày trong chế độ tháng
  const handleDateClick = (date) => {
    console.log("Ngày đã nhấp vào:", date);
    // Xử lý ngày người dùng chọn
  };
  
  // Cấu hình lịch
  const config = ref({
    locale: "vi", // Cấu hình ngôn ngữ
    defaultMode: "month", // Chế độ mặc định khi mở lịch
    style: {
      colorSchemes: {
        meetings: {
          color: "#fff", // Màu chữ
          backgroundColor: "#131313", // Màu nền
          // height
        },
        sports: {
          color: "#fff",
          backgroundColor: "#ff4081",
        },
      },
    },
    dayIntervals: {
      length: 15, // Độ dài của mỗi khoảng thời gian (phút)
      height: 60, // Chiều cao mỗi ô (pixel)
      displayClickableInterval: true,
    },
  });
  </script>
  
  <style>
  @import "qalendar/dist/style.css"; /* Import style mặc định của Qalendar */
  
  /* Ví dụ tùy chỉnh giao diện cho sự kiện */
  .qalendar-event {
    background-color: #ffcc00 !important; /* Màu vàng cho sự kiện */
    color: black !important; /* Màu chữ đen */
  }
  
  /* Tùy chỉnh màu nền của lịch tháng */
  .qalendar-month {
    background-color: #f0f0f0; /* Màu nền sáng */
  }
  
  /* Điều chỉnh màu sắc của các nút điều hướng */
  .qalendar-btn-next,
  .qalendar-btn-prev {
    background-color: #007bff;
    color: white;
  }
  /* Định dạng cho các ô */
  .qalendar-interval {
    height: 60px; /* Chiều cao cho mỗi ô */
  }
  
  </style>
  