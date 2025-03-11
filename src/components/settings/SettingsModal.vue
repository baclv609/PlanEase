<template>
  <a-modal
    :open="isModalOpen"
    title="Cài đặt lịch trình"
    width="650px"
    @ok="handleSave"
    @cancel="emit('update:isModalOpen', false)"
    :footer=null
  >
    <a-tabs :activeKey="activeTab" @change="(key) => (activeTab = key)">

      <!-- Cài đặt giao diện -->
      <a-tab-pane key="display" tab="Giao diện">
        <a-form layout="vertical">
          <a-form-item label="Chế độ hiển thị">
            <a-select
              v-model:value="settings.displayMode"
              @change="changeView(settings.displayMode)"
            >
              <a-select-option value="dayGridMonth">Tháng</a-select-option>
              <a-select-option value="timeGridWeek">Tuần</a-select-option>
              <a-select-option value="timeGridDay">Ngày</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Hiển thị ngày nghỉ">
            <a-switch v-model:checked="settings.showWeekNumbers" />
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- Cài đặt thời gian -->
      <a-tab-pane key="time" tab="Thời gian">
        <a-form layout="vertical">
          <!-- Múi giờ -->
          <a-form-item label="Múi giờ">
            <a-select
              v-model:value="settings.timeZone"
              show-search
              placeholder="Chọn múi giờ..."
              :options="timeZoneOptions"
              :filter-option="filterTimeZones"
              @change="logTimeZone"
            />
          </a-form-item>

          <a-form-item label="Định dạng giờ">
            <!-- <a-select v-model:value="settings.timeFormat">
              <a-select-option value="24h">24h</a-select-option>
              <a-select-option value="12h">12h</a-select-option>
            </a-select> -->
            <a-select v-model:value="settings.timeFormat" @change="updateTimeFormat">
              <a-select-option
                v-for="option in timeFormatOptions"
                :key="option.label"
                :value="JSON.stringify(option.value)"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <!-- <a-button @click="settingsStore.toggleTimeFormat">
            Chuyển đổi định dạng giờ ({{ settings.timeFormat }})
          </a-button> -->
        </a-form>
      </a-tab-pane>

      <!-- Cài đặt lịch -->
      <a-tab-pane key="calendar" tab="Lịch">
        <a-form layout="vertical">
          <a-form-item label="Định dạng tiêu đề lịch">
            <a-select v-model:value="selectedTitleFormat" @change="updateTitleFormat">
              <a-select-option
                v-for="option in titleFormatOptions"
                :key="option.label"
                :value="JSON.stringify(option.value)"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Định dạng ngày trong cột">
            <a-select
              v-model:value="selectedDayHeaderFormat"
              @change="updateColumnHeaderFormat"
            >
              <a-select-option
                v-for="option in columnHeaderFormatOptions"
                :key="option.label"
                :value="JSON.stringify(option.value)"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Ngày bắt đầu tuần">
            <a-select v-model:value="settings.firstDay">
              <a-select-option :value="0">Chủ Nhật</a-select-option>
              <a-select-option :value="1">Thứ Hai</a-select-option>
              <a-select-option :value="6">Thứ Bảy</a-select-option>
            </a-select>
          </a-form-item>

          <!-- Hiển thị nhiều tháng -->
          <!-- <a-form-item label="Hiển thị nhiều tháng">
            <a-switch v-model:checked="settings.multiMonthYear" />
          </a-form-item>

          <a-form-item v-if="settings.multiMonthYear" label="Chọn tháng hiển thị">
            <a-select
              v-model:value="settings.selectedMonths"
              mode="multiple"
              placeholder="Chọn tháng..."
              :options="monthOptions"
            />
          </a-form-item> -->
        </a-form>
      </a-tab-pane>

      <!-- Ngôn ngữ -->
      <a-tab-pane key="language" :tab="$t('language')">
        <a-form layout="vertical">
          <a-form-item label="Ngôn ngữ">
            <a-select v-model:value="settings.language" @change="changeLanguage">
              <a-select-option value="vi">Tiếng Việt</a-select-option>
              <a-select-option value="en">English</a-select-option>
              <!-- <a-select-option value="fr">Français</a-select-option>
              <a-select-option value="ja">日本語</a-select-option> -->
            </a-select>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <div class="flex justify-end mt-4">
      <a-button type="primary" danger @click="resetSettings">Reset</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from "vue";
import { useSettingsStore } from "@/stores/settingsStore";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";

const { locale } = useI18n();
const props = defineProps({
  isModalOpen: Boolean,
});

const emit = defineEmits(["update:isModalOpen"]);

