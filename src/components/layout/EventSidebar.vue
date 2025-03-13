<template>
  <a-card :bodyStyle="{ padding: '16px' }">
    <!-- Lịch -->
    <a-button type="primary" class="my-2" block @click="openAddCalendarModal">+ Tạo Sự Kiện Mới</a-button>

    <div class="calendar-section">
      <a-calendar v-model:value="selectedDate" :fullscreen="false" @select="handleDateSelect">
        <template #headerRender="{ value, onChange }">
          <div class="custom-header">
            <a-button type="text" @click="prevMonth(onChange, value)">
              <LeftOutlined />
            </a-button>
            <span class="header-title">
              {{ selectedDate.format("MMMM YYYY") }}
            </span>
            <a-button type="text" @click="nextMonth(onChange, value)">
              <RightOutlined />
            </a-button>
          </div>
        </template>
      </a-calendar>
    </div>

    <!-- Get Things Done -->
    <!-- <div class="mt-5">
      <h4>Get Things Done</h4>
      <a-list :data-source="tasks" bordered>
        <template #renderItem="{ item }">
          <a-list-item> <a-badge :color="item.color" /> {{ item.name }} </a-list-item>
        </template>
      </a-list>
    </div> -->

    <!-- Sự kiện sắp tới -->
    <div class="mt-5">
      <h2>Sự kiện sắp tới</h2>
      <p>Đừng bỏ lỡ các sự kiện đã lên lịch</p>
      <a-list :data-source="filteredEvents" bordered>
        <template #renderItem="{ item }">
          <a-list-item>
            <div class="w-full flex items-center justify-between">
              <a-badge :color="item.color" />
              <div class="event-details">
                <strong>{{ item.date }}</strong>
                <p>{{ item.name }}</p>
              </div>
              <a-tag :color="item.color">{{ item.time }}</a-tag>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- tags -->
    <div>
      <div class="flex justify-between items-center cursor-pointer" @click="toggleMyCalendars">
        <h3 class="font-semibold">Lịch của tôi

          
        </h3> 
        <div>
          <PlusOutlined class="cursor-pointer text-blue-500 text-base" @click.stop="addCalendar" />
          <CaretDownOutlined v-if="showMyCalendars" />
          <CaretRightOutlined v-else />
        </div>
      </div>
      <transition name="fade">
        <div v-if="showMyCalendars" class="mt-2">
          <a-checkbox-group v-model:value="selectedCalendars" class="flex flex-col gap-2">
            <div v-for="calendar in myCalendars" :key="calendar.id" 
              class="flex items-center p-1 rounded-md"
              :style="{ borderLeft: `4px solid ${calendar.color}` }"
            >
              <a-checkbox :value="calendar.id" class="ml-2">
                <span class="text-sm">{{ calendar.name }}</span>
              </a-checkbox>
            </div>
          </a-checkbox-group>
        </div>
      </transition>
    </div>


    <!-- Modal thêm mới lịch -->
    <a-modal v-model:open="isModalOpenAddTag" title="Thêm Mới Lịch" @ok="handleOk">
      <a-form layout="vertical">
        <!-- Nhập tên lịch -->
        <a-form-item label="Tên lịch" required>
          <a-input v-model:value="newTagCalendar.name" placeholder="Nhập tên lịch" />
        </a-form-item>

        <!-- Chọn màu sắc -->
        <a-form-item label="Màu sắc (Hex Code)" required>
          <!-- <a-input v-model:value="newTagCalendar.color" placeholder="#1890ff" /> -->
          <input type="color" v-model="newTagCalendar.color" class="w-10 h-10 border rounded cursor-pointer" />

        </a-form-item>
        <!-- Nhập mô tả -->
        <a-form-item label="Mô tả">
          <a-textarea v-model:value="newTagCalendar.description" placeholder="Nhập mô tả lịch" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup>
import { LeftOutlined, RightOutlined ,CaretDownOutlined, CaretRightOutlined, PlusOutlined} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";

const isModalOpenAddTag = ref(false);
const newTagCalendar = ref({ name: "", color: "#1890ff", description: "" });
const router = useRouter();

const selectedDate = ref(dayjs());

const showMyCalendars = ref(true);
const showOtherCalendars = ref(true);

const toggleMyCalendars = () => (showMyCalendars.value = !showMyCalendars.value);
const toggleOtherCalendars = () => (showOtherCalendars.value = !showOtherCalendars.value);

// Danh sách lịch
const selectedCalendars = ref(["1", "3"]);
const myCalendars = ref([
  { id: "1", name: "Văn Bắc Lê", color: "#3498db" },
  { id: "2", name: "Gia đình", color: "#9b59b6" },
  { id: "3", name: "Lịch mới", color: "#9b59b6" },
  { id: "4", name: "Sinh nhật", color: "#e67e22" },
]);

const otherCalendars = ref([
  { id: "7", name: "Ngày lễ ở Việt Nam", color: "#27ae60" },
]);

const addCalendar = () => {
  isModalOpenAddTag.value = true;
};

const displayOnly = (calendarId) => {
  selectedCalendars.value = [calendarId];
};
const handleOk = () => {
  if (!newTagCalendar.value.name) {
    message.error("Vui lòng nhập tên lịch!");
    return;
  }
  if (!/^#([0-9A-Fa-f]{6})$/.test(newTagCalendar.value.color)) {
    message.error("Mã màu không hợp lệ! Vui lòng nhập dạng #RRGGBB.");
    return;
  }
  message.success(`Đã thêm lịch: ${newTagCalendar.value.name}`);
  
console.log("newTagCalendar", newTagCalendar.value)

  // Reset form sau khi thêm
  isModalOpenAddTag.value = false;
  newTagCalendar.value = { name: "", color: "#1890ff", description: "" };
};

const changeCalendarColor = (calendarId, color) => {
  myCalendars.value = myCalendars.value.map(cal =>
    cal.id === calendarId ? { ...cal, color: color } : cal
  );
  updateFilteredEvents();
};
</script>

<style scoped>
.small-calendar {
  max-width: 250px !important;
  font-size: 14px;
}

.small-calendar .ant-picker-calendar-mini {
  padding: 8px;
}

.custom-header {
  font-size: 14px;
}

.event-details {
  flex-grow: 1;
  margin-left: 10px;
}
.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  font-size: 16px;
  font-weight: bold;
}

.header-title {
  text-transform: capitalize;
}

.sidebar-container {
  width: 280px;
}
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
