import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class GoogleCalendarService {
  constructor() {
    this.isAuthenticated = false;
  }

  // Kiểm tra xác thực
  checkAuth() {
    const googleToken = localStorage.getItem('google_token');
    this.isAuthenticated = !!googleToken;
    return this.isAuthenticated;
  }

  // Lấy danh sách calendar của người dùng
  async getCalendarList() {
    if (!this.checkAuth()) {
      throw new Error('Chưa đăng nhập với Google');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/google/calendars`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Google-Token': localStorage.getItem('google_token')
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw error;
    }
  }

  // Lấy sự kiện từ calendar
  async getEvents(calendarId, timeMin, timeMax) {
    if (!this.checkAuth()) {
      throw new Error('Chưa đăng nhập với Google');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/google/events`, {
        params: {
          calendarId,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString()
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Google-Token': localStorage.getItem('google_token')
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Đồng bộ sự kiện với backend
  async syncEvents(events) {
    if (!this.checkAuth()) {
      throw new Error('Chưa đăng nhập với Google');
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/google/sync-events`,
        { events },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Google-Token': localStorage.getItem('google_token')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error syncing events:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái đồng bộ
  async checkSyncStatus() {
    if (!this.checkAuth()) {
      throw new Error('Chưa đăng nhập với Google');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/google/sync-status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Google-Token': localStorage.getItem('google_token')
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking sync status:', error);
      throw error;
    }
  }
}

export default new GoogleCalendarService(); 