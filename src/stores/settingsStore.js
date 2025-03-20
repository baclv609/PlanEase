import { defineStore } from "pinia";
import { useSettings } from "@/composables/useSettings";
import { useI18n } from "vue-i18n";
import moment from "moment-timezone";
import { watchEffect } from "vue";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    // 🖥 Cài đặt giao diện
    displayMode: localStorage.getItem("displayMode") || "dayGridMonth", // Lưu chế độ xem vào localStorage
    showWeekNumbers: false,
    themeMode: "light",

    // Cài đặt thời gian
    timeZone: "Asia/Saigon",
    timeZoneOffset: moment.tz("Asia/Saigon").utcOffset() / 60, 
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

    googleCalendar: {
      selectedCalendars: [],
      autoSync: false,
      syncInterval: '60',
      syncRange: '30',
      includeHolidays: true,
      lastSync: null
    }
  }),

  actions: {
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
        displayMode: this.displayMode,
        showWeekNumbers: this.showWeekNumbers,
        themeMode: this.themeMode,
        timeZone: this.timeZone,
        timeZoneOffset: moment.tz(this.timeZone).utcOffset() / 60, // Lưu offset múi giờ
        timeFormat: this.timeFormat,
        language: this.language,
        firstDay: this.firstDay,
        enableNotifications: this.enableNotifications,
        enableRecurringEvents: this.enableRecurringEvents,
        reminderTime: this.reminderTime,
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
      const savedSettings = JSON.parse(localStorage.getItem("userSettings"));
      if (savedSettings) {
        Object.assign(this, savedSettings);
      }
    },
    setCalendarRef(ref) {
      this.calendarRef = ref;
    },
    
    updateFullCalendar() {
      if (this.calendarRef && this.calendarRef.getApi) {
        this.calendarRef.getApi().refetchEvents();
      } else {
        console.warn("calendarRef is not available when calling updateFullCalendar");
      }
    },
    updateDisplayMode(newMode) {
      this.displayMode = newMode;
      localStorage.setItem("displayMode", newMode); 
    },

    updateSetting(key, value) {
      this[key] = value;
      this.saveToLocalStorage(); // Luôn lưu lại khi cập nhật
      this.updateFullCalendar();
    },

    async updateGoogleCalendarSettings(settings) {
      this.googleCalendar = {
        ...this.googleCalendar,
        ...settings
      };

      // Here you can add API call to save settings to backend
      try {
        // Example API call:
        // await api.post('/settings/google-calendar', this.googleCalendar);
      } catch (error) {
        console.error('Error saving Google Calendar settings:', error);
        throw error;
      }
    },

    async loadGoogleCalendarSettings() {
      try {
        // Example API call:
        // const response = await api.get('/settings/google-calendar');
        // this.googleCalendar = response.data;
      } catch (error) {
        console.error('Error loading Google Calendar settings:', error);
        throw error;
      }
    }
  },
});

// watchEffect(() => {
//   const settingsStore = useSettingsStore();
//   settingsStore.saveToLocalStorage();
// });