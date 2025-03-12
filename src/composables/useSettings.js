import { useSettingsStore } from "@/stores/settingsStore";
import moment from "moment-timezone";

export const useSettings = () => {
    const settingsStore = useSettingsStore(); 

    const initSettings = () => {
        const savedSettings = JSON.parse(localStorage.getItem("userSettings"));

        if (savedSettings) {
            settingsStore.$patch(savedSettings);
        } else {
            const defaultSettings = {
                timeZone: moment.tz.guess(),
                timeFormat: new Intl.DateTimeFormat(navigator.language, { hour: "numeric" })
                    .resolvedOptions().hourCycle.includes("h12") ? "12h" : "24h",
                language: navigator.language.startsWith("vi") ? "vi" : "en",
                themeMode: "light",
                firstDay: 1,
            };

            settingsStore.$patch(defaultSettings);
            localStorage.setItem("userSettings", JSON.stringify(defaultSettings));
        }
    };

    const getUserTimezone = () => {
        return settingsStore.timeZone; // Hoặc giá trị mặc định nếu cần
    };

    return { initSettings, getUserTimezone }; // Xuất khẩu cả hai hàm
};