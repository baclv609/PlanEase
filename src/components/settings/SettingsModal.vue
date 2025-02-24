<template>
  <a-modal
    :open="isModalOpen"
    title="Cài đặt lịch trình"
    width="650px"
    @ok="handleSave"
    @cancel="emit('update:isModalOpen', false)"
  >
    <a-tabs :activeKey="activeTab" @change="(key) => (activeTab = key)">
      <template #rightExtra>
        <a-button type="primary" danger @click="resetSettings">Reset</a-button>
      </template>

      <!-- Cài đặt giao diện -->
      <a-tab-pane key="display" tab="Giao diện">
        <a-form layout="vertical">
          <a-form-item label="Chế độ hiển thị">
            <a-select v-model:value="settings.displayMode">
              <a-select-option value="dayGridMonth">Tháng</a-select-option>
              <a-select-option value="timeGridWeek">Tuần</a-select-option>
              <a-select-option value="timeGridDay">Ngày</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Hiển thị số tuần">
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

          <!-- Hiển thị múi giờ đã chọn -->
          <p>
            🌍 Múi giờ hiện tại: <strong>{{ selectedTimeZone }}</strong>
          </p>
          <a-form-item label="Định dạng giờ">
            <a-select v-model:value="settings.timeFormat">
              <a-select-option value="24h">24h</a-select-option>
              <a-select-option value="12h">12h</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <!-- Cài đặt lịch -->
      <a-tab-pane key="calendar" tab="Lịch">
        <a-form layout="vertical">
          <a-form-item label="Định dạng tiêu đề lịch">
            <a-select v-model:value="settings.titleFormat" @change="updateFullCalendar">
              <a-select-option :value="{ year: 'numeric', month: 'long' }">
                Tháng Năm (VD: Tháng 2 2025)
              </a-select-option>
              <a-select-option :value="{ year: 'numeric', month: 'short' }">
                Tháng viết tắt + Năm (VD: Feb 2025)
              </a-select-option>
              <a-select-option :value="{ year: 'numeric', month: '2-digit' }">
                Năm/Tháng số (VD: 2025/02)
              </a-select-option>
            </a-select>
          </a-form-item>


          <a-form-item label="Định dạng ngày trong cột">
            <a-select v-model:value="settings.columnHeaderFormat" @change="updateFullCalendar">
              <a-select-option :value="{ weekday: 'short', day: 'numeric', omitCommas: true }">
                Thứ viết tắt + Ngày (VD: T2, 24)
              </a-select-option>
              <a-select-option :value="{ weekday: 'long', day: 'numeric' }">
                Thứ + Ngày (VD: Thứ Hai, 24)
              </a-select-option>
              <a-select-option :value="{ day: 'numeric', month: 'short' }">
                Ngày + Tháng (VD: 24 Thg 2)
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
          <a-form-item label="Hiển thị nhiều tháng">
            <a-switch v-model:checked="settings.multiMonthYear" />
          </a-form-item>

          <!-- Chọn tháng hiển thị -->
          <a-form-item v-if="settings.multiMonthYear" label="Chọn tháng hiển thị">
            <a-select
              v-model:value="settings.selectedMonths"
              mode="multiple"
              placeholder="Chọn tháng..."
              :options="monthOptions"
            />
          </a-form-item>
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

// Mảng định dạng tiêu đề lịch
const titleFormatOptions = ref([
  { label: "Tháng Năm (VD: Tháng 2 2025)", value: { year: "numeric", month: "long" } },
  {
    label: "Tháng viết tắt + Năm (VD: Feb 2025)",
    value: { year: "numeric", month: "short" },
  },
  { label: "Năm/Tháng số (VD: 2025/02)", value: { year: "numeric", month: "2-digit" } },
]);

// Mảng định dạng ngày trong cột
const columnHeaderFormatOptions = ref([
  { label: "Thứ + Ngày (VD: Thứ Hai, 24)", value: { weekday: "long", day: "numeric" } },
  {
    label: "Thứ viết tắt + Ngày (VD: T2, 24)",
    value: { weekday: "short", day: "numeric" },
  },
  { label: "Ngày + Tháng (VD: 24 Thg 2)", value: { day: "numeric", month: "short" } },
]);

// Mảng định dạng ngày tháng
const dateFormatOptions = ref([
  { label: "YYYY-MM-DD (VD: 2025-02-24)", value: "YYYY-MM-DD" },
  { label: "DD/MM/YYYY (VD: 24/02/2025)", value: "DD/MM/YYYY" },
  { label: "MM-DD-YYYY (VD: 02-24-2025)", value: "MM-DD-YYYY" },
]);

// Mảng định dạng giờ trong sự kiện
const eventTimeFormatOptions = ref([
  {
    label: "24h (VD: 14:30)",
    value: { hour: "2-digit", minute: "2-digit", meridiem: false },
  },
  {
    label: "12h AM/PM (VD: 02:30 PM)",
    value: { hour: "2-digit", minute: "2-digit", hour12: true },
  },
]);

// Hàm cập nhật FullCalendar khi thay đổi cài đặt
const updateFullCalendar = () => {
  settingsStore.updateFullCalendar();
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

console.log("Múi giờ hiện tại:", moment.tz.guess()); // Xác định múi giờ máy tính
console.log(
  "Giờ hiện tại theo GMT+7:",
  moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss Z")
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

// Hủy bỏ cài đặt
// Reset các giá trị cài đặt về ban đầu và đóng modal
const handleCancel = () => {
  // Xóa các giá trị đã thay đổi
  settingsStore.$reset();

  // Đóng modal
  emit("update:isModalOpen", false);
};

// Reset về mặc định
const resetSettings = () => {
  settingsStore.$reset();
};
</script>
