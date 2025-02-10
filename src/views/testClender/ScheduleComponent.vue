<template>
  <div>
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

    <div v-if="showAddEventModal">
      <form @submit.prevent="addEvent">
        <label for="title">Title:</label>
        <input type="text" v-model="newEvent.title" required />

        <label for="start_date">Start Date:</label>
        <input type="datetime-local" v-model="newEvent.start_date" required />

        <label for="end_date">End Date:</label>
        <input type="datetime-local" v-model="newEvent.end_date" required />

        <label for="recurrence_type">Recurrence Type:</label>
        <select v-model="newEvent.recurrence_type">
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <div v-if="newEvent.recurrence_type === 'weekly'">
          <label>Week Days:</label>
          <input type="checkbox" v-model="newEvent.week_days" value="monday" />
          Monday
          <input
            type="checkbox"
            v-model="newEvent.week_days"
            value="wednesday"
          />
          Wednesday
        </div>

        <button type="submit">Add Event</button>
      </form>
    </div>
  </div>
</template>

<script setup>
// Import các thành phần cần thiết
import { ref, onMounted } from "vue";
import { Qalendar } from "qalendar";
import axios from "axios";
// import { on } from "events";

// const events = ref([
//   {
//     id: 1,
//     title: "Daily Standup",
//     start_date: "2025-02-01T02:00:00.000Z",
//     end_date: "2025-02-01T02:30:00.000Z",
//     recurrence_type: "daily",
//     recurrence_rule: "[]",
//     recurrence_end_date: "2025-02-28T17:00:00.000Z",
//     occurrences: null,
//     created_at: "2025-02-05T16:43:21.000Z",
//   },
//   {
//     id: 2,
//     title: "Weekly Meeting",
//     start_date: "2025-02-03T03:00:00.000Z",
//     end_date: "2025-02-03T04:00:00.000Z",
//     recurrence_type: "weekly",
//     recurrence_rule: '["monday", "wednesday"]',
//     recurrence_end_date: "2025-05-31T17:00:00.000Z",
//     occurrences: null,
//     created_at: "2025-02-05T16:49:35.000Z",
//   },
//   {
//     id: 3,
//     title: "Monthly Review",
//     start_date: "2025-02-15T02:00:00.000Z",
//     end_date: "2025-02-15T03:00:00.000Z",
//     recurrence_type: "monthly",
//     recurrence_rule: "[15]",
//     recurrence_end_date: "2025-12-30T17:00:00.000Z",
//     occurrences: null,
//     created_at: "2025-02-05T16:49:54.000Z",
//   },
//   {
//     id: 4,
//     title: "New Year Celebration",
//     start_date: "2024-12-31T17:00:00.000Z",
//     end_date: "2024-12-31T18:00:00.000Z",
//     recurrence_type: "yearly",
//     recurrence_rule: "[1]",
//     recurrence_end_date: null,
//     occurrences: null,
//     created_at: "2025-02-05T16:58:14.000Z",
//   },
// ]);

// const events = ref([
//   // Các sự kiện hiện có
//   {
//     title: "Meeting with Dora",
//     with: "Albert Einstein",
//     time: { start: "2022-01-01 04:52", end: "2022-01-01 05:37" },
//     color: "green",
//     isEditable: true,
//     id: "de471c78cb5c",
//     recurrence_type: "weekly", // Loại lặp lại (daily, weekly, monthly)
//     week_days: ["monday", "wednesday"], // Các ngày trong tuần lặp lại
//     description:
//       "Think of me as Yoda. Only instead of being little and green, I wear suites and I'm awesome.",
//   },
//   // Các sự kiện khác ...
// ]);

// const events = ref([]);

const selectedDate = ref(new Date());
const showAddEventModal = ref(false);
const newEvent = ref({
  title: "",
  start_date: "",
  recurrence_type: "none",
  week_days: [],
});

