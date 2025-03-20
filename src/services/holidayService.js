import axios from 'axios';
import dayjs from 'dayjs';

// Danh sách các quốc gia được hỗ trợ
export const SUPPORTED_COUNTRIES = [
  { code: 'VN', name: 'Việt Nam' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
];

// Danh sách các ngày lễ cố định của Việt Nam
const VN_FIXED_HOLIDAYS = [
  { month: 1, day: 1, name: 'Tết Dương lịch', type: 'holiday' },
  { month: 4, day: 30, name: 'Ngày Giải phóng miền Nam', type: 'holiday' },
  { month: 5, day: 1, name: 'Ngày Quốc tế Lao động', type: 'holiday' },
  { month: 9, day: 2, name: 'Ngày Quốc khánh', type: 'holiday' },
];

// API key của Calendarific (thay thế bằng API key của bạn)
const CALENDARIFIC_API_KEY = import.meta.env.VITE_CALENDARIFIC_API_KEY;
const CALENDARIFIC_API_URL = 'https://calendarific.com/api/v2';

// Hàm lấy ngày lễ từ API Calendarific
const fetchPublicHolidays = async (year, countryCode) => {
  try {
    const response = await axios.get(`${CALENDARIFIC_API_URL}/holidays`, {
      params: {
        api_key: CALENDARIFIC_API_KEY,
        country: countryCode,
        year: year,
        type: 'national,local,religious'
      }
    });

    if (response.data.response && response.data.response.holidays) {
      return response.data.response.holidays.map(holiday => ({
        title: holiday.name,
        start: holiday.date.iso,
        end: holiday.date.iso,
        allDay: true,
        display: 'background',
        color: getHolidayColor(holiday.type),
        classNames: ['holiday-event', `holiday-type-${holiday.type}`],
        extendedProps: {
          type: holiday.type,
          isHoliday: true,
          countryCode: countryCode,
          description: holiday.description,
          locations: holiday.locations,
          states: holiday.states,
          holidayType: holiday.type,
          primaryType: holiday.primary_type
        }
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching holidays for ${countryCode}:`, error);
    return [];
  }
};

// Hàm lấy màu sắc cho từng loại ngày lễ
const getHolidayColor = (type) => {
  const colors = {
    national: '#ffccc7',    // Màu đỏ nhạt cho ngày lễ quốc gia
    local: '#d9f7be',       // Màu xanh lá nhạt cho ngày lễ địa phương
    religious: '#fff2e8',   // Màu cam nhạt cho ngày lễ tôn giáo
    default: '#f0f0f0'      // Màu xám nhạt cho các loại khác
  };
  return colors[type] || colors.default;
};

// Hàm lấy ngày lễ âm lịch từ API backend
const fetchLunarHolidays = async (year, countryCode) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/holidays/lunar`, {
      params: {
        year,
        country: countryCode
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (response.data.success) {
      return response.data.data.map(holiday => ({
        title: holiday.name,
        start: holiday.start_date,
        end: holiday.end_date || holiday.start_date,
        allDay: true,
        display: 'background',
        color: '#fff2e8',
        classNames: ['lunar-holiday-event'],
        extendedProps: {
          type: 'lunar',
          isHoliday: true,
          isLunar: true,
          countryCode: countryCode,
          description: holiday.description
        }
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error fetching lunar holidays for ${countryCode}:`, error);
    return [];
  }
};

// Hàm lấy tất cả các ngày lễ trong năm
export const getHolidays = async (year, countryCode = 'VN') => {
  try {
    // Lấy ngày lễ từ Calendarific API
    const publicHolidays = await fetchPublicHolidays(year, countryCode);
    
    // Lấy ngày lễ âm lịch nếu là quốc gia châu Á
    let lunarHolidays = [];
    if (['VN', 'CN', 'KR', 'JP'].includes(countryCode)) {
      lunarHolidays = await fetchLunarHolidays(year, countryCode);
    }

    // Kết hợp và sắp xếp các ngày lễ theo thời gian
    const allHolidays = [...publicHolidays, ...lunarHolidays];
    return allHolidays.sort((a, b) => dayjs(a.start).diff(dayjs(b.start)));
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return [];
  }
};

// Kiểm tra xem một ngày có phải là ngày lễ không
export const isHoliday = (date, holidays) => {
  return holidays.some(holiday => 
    dayjs(date).isBetween(holiday.start, holiday.end, 'day', '[]')
  );
};

// Lấy thông tin chi tiết về ngày lễ
export const getHolidayInfo = (date, holidays) => {
  return holidays.filter(holiday => 
    dayjs(date).isBetween(holiday.start, holiday.end, 'day', '[]')
  );
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class HolidayService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async fetchHolidays(startDate, endDate, country = 'VN') {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/holidays`, {
        params: {
          start: dayjs(startDate).format('YYYY-MM-DD'),
          end: dayjs(endDate).format('YYYY-MM-DD'),
          country
        },
        headers: {
          Authorization: `Bearer ${this.token || localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  }

  async syncGoogleHolidays(calendarId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/holidays/sync-google`,
        { calendarId },
        {
          headers: {
            Authorization: `Bearer ${this.token || localStorage.getItem('access_token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error syncing Google holidays:', error);
      throw error;
    }
  }

  // Lấy danh sách ngày nghỉ từ Google Calendar
  async getGoogleHolidays(timeMin, timeMax) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/holidays/google`, {
        params: {
          timeMin: dayjs(timeMin).format('YYYY-MM-DD'),
          timeMax: dayjs(timeMax).format('YYYY-MM-DD')
        },
        headers: {
          Authorization: `Bearer ${this.token || localStorage.getItem('access_token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Google holidays:', error);
      throw error;
    }
  }
}

export default new HolidayService(); 