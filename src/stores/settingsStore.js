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
    timeFormat: localStorage.getItem("timeFormat") || "24h",
    slotDuration: "00:30:00",
    language: localStorage.getItem("appLanguage") || "vi",

    // Cài đặt lịch
    titleFormat: { year: "numeric", month: "long" }, // Định dạng tiêu đề lịch
    dayHeaderFormat: { weekday: "long", day: "numeric" }, // Định dạng ngày trong cột
    dateFormat: "YYYY-MM-DD", // Mặc định hiển thị theo chuẩn YYYY-MM-DD
    eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false }, // Định dạng ngày trong sự kiện
    initialDate: new Date().toISOString().split("T")[0], // Ngày bắt đầu
    firstDay: 1, // Ngày đầu tuần (0 = Chủ nhật, 1 = Thứ hai)
    multiMonthYear: false, // Hiển thị nhiều tháng

    // validRange: { start: "2025-01-01", end: "2025-12-31" }, // Giới hạn ngày

    // Cài đặt hiển thị năm dạng lưới
    multiMonthMaxColumns: parseInt(localStorage.getItem("multiMonthMaxColumns")) || 3,
    showNonCurrentDates: localStorage.getItem("showNonCurrentDates") === "true",

    // Thông báo & Nhắc nhở
    enableNotifications: true,
    reminderTime: "10m",

    // Sự kiện lặp lại
    enableRecurringEvents: true,
    defaultRecurrence: "none",

    calendarRef: null, // Lưu tham chiếu đến FullCalendar

    // Cập nhật định dạng thời gian cho các cột
    columnHeaderFormat: {
      weekday: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    },
  }),

  actions: {
 
    updateTimeFormat(newValue) {
      console.log("Updating time format to:", newValue);
      this.timeFormat = newValue;
      
      // Cập nhật định dạng thời gian cho sự kiện
      this.eventTimeFormat = {
        hour: "2-digit",
        minute: "2-digit",
        meridiem: newValue === "12h" ? "short" : false,
        hour12: newValue === "12h"
      };

      // Cập nhật định dạng cho các cột
      this.columnHeaderFormat = {
        ...this.columnHeaderFormat,
        hour: "2-digit",
        minute: "2-digit",
        meridiem: newValue === "12h" ? "short" : false,
        hour12: newValue === "12h"
      };
      
      // Lưu vào localStorage
      localStorage.setItem("timeFormat", newValue);
      this.saveToLocalStorage();
      
      // Cập nhật FullCalendar nếu có
      if (this.calendarRef && this.calendarRef.getApi) {
        const calendarApi = this.calendarRef.getApi();
        
        // Cập nhật định dạng thời gian cho sự kiện
        calendarApi.setOption('eventTimeFormat', this.eventTimeFormat);
        
        // Cập nhật định dạng thời gian cho các khe thời gian
        calendarApi.setOption('slotLabelFormat', this.eventTimeFormat);
        
        // Buộc calendar refresh để áp dụng thay đổi
        calendarApi.refetchEvents();
      }
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
        timeZoneOffset: moment.tz(this.timeZone).utcOffset() / 60,
        timeFormat: this.timeFormat,
        eventTimeFormat: this.eventTimeFormat,
        titleFormat: this.titleFormat,
        dayHeaderFormat: this.dayHeaderFormat,
        language: this.language,
        firstDay: this.firstDay,
        enableNotifications: this.enableNotifications,
        enableRecurringEvents: this.enableRecurringEvents,
        reminderTime: this.reminderTime,

        multiMonthMaxColumns: this.multiMonthMaxColumns,
        showNonCurrentDates: this.showNonCurrentDates,
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
      console.log("Updating column header format:", newValue);
      this.dayHeaderFormat = newValue;
      
      // Cập nhật FullCalendar
      if (this.calendarRef && this.calendarRef.getApi) {
        const calendarApi = this.calendarRef.getApi();
        calendarApi.setOption('dayHeaderFormat', newValue);
        calendarApi.refetchEvents();
      }
      
      this.saveToLocalStorage();
    },
    // Định dạng tiêu đề lịch
    updateTitleFormat(newValue) {
      console.log("Updating title format:", newValue);
      this.titleFormat = newValue;
      
      // Cập nhật FullCalendar
      if (this.calendarRef && this.calendarRef.getApi) {
        const calendarApi = this.calendarRef.getApi();
        calendarApi.setOption('titleFormat', newValue);
        
        // Cập nhật lại view hiện tại
        const currentView = calendarApi.view.type;
        calendarApi.changeView(currentView);
        
        // Cập nhật lại sự kiện
        calendarApi.refetchEvents();
      }
      
      // Lưu vào localStorage
      const settingsToSave = {
        ...JSON.parse(localStorage.getItem("userSettings") || "{}"),
        titleFormat: newValue
      };
      localStorage.setItem("userSettings", JSON.stringify(settingsToSave));
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
  
    updateMultiMonthSettings(columns, showNonCurrent) {
      this.multiMonthMaxColumns = columns;
      this.showNonCurrentDates = showNonCurrent;
      localStorage.setItem("multiMonthMaxColumns", columns);
      localStorage.setItem("showNonCurrentDates", showNonCurrent);
      this.updateFullCalendar();
    },

  },
});

// watchEffect(() => {
//   const settingsStore = useSettingsStore();
//   settingsStore.saveToLocalStorage();
// });