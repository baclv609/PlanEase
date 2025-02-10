<template>
    <div>
      <h2>{{ isEditMode ? 'Chỉnh sửa sự kiện' : 'Tạo mới sự kiện' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="eventName">Tên sự kiện:</label>
          <input type="text" v-model="eventName" id="eventName" />
        </div>
        <div>
          <label for="startDate">Ngày bắt đầu:</label>
          <input type="date" v-model="startDate" id="startDate" />
        </div>
        <div>
          <label for="recurrenceType">Tần suất lặp lại:</label>
          <select v-model="recurrenceType" id="recurrenceType">
            <option value="none">Không lặp lại</option>
            <option value="daily">Hàng ngày</option>
            <option value="weekly">Hàng tuần</option>
            <option value="monthly">Hàng tháng</option>
          </select>
        </div>
  
        <!-- Lặp lại theo tuần -->
        <div v-if="recurrenceType === 'weekly'">
          <label>Chọn ngày trong tuần:</label>
          <input type="checkbox" v-model="weekDays.monday" /> Thứ Hai
          <input type="checkbox" v-model="weekDays.tuesday" /> Thứ Ba
          <input type="checkbox" v-model="weekDays.wednesday" /> Thứ Tư
          <input type="checkbox" v-model="weekDays.thursday" /> Thứ Năm
          <input type="checkbox" v-model="weekDays.friday" /> Thứ Sáu
          <input type="checkbox" v-model="weekDays.saturday" /> Thứ Bảy
          <input type="checkbox" v-model="weekDays.sunday" /> Chủ Nhật
        </div>
  
        <!-- Lặp lại theo tháng -->
        <div v-if="recurrenceType === 'monthly'">
          <label>Chọn ngày trong tháng:</label>
          <input type="checkbox" v-model="monthDays.day1" /> Ngày 1
          <input type="checkbox" v-model="monthDays.day15" /> Ngày 15
          <input type="checkbox" v-model="monthDays.day30" /> Ngày 30
        </div>
  
        <button type="submit">{{ isEditMode ? 'Cập nhật sự kiện' : 'Tạo sự kiện' }}</button>
      </form>
      <button v-if="isEditMode" @click="deleteEvent">Xóa sự kiện</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  // Tạo các biến state sử dụng ref
  const eventId = ref(null); // ID sự kiện cần chỉnh sửa
  const eventName = ref('');
  const startDate = ref('');
  const recurrenceType = ref('none');
  const weekDays = ref({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const monthDays = ref({
    day1: false,
    day15: false,
    day30: false,
  });
  const isEditMode = ref(false);
  
  // Hàm xử lý khi người dùng gửi form
  const handleSubmit = async () => {
    const eventData = {
      eventId: eventId.value,
      eventName: eventName.value,
      startDate: startDate.value,
      recurrenceType: recurrenceType.value,
      weekDays: weekDays.value,
      monthDays: monthDays.value,
    };
  
    try {
      const url = isEditMode.value
        ? `http://localhost:3000/api/events/update/${eventId.value}`
        : 'http://localhost:3000/api/events/create';
      const method = isEditMode.value ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
  
      const data = await response.json();
      alert(isEditMode.value ? 'Sự kiện đã được cập nhật' : 'Sự kiện đã được tạo mới');
    } catch (error) {
      console.error('Có lỗi xảy ra:', error);
    }
  };
  
  // Hàm lấy dữ liệu sự kiện khi ở chế độ chỉnh sửa
  onMounted(() => {
    const eventIdFromParams = window.location.pathname.split('/').pop(); // Giả sử URL chứa ID sự kiện
    if (eventIdFromParams) {
      eventId.value = eventIdFromParams;
      isEditMode.value = true;
      fetchEventDetails(eventId.value);
    }
  });
  
  // Lấy thông tin chi tiết sự kiện để sửa
  const fetchEventDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/${id}`);
      const data = await response.json();
      eventName.value = data.name;
      startDate.value = data.start_date;
      recurrenceType.value = data.recurrence_type;
      weekDays.value = JSON.parse(data.week_days);
      monthDays.value = JSON.parse(data.month_days);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sự kiện:', error);
    }
  };
  
  // Xóa sự kiện
  const deleteEvent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/events/delete/${eventId.value}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      alert('Sự kiện đã được xóa');
      window.location.href = '/'; // Điều hướng về trang chính
    } catch (error) {
      console.error('Có lỗi khi xóa sự kiện:', error);
    }
  };
  </script>
  
  <style scoped>
  /* CSS cho giao diện */
  form {
    max-width: 400px;
    margin: 20px auto;
  }
  input, select {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
  }
  button {
    background-color: #4CAF50;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
  }
  </style>
  