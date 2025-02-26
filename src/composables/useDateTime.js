export function useDateTime() {

    const timeZoneOffset = savedSettings.timeZoneOffset ?? -new Date().getTimezoneOffset() / 60;
    
 
    const convertToUTCISO = (datetime, timezoneOffset) => {
        const localDate = new Date(datetime.replace(" ", "T"));
        const utcDate = new Date(localDate.getTime() - timezoneOffset * 60 * 60 * 1000);
        return utcDate.toISOString();
    };

    const convertToUTCTimestamp = (datetime, timezoneOffset) => {
        const localDate = new Date(datetime.replace(" ", "T"));
        const utcDate = new Date(localDate.getTime() - timezoneOffset * 60 * 60 * 1000);
        return utcDate.getTime(); // Trả về timestamp (milliseconds)
    };

    return {
        convertToUTCISO,
        convertToUTCTimestamp
    };
}
