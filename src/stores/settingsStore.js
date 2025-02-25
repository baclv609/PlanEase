import { defineStore } from "pinia";
import { useSettings } from "@/composables/useSettings";
import { useI18n } from "vue-i18n";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    // 🖥 Cài đặt giao diện
    displayMode: "dayGridMonth",
    showWeekNumbers: false,
    themeMode: "light",

    // Cài đặt thời gian
    timeZone: "Asia/Ho_Chi_Minh",
    timeFormat: "24h",
    slotDuration: "00:30:00",
    language: localStorage.getItem("appLanguage") || "vi",

    // Cài đặt lịch
    titleFormat: { year: "numeric", month: "long" }, // Định dạng tiêu đề lịch
    dayHeaderFormat: { weekday: "long", day: "numeric" }, // Định dạng ngày trong cột
    dateFormat: "YYYY-MM-DD", // Mặc định hiển thị theo chuẩn YYYY-MM-DD
    eventTimeFormat: { hour: "2-digit", minute: "2-digit", meridiem: false }, // Định dạng ngày trong sự kiện
    initialDate: new Date().toISOString().split("T")[0], // Ngày bắt đầu
    firstDay: 1, // Ngày đầu tuần (0 = Chủ nhật, 1 = Thứ hai)
    multiMonthYear: false, // Hiển thị nhiều tháng

    // validRange: { start: "2025-01-01", end: "2025-12-31" }, // Giới hạn ngày

    // Thông báo & Nhắc nhở
    enableNotifications: true,
    reminderTime: "10m",

    // Sự kiện lặp lại
    enableRecurringEvents: true,
    defaultRecurrence: "none",

    calendarRef: null, // Lưu tham chiếu đến FullCalendar
  }),

  actions: {
    updateSetting(key, value) {
      this[key] = value;
      this.saveToLocalStorage(); // Luôn lưu lại khi cập nhật
      this.updateFullCalendar();
    },

    updateTimeFormat(newValue) {
      // Chuyển đổi từ chuỗi JSON sang object
      const parsedValue = JSON.parse(newValue);
    
      // Cập nhật định dạng thời gian
      this.eventTimeFormat = parsedValue;
    
      // Lưu vào localStorage
      this.saveToLocalStorage();
    
      // Cập nhật FullCalendar
      this.updateFullCalendar();
    },
    
    toggleTimeFormat() {
      this.timeFormat = this.timeFormat === "24h" ? "12h" : "24h";  
      this.saveToLocalStorage();
      this.updateFullCalendar();
    },    
    saveToLocalStorage() {
      const settingsToSave = {
        timeZone: this.timeZone,
        timeFormat: this.timeFormat,
        language: this.language,
        themeMode: this.themeMode,
        firstDay: this.firstDay,
      };
      localStorage.setItem("userSettings", JSON.stringify(settingsToSave));
    },
    changeLanguage(newLang) {
      this.language = newLang;
      localStorage.setItem(
        "userSettings",
        JSON.stringify({ language: newLang })
      );

      const { locale } = useI18n();
      locale.value = newLang; // Cập nhật Vue I18n
    },
    // Cập nhật cài đặt lịch
    updateColumnHeaderFormat(newValue) {
      this.dayHeaderFormat = newValue;
      this.updateFullCalendar();
    },
    // Định dạng tiêu đề lịch
    updateTitleFormat(newValue) {
      this.titleFormat = newValue;
      this.updateFullCalendar();
    },
    loadFromLocalStorage() {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        this.$patch(JSON.parse(savedSettings));
      }
    },
    setCalendarRef(ref) {
      this.calendarRef = ref;
    },
    
    updateFullCalendar() {
      if (this.calendarRef) {
        this.calendarRef.getApi().refetchEvents();
      }
    },
    updateDisplayMode(newMode) {
      this.displayMode = newMode;
    },
  },
});
