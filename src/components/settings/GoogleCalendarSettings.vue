<template>
  <div class="google-calendar-settings">
    <a-card title="Đồng bộ Google Calendar" :bordered="false">
      <template #extra>
        <a-switch
          v-model:checked="autoSync"
          :disabled="!isConnected"
          @change="handleAutoSyncChange"
        />
      </template>

      <!-- Trạng thái kết nối -->
      <div class="connection-status">
        <div class="status-header">
          <span class="status-label">Trạng thái:</span>
          <a-tag :color="isConnected ? 'success' : 'default'">
            {{ isConnected ? 'Đã kết nối' : 'Chưa kết nối' }}
          </a-tag>
        </div>

        <div class="action-buttons">
          <a-button
            v-if="!isConnected"
            type="primary"
            @click="handleConnect"
            :loading="loading"
          >
            <template #icon><GoogleOutlined /></template>
            Kết nối với Google Calendar
          </a-button>
          <a-button
            v-else
            danger
            @click="handleDisconnect"
            :loading="loading"
          >
            Ngắt kết nối
          </a-button>
        </div>
      </div>

      <!-- Danh sách calendar -->
      <div v-if="isConnected" class="calendar-list">
        <div class="section-title">Chọn lịch cần đồng bộ:</div>
        <a-checkbox-group
          v-model:value="selectedCalendars"
          @change="handleCalendarSelection"
        >
          <div v-for="calendar in calendars" :key="calendar.id" class="calendar-item">
            <a-checkbox :value="calendar.id">
              <div class="calendar-info">
                <div class="calendar-name">{{ calendar.summary }}</div>
                <div class="calendar-description">{{ calendar.description }}</div>
              </div>
            </a-checkbox>
          </div>
        </a-checkbox-group>
      </div>

      <!-- Cài đặt đồng bộ -->
      <div v-if="isConnected" class="sync-settings">
        <div class="section-title">Tùy chọn đồng bộ:</div>
        
        <a-form layout="vertical">
          <a-form-item label="Tần suất đồng bộ">
            <a-select
              v-model:value="syncInterval"
              @change="handleSyncIntervalChange"
            >
              <a-select-option value="15">15 phút</a-select-option>
              <a-select-option value="30">30 phút</a-select-option>
              <a-select-option value="60">1 giờ</a-select-option>
              <a-select-option value="360">6 giờ</a-select-option>
              <a-select-option value="720">12 giờ</a-select-option>
              <a-select-option value="1440">24 giờ</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Phạm vi đồng bộ">
            <a-select
              v-model:value="syncRange"
              @change="handleSyncRangeChange"
            >
              <a-select-option value="7">7 ngày</a-select-option>
              <a-select-option value="14">14 ngày</a-select-option>
              <a-select-option value="30">30 ngày</a-select-option>
              <a-select-option value="90">90 ngày</a-select-option>
              <a-select-option value="180">6 tháng</a-select-option>
              <a-select-option value="365">1 năm</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item>
            <a-checkbox
              v-model:checked="includeHolidays"
              @change="handleHolidaysChange"
            >
              Đồng bộ ngày lễ từ Google Calendar
            </a-checkbox>
          </a-form-item>
        </a-form>

        <div class="sync-actions">
          <a-button
            type="primary"
            @click="handleManualSync"
            :loading="syncing"
          >
            <template #icon><SyncOutlined /></template>
            Đồng bộ ngay
          </a-button>
          <span v-if="lastSync" class="last-sync">
            Lần đồng bộ cuối: {{ formatLastSync(lastSync) }}
          </span>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { GoogleOutlined, SyncOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import googleCalendarService from '@/services/googleCalendarService';
import { useSettingsStore } from '@/stores/settingsStore';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const settingsStore = useSettingsStore();

// States
const isConnected = ref(false);
const loading = ref(false);
const syncing = ref(false);
const autoSync = ref(false);
const calendars = ref([]);
const selectedCalendars = ref([]);
const syncInterval = ref('60');
const syncRange = ref('30');
const includeHolidays = ref(true);
const lastSync = ref(null);

// Methods
const initialize = async () => {
  loading.value = true;
  try {
    await googleCalendarService.initializeGoogleApi();
    isConnected.value = googleCalendarService.isAuthenticated;
    if (isConnected.value) {
      await loadCalendars();
      await loadSyncStatus();
    }
  } catch (error) {
    console.error('Error initializing Google Calendar:', error);
    message.error('Không thể kết nối với Google Calendar');
  } finally {
    loading.value = false;
  }
};

const loadCalendars = async () => {
  try {
    calendars.value = await googleCalendarService.getCalendarList();
    const status = await googleCalendarService.checkSyncStatus();
    selectedCalendars.value = status.selectedCalendars || [];
    autoSync.value = status.autoSync || false;
    syncInterval.value = status.syncInterval || '60';
    syncRange.value = status.syncRange || '30';
    includeHolidays.value = status.includeHolidays !== false;
    lastSync.value = status.lastSync;
  } catch (error) {
    console.error('Error loading calendars:', error);
    message.error('Không thể tải danh sách lịch');
  }
};

const loadSyncStatus = async () => {
  try {
    const status = await googleCalendarService.checkSyncStatus();
    autoSync.value = status.autoSync || false;
    lastSync.value = status.lastSync;
  } catch (error) {
    console.error('Error loading sync status:', error);
  }
};

const handleConnect = async () => {
  loading.value = true;
  try {
    // Sử dụng token Google hiện có từ localStorage
    const googleToken = localStorage.getItem('google_token');
    if (!googleToken) {
      throw new Error('Chưa đăng nhập với Google');
    }
    
    await googleCalendarService.initializeGoogleApi();
    googleCalendarService.setToken(googleToken);
    isConnected.value = true;
    await loadCalendars();
    message.success('Kết nối Google Calendar thành công');
  } catch (error) {
    console.error('Error connecting to Google Calendar:', error);
    message.error('Không thể kết nối với Google Calendar. Vui lòng đăng nhập lại với Google.');
  } finally {
    loading.value = false;
  }
};

const handleDisconnect = async () => {
  loading.value = true;
  try {
    googleCalendarService.clearToken();
    isConnected.value = false;
    calendars.value = [];
    selectedCalendars.value = [];
    message.success('Đã ngắt kết nối Google Calendar');
  } catch (error) {
    console.error('Error disconnecting from Google Calendar:', error);
    message.error('Không thể ngắt kết nối Google Calendar');
  } finally {
    loading.value = false;
  }
};

const handleCalendarSelection = async (selected) => {
  try {
    await settingsStore.updateGoogleCalendarSettings({
      selectedCalendars: selected
    });
    message.success('Đã cập nhật lựa chọn lịch');
  } catch (error) {
    console.error('Error updating calendar selection:', error);
    message.error('Không thể cập nhật lựa chọn lịch');
  }
};

const handleAutoSyncChange = async (checked) => {
  try {
    await settingsStore.updateGoogleCalendarSettings({
      autoSync: checked
    });
    message.success(`Đã ${checked ? 'bật' : 'tắt'} đồng bộ tự động`);
  } catch (error) {
    console.error('Error updating auto sync:', error);
    message.error('Không thể cập nhật cài đặt đồng bộ tự động');
  }
};

const handleSyncIntervalChange = async (value) => {
  try {
    await settingsStore.updateGoogleCalendarSettings({
      syncInterval: value
    });
    message.success('Đã cập nhật tần suất đồng bộ');
  } catch (error) {
    console.error('Error updating sync interval:', error);
    message.error('Không thể cập nhật tần suất đồng bộ');
  }
};

const handleSyncRangeChange = async (value) => {
  try {
    await settingsStore.updateGoogleCalendarSettings({
      syncRange: value
    });
    message.success('Đã cập nhật phạm vi đồng bộ');
  } catch (error) {
    console.error('Error updating sync range:', error);
    message.error('Không thể cập nhật phạm vi đồng bộ');
  }
};

const handleHolidaysChange = async (e) => {
  try {
    await settingsStore.updateGoogleCalendarSettings({
      includeHolidays: e.target.checked
    });
    message.success(`Đã ${e.target.checked ? 'bật' : 'tắt'} đồng bộ ngày lễ`);
  } catch (error) {
    console.error('Error updating holidays sync:', error);
    message.error('Không thể cập nhật cài đặt đồng bộ ngày lễ');
  }
};

const handleManualSync = async () => {
  if (!selectedCalendars.value.length) {
    message.warning('Vui lòng chọn ít nhất một lịch để đồng bộ');
    return;
  }

  syncing.value = true;
  try {
    const now = dayjs();
    const timeMin = now.subtract(1, 'day');
    const timeMax = now.add(Number(syncRange.value), 'day');

    for (const calendarId of selectedCalendars.value) {
      const events = await googleCalendarService.getEvents(calendarId, timeMin, timeMax);
      await googleCalendarService.syncEvents(events);
    }

    lastSync.value = new Date().toISOString();
    message.success('Đồng bộ thành công');
  } catch (error) {
    console.error('Error syncing events:', error);
    message.error('Không thể đồng bộ sự kiện');
  } finally {
    syncing.value = false;
  }
};

const formatLastSync = (date) => {
  return dayjs(date).fromNow();
};

// Lifecycle hooks
onMounted(initialize);
</script>

<style scoped>
.google-calendar-settings {
  max-width: 800px;
  margin: 0 auto;
}

.connection-status {
  margin-bottom: 24px;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-label {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.calendar-list {
  margin-top: 24px;
}

.section-title {
  font-weight: 500;
  margin-bottom: 16px;
}

.calendar-item {
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  background-color: #fafafa;
}

.calendar-info {
  margin-left: 8px;
}

.calendar-name {
  font-weight: 500;
}

.calendar-description {
  font-size: 12px;
  color: #666;
}

.sync-settings {
  margin-top: 24px;
}

.sync-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.last-sync {
  color: #666;
  font-size: 13px;
}
</style> 