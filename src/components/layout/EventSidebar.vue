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

    <!-- Lịch của tôi -->
    <div class="mt-5">
      <div class="flex justify-between items-center">
        <h3 class="font-semibold">Lịch của tôi</h3>
        <PlusOutlined class="cursor-pointer text-blue-500 text-base" @click="openAddCalendarModal" />
      </div>
      <a-checkbox-group v-model:value="selectedCalendars" class="flex flex-col gap-2" @change="updateFilteredEvents">
        <div v-for="calendar in myCalendars" :key="calendar.id" class="flex items-center justify-between p-1 rounded-md"
          :style="{ borderLeft: `4px solid ${calendar.color}` }">
          <div class="flex items-center">
            <a-checkbox :value="calendar.id" class="ml-2">
              <span class="text-sm">{{ calendar.name }}</span>
            </a-checkbox>
          </div>
          <a-dropdown>
            <EllipsisOutlined class="cursor-pointer text-gray-500 text-base" />
            <template #overlay>
              <a-menu>
                <a-menu-item @click="displayOnly(calendar.id)">Hiển thị duy nhất</a-menu-item>
                <a-sub-menu title="Thay đổi màu sắc">
                  <a-menu-item v-for="color in availableColors" :key="color"
                    @click="changeCalendarColor(calendar.id, color)">
                    <span :style="{
                      backgroundColor: color,
                      display: 'inline-block',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                    }"></span>
                  </a-menu-item>
                </a-sub-menu>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-checkbox-group>
    </div>
  </a-card>

  <!-- Modal thêm mới lịch -->
  <a-modal v-model:open="isModalOpenAddTag" title="Thêm Mới Lịch" @ok="handleOk">
    <a-form layout="vertical">
      <a-form-item label="Tên lịch" required>
        <a-input v-model:value="newTagCalendar.name" placeholder="Nhập tên lịch" />
      </a-form-item>
      <a-form-item label="Màu sắc (Hex Code)" required>
        <input type="color" v-model="newTagCalendar.color" class="w-10 h-10 border rounded cursor-pointer" />
      </a-form-item>
      <a-form-item label="Mô tả">
        <a-textarea v-model:value="newTagCalendar.description" placeholder="Nhập mô tả lịch" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import {
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  EllipsisOutlined,
} from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";

const isModalOpenAddTag = ref(false);
const newTagCalendar = ref({ name: "", color: "#1890ff", description: "" });
const selectedDate = ref(dayjs());
const selectedCalendars = ref(["1", "3"]);
const router = useRouter();
const myCalendars = ref([
  { id: "1", name: "Văn Bắc Lê", color: "#3498db" },
  { id: "2", name: "Gia đình", color: "#9b59b6" },
  { id: "3", name: "Lịch mới", color: "#9b59b6" },
  { id: "4", name: "Sinh nhật", color: "#e67e22" },
]);

const availableColors = ref([
  "#3498db",
  "#9b59b6",
  "#e67e22",
  "#2ecc71",
  "#f1c40f",
  "#e74c3c",
]);

const events = ref([
  {
    id: "1",
    date: "04 Jan 2022",
    name: "World Braille Day",
    time: "5 am - 9 am",
    calendarId: "1",
    color: "#3498db",
  },
  {
    id: "2",
    date: "30 Jan 2022",
    name: "World Man Day",
    time: "5 am - 9 am",
    calendarId: "2",
    color: "#9b59b6",
  },
  {
    id: "3",
    date: "04 Jan 2022",
    name: "World Plants Day",
    time: "5 am - 10 am",
    calendarId: "3",
    color: "#e67e22",
  },
]);

const filteredEvents = ref([]);
const handleDateSelect = (date) => {
  const year = date.format("YYYY");
  const month = date.format("MM");
  const day = date.format("DD");

  console.log("Chuyển hướng tới:", `/calendar/day/${year}/${month}/${day}`);

  router.push(`/calendar/day/${year}/${month}/${day}`);
};
const updateFilteredEvents = () => {
  filteredEvents.value = events.value.filter((event) =>
    selectedCalendars.value.includes(event.calendarId)
  );
};

const openAddCalendarModal = () => {
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
  myCalendars.value.push({
    id: String(myCalendars.value.length + 1),
    name: newTagCalendar.value.name,
    color: newTagCalendar.value.color,
  });
  updateFilteredEvents();
  message.success(`Đã thêm lịch: ${newTagCalendar.value.name}`);
  isModalOpenAddTag.value = false;
  newTagCalendar.value = { name: "", color: "#1890ff", description: "" };
};

const changeCalendarColor = (calendarId, color) => {
  myCalendars.value = myCalendars.value.map((cal) =>
    cal.id === calendarId ? { ...cal, color: color } : cal
  );
  updateFilteredEvents();
};
</script>