const addEvent = async () => {
  try {
    // Gửi yêu cầu tạo sự kiện mới đến backend
    const response = await axios.post("/api/events", {
      ...newEvent.value,
      start_date: new Date(newEvent.value.start_date).toISOString(),
      end_date: new Date(newEvent.value.end_date).toISOString(),
    });
    // Thêm sự kiện vào mảng events trên frontend
    events.value.push({
      ...response.data.event,
      start_date: new Date(response.data.event.start_date), // Chuyển đổi start_date và end_date thành đối tượng Date
      end_date: new Date(response.data.event.end_date),
    });
    showAddEventModal.value = false; // Đóng modal sau khi thêm sự kiện
  } catch (error) {
    console.error("Error adding event:", error);
  }
};
onMounted(async () => {
  // console.log("events.value", events.value);
  // await fetchEvents();
  const response = await axios.get("http://localhost:3001/api/events");
  console.log("response.data.events", response.data.events);

  events.value = [];

  response.data.events.forEach((event) => {
      const updatedEvent = {
        ...event,
        color: "green",
        isEditable: true,
        with: "Albert Einstein",
        //description: "Think of me as Yoda. Only instead of being little and green, I wear suits and I'm awesome.",
        type: event.recurrence_type ? "timed" : "full-day",  // Thêm type nếu không có
      };

      console.log("updatedEvent", updatedEvent);

      // Kiểm tra sự kiện có lặp lại hay không
      if (event.recurrence_type !== "none") {
        let recurrenceDates = generateRecurrenceDates(event);
        console.log("Generated Recurrence Dates:", recurrenceDates);

        recurrenceDates.forEach((date) => {
          events.value.push({
            ...updatedEvent,
            time: {
              start: new Date(date.start).toISOString(),
              end: new Date(date.end).toISOString(),
            },
            start_date: new Date(date.start),
            end_date: new Date(date.end),
          });
        });
      } else {
        events.value.push({
          ...updatedEvent,
          time: {
            start: new Date(event.start_date).toISOString(),
            end: new Date(event.end_date).toISOString(),
          },
          start_date: new Date(event.start_date),
          end_date: new Date(event.end_date),
        });
      }
    });
});
// Fetch events from API when component is mounted
// const fetchEvents = async () => {
//   try {
//     const response = await axios.get("http://localhost:3001/api/events");
//     console.log("response.data.events", response.data.events);
//     events2.value = response.data.events;
//     console.log(events2);

//     // Đảm bảo rằng events.value là một mảng các sự kiện có cấu trúc phù hợp với Qalendar
//     events.value = [];

//     response.data.events.forEach((event) => {
//       // Kiểm tra loại lặp lại của sự kiện
//       if (event.recurrence_type !== "none") {
//         let recurrenceDates = generateRecurrenceDates(event); // Hàm tạo các ngày lặp lại
//         recurrenceDates.forEach((date) => {
//           events.value.push({
//             ...event,
//             time: {
//               start: new Date(date.start).toISOString(),
//               end: new Date(date.end).toISOString(),
//             },
//             start_date: new Date(date.start),
//             end_date: new Date(date.end),

//           });
//         });
//       } else {
//         events.value.push({
//           ...event,
//           time: {
//             start: new Date(event.start_date).toISOString(),
//             end: new Date(event.end_date).toISOString(),
//           },
//           start_date: new Date(event.start_date),
//           end_date: new Date(event.end_date),
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching events:", error);
//   }
// };

// const fetchEvents = async () => {
//   try {
//     const response = await axios.get("http://localhost:3001/api/events");
//     console.log("response.data.events", response.data.events);

//     // events.value = [];

//     response.data.events.forEach((event) => {
//       const updatedEvent = {
//         ...event,
//         color: "green",
//         isEditable: true,
//         with: "Albert Einstein",
//         description: "Think of me as Yoda. Only instead of being little and green, I wear suits and I'm awesome.",
//         type: event.recurrence_type ? "timed" : "full-day",  // Thêm type nếu không có
//       };

//       console.log("updatedEvent", updatedEvent);

//       // Kiểm tra sự kiện có lặp lại hay không
//       if (event.recurrence_type !== "none") {
//         let recurrenceDates = generateRecurrenceDates(event);
//         console.log("Generated Recurrence Dates:", recurrenceDates);

//         recurrenceDates.forEach((date) => {
//           events.value.push({
//             ...updatedEvent,
//             time: {
//               start: new Date(date.start).toISOString(),
//               end: new Date(date.end).toISOString(),
//             },
//             start_date: new Date(date.start),
//             end_date: new Date(date.end),
//           });
//         });
//       } else {
//         events.value.push({
//           ...updatedEvent,
//           time: {
//             start: new Date(event.start_date).toISOString(),
//             end: new Date(event.end_date).toISOString(),
//           },
//           start_date: new Date(event.start_date),
//           end_date: new Date(event.end_date),
//         });
//       }
//     });

//     console.log("Final events:", events.value);  // In ra sự kiện sau khi đã thêm lặp lại và các trường mới
//   } catch (error) {
//     console.error("Error fetching events:", error);
//   }
// };