const settingsStore = useSettingsStore();
const settings = settingsStore.$state;

const activeTab = ref(settingsStore.activeKey || "display");

const columnHeaderFormatOptions = [
  {
    label: "Thứ viết tắt + Ngày (VD: T2, 24)",
    value: {
      weekday: "short",
      day: "numeric",
      omitCommas: true,
    },
  },
  {
    label: "Thứ + Ngày (VD: Thứ Hai, 24)",
    value: { weekday: "long", day: "numeric" },
  },
  {
    label: "Ngày + Tháng (VD: 24 Thg 2)",
    value: { day: "numeric", month: "short" },
  },
];

const titleFormatOptions = [
  {
    label: "Tháng Năm (VD: Tháng 2 2025)",
    value: { year: "numeric", month: "long" },
  },
  {
    label: "Tháng viết tắt + Năm (VD: Feb 2025)",
    value: { year: "numeric", month: "short" },
  },
  {
    label: "Năm/Tháng số (VD: 2025/02)",
    value: { year: "numeric", month: "2-digit" },
  },
];

const timeFormatOptions = [
  {
    label: "12 giờ (AM/PM)",
    value: { hour: "2-digit", minute: "2-digit", meridiem: "short", hour12: true },
  },
  {
    label: "24 giờ",
    value: { hour: "2-digit", minute: "2-digit", hour12: false },
  },
];

const selectedTitleFormat = ref(JSON.stringify(settings.titleFormat)); // Lưu dạng string JSON
const selectedDayHeaderFormat = ref(JSON.stringify(settings.dayHeaderFormat));

const updateTitleFormat = (newValue) => {
  settings.titleFormat = JSON.parse(newValue); 
  updateFullCalendar();
};

const updateTimeFormat = (newValue) => {
  // console.log("object", newValue);
  settingsStore.eventTimeFormat = newValue;
  updateFullCalendar();
};

const changeView = (view) => {
  if (settingsStore.calendarRef) {
    settingsStore.calendarRef.getApi().changeView(view);
    // updateCurrentDate();
    settingsStore.updateDisplayMode(view);
  } else {
    console.error("calendarRef is not available in changeView");
  }
};

// Hàm cập nhật FullCalendar khi thay đổi cài đặt
const updateFullCalendar = () => {
  settingsStore.updateFullCalendar();
};

const updateColumnHeaderFormat = (newValue) => {
  const parsedValue = JSON.parse(newValue); // Chuyển lại object từ JSON string
  settingsStore.dayHeaderFormat = parsedValue;
  settings.dayHeaderFormat = parsedValue;
};

const changeLanguage = (newLang) => {
  settingsStore.language = newLang; // Cập nhật state trong Pinia
  locale.value = newLang; // Cập nhật Vue I18n
  settingsStore.saveToLocalStorage(); // Lưu vào localStorage
};

// Danh sách tháng 1-12
const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: i + 1,
  }))
);

// Lấy danh sách múi giờ kèm theo GMT offset
const timeZoneOptions = computed(() => {
  return moment.tz.names().map((tz) => {
    const offset = moment.tz(tz).utcOffset() / 60; // Lấy offset theo giờ
    const offsetText = offset >= 0 ? `GMT+${offset}` : `GMT${offset}`;
    return {
      label: `${tz} (${offsetText})`,
      value: tz,
    };
  });
});

// Hiển thị múi giờ đã chọn với GMT offset
const selectedTimeZone = computed(() => {
  const tz = settings.timeZone || moment.tz.guess();
  const offset = moment.tz(tz).utcOffset() / 60;
  const offsetText = offset >= 0 ? `GMT+${offset}` : `GMT${offset}`;
  return `${tz} (${offsetText})`;
});

// Lọc múi giờ theo từ khóa tìm kiếm
const filterTimeZones = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

// Log giá trị múi giờ khi thay đổi
const logTimeZone = (value) => {
  console.log("🔍 Múi giờ được chọn:", value);
  console.log("🕒 Giờ GMT:", moment.tz(value).utcOffset() / 60);
};

// Lưu cài đặt
const handleSave = () => {
  settingsStore.saveToLocalStorage(); // Lưu lại vào localStorage
  settingsStore.updateFullCalendar(); // Cập nhật FullCalendar
  emit("update:isModalOpen", false);
};

// Reset các giá trị cài đặt về ban đầu và đóng modal
const handleCancel = () => {
  settingsStore.loadFromLocalStorage();
  // Đóng modal
  emit("update:isModalOpen", false);
};

// Reset về mặc định
const resetSettings = () => {
  settingsStore.$reset();
  settingsStore.updateFullCalendar();
};
</script>