// Hàm để tính toán các ngày lặp lại dựa trên recurrence_type
const generateRecurrenceDates = (event) => {
  let dates = [];
  let startDate = new Date(event.start_date);
  let endDate = new Date(event.recurrence_end_date);

  switch (event.recurrence_type) {
    case "daily":
      while (startDate <= endDate) {
        dates.push({
          start: new Date(startDate),
          end: new Date(
            startDate.setMinutes(
              startDate.getMinutes() +
                (new Date(event.end_date) - new Date(event.start_date)) / 60000
            )
          ),
        });
        startDate.setDate(startDate.getDate() + 1); // Tiến một ngày
      }
      break;
    case "weekly":
      // Lặp lại hàng tuần
      let weekDays = JSON.parse(event.recurrence_rule || "[]"); // Lấy danh sách ngày trong tuần
      while (startDate <= endDate) {
        if (
          weekDays.includes(
            startDate.toLocaleString("en-us", { weekday: "long" }).toLowerCase()
          )
        ) {
          dates.push({
            start: new Date(startDate),
            end: new Date(
              startDate.setMinutes(
                startDate.getMinutes() +
                  (new Date(event.end_date) - new Date(event.start_date)) /
                    60000
              )
            ),
          });
        }
        startDate.setDate(startDate.getDate() + 1);
      }
      break;
    case "monthly":
      // Lặp lại hàng tháng
      let dayOfMonth = JSON.parse(event.recurrence_rule || "[]")[0];
      while (startDate <= endDate) {
        if (startDate.getDate() === dayOfMonth) {
          dates.push({
            start: new Date(startDate),
            end: new Date(
              startDate.setMinutes(
                startDate.getMinutes() +
                  (new Date(event.end_date) - new Date(event.start_date)) /
                    60000
              )
            ),
          });
        }
        startDate.setMonth(startDate.getMonth() + 1);
      }
      break;
    case "yearly":
      // Lặp lại hàng năm
      let monthDay = JSON.parse(event.recurrence_rule || "[]")[0];
      while (startDate <= endDate) {
        if (startDate.getDate() === monthDay) {
          dates.push({
            start: new Date(startDate),
            end: new Date(
              startDate.setMinutes(
                startDate.getMinutes() +
                  (new Date(event.end_date) - new Date(event.start_date)) /
                    60000
              )
            ),
          });
        }
        startDate.setFullYear(startDate.getFullYear() + 1);
      }
      break;
    default:
      break;
  }
  return dates;
};

// Xử lý khi nhấp vào một sự kiện
const handleEventClick = (event) => {
  console.log("Sự kiện đã nhấp vào:", event);
  // Hiển thị chi tiết hoặc chỉnh sửa sự kiện
};

// Xử lý khi sự kiện bị kéo
const handleEventDragged = async (event) => {
  console.log("Sự kiện đã bị kéo:", event);
  try {
    await axios.put(`/api/events/${event.id}`, {
      ...event, // Thêm các thay đổi thời gian
      start_date: event.start_date.toISOString(),
      end_date: event.end_date.toISOString(),
    });
    // Cập nhật lại sự kiện trên frontend
    const index = events.value.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      events.value[index] = event;
    }
  } catch (error) {
    console.error("Error updating event:", error);
  }
};

// Xử lý khi sự kiện bị thay đổi kích thước
const handleEventResized = async (event) => {
  console.log("Sự kiện đã thay đổi kích thước:", event);
  try {
    await axios.put(`/api/events/${event.id}`, {
      ...event, // Thêm các thay đổi thời gian
      start_date: event.start_date.toISOString(),
      end_date: event.end_date.toISOString(),
    });
    // Cập nhật lại sự kiện trên frontend
    const index = events.value.findIndex((e) => e.id === event.id);
    if (index !== -1) {
      events.value[index] = event;
    }
  } catch (error) {
    console.error("Error updating event:", error);
  }
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
  // Call API to delete event
  axios.delete(`/api/events/${event.id}`).then(() => {
    events.value = events.value.filter((e) => e.id !== event.id);
  });
};
// Xử lý khi người dùng nhấp vào một ngày giờ trong chế độ tuần
const handleDatetimeClick = (datetime) => {
  console.log("Ngày giờ đã nhấp vào:", datetime);
  // Xử lý ngày giờ người dùng chọn
};

// Xử lý khi người dùng nhấp vào một ngày trong chế độ tháng
const handleDateClick = (date) => {
  console.log("Ngày đã nhấp vào:", date);
  selectedDate.value = date;
  showAddEventModal.value = true;
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
