<template>
    <a-drawer :open="visible" :rules="rules" :title="t('eventModalEdit.title')" placement="right" :width="drawerWidth"
        @close="handleClose" @update:open="(val) => emit('update:visible', val)" :destroyOnClose="true"
        :maskClosable="false">
        <template #extra>
            <div class="flex gap-2">
                <a-button type="primary" @click="handleSubmit" :loading="isLoading" class="px-6">{{ t('eventModal.save') }}</a-button>
            </div>
        </template>
        <a-form ref="formRef" layout="vertical" :model="formState" :required-mark="false" :rules="formRules" @submit.prevent="handleSubmit" class="event-form">
            <!-- Title Section -->
            <div class="form-section">
                <div class="section-title">
                    <EditOutlined class="text-gray-500 mr-2" />
                    <span>{{ t('eventModal.sections.title.label') }}</span><span class="text-red-500 ml-1">*</span>
                </div>
                <div class="flex items-center">
                    <div class="flex h-8 justify-center w-8 items-center mr-3">
                        <div :style="{ backgroundColor: formState.color_code, width: '12px', height: '12px', borderRadius: '50%' }"></div>
                    </div>
                    <a-input :placeholder="t('eventModal.sections.title.placeholder')"
                        class="bg-gray-50 rounded-lg w-full min-w-[200px]" 
                        v-model:value="formState.title" />
                </div>
            </div>

            <!-- Event Type Section -->
            <div class="form-section">
                <div class="section-title">
                    <TagOutlined class="text-gray-500 mr-2" />
                    <span>{{ t('eventModal.sections.eventType.label') }}</span>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <a-form-item name="type">
                        <template #label>
                            {{ t('eventModal.sections.eventType.type') }}
                        </template>
                        <Select v-model:value="formState.type" placeholder="Loại sự kiện" class="rounded-lg w-full" disabled>
                            <Select.Option value="event">{{ t('eventModal.sections.eventType.options.event') }}</Select.Option>
                            <Select.Option value="task">{{ t('eventModal.sections.eventType.options.task') }}</Select.Option>
                        </Select>
                    </a-form-item>
                    <a-form-item name="color_code">
                        <template #label>
                            {{ t('eventModal.sections.color.label') }}
                        </template>
                        <a-select v-model:value="formState.color_code" placeholder="Chọn màu" class="rounded-lg w-full">
                            <a-select-option v-for="color in colors" :key="color.value" :value="color.value">
                                <div class="flex items-center">
                                    <div class="h-4 rounded-full w-4 mr-2" :style="{ backgroundColor: color.value }"></div>
                                    <span>{{ t(`eventModal.sections.color.options.${color.label}`) }}</span>
                                </div>
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- Calendar Section -->
                    <a-form-item name="tags" class="w-full" v-if="formState.type == 'event'">
                        <template #label>
                            {{ t('eventModal.sections.eventType.tag') }}
                        </template>
                        <a-select v-model:value="formState.tags" class="bg-gray-50 rounded-lg w-full" placeholder="Chọn loại"
                            :options="tags"
                            :disabled="formState.user_id != user.id">
                            > </a-select>
                    </a-form-item>

                </div>
            </div>

            <!-- Date and Time Section -->
            <div class="form-section">
                <div class="section-title">
                    <CalendarOutlined class="text-gray-500 mr-2" />
                    <span>{{ t('eventModal.sections.dateTime.label') }}</span>
                </div>
                <div class="grid grid-cols-1 gap-3">
                    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <a-form-item name="start">
                            <template #label>
                                {{ t('eventModal.sections.dateTime.start') }}<span class="text-red-500 ml-1">*</span>
                            </template>
                            <DatePicker v-model:value="formState.start" 
                                :show-time="!formState.allDay"
                                :format="formState.allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                                class="w-full"
                                :disabled-time="formState.allDay ? () => ({
                                    disabledHours: () => Array.from({ length: 24 }, (_, i) => i),
                                    disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i),
                                    disabledSeconds: () => Array.from({ length: 60 }, (_, i) => i)
                                }) : undefined"
                                :allow-clear="false"
                                />
                        </a-form-item>
                        <a-form-item name="end">
                            <template #label>
                                {{ t('eventModal.sections.dateTime.end') }}<span class="text-red-500 ml-1">*</span>
                            </template>
                            <DatePicker v-model:value="formState.end" 
                                :show-time="!formState.allDay"
                                :format="formState.allDay ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'"
                                class="w-full"
                                :disabled-time="formState.allDay ? () => ({
                                    disabledHours: () => Array.from({ length: 24 }, (_, i) => i),
                                    disabledMinutes: () => Array.from({ length: 60 }, (_, i) => i),
                                    disabledSeconds: () => Array.from({ length: 60 }, (_, i) => i)
                                }) : undefined"
                                :allow-clear="false"
                                />
                        </a-form-item>
                    </div>
                    <a-form-item :label="t('eventModal.sections.dateTime.timezone')" name="timezone_code" v-if="formState.type == 'event'">
                        <a-select v-model:value="formState.timezone_code" show-search placeholder="Múi giờ"
                            :filter-option="filterOption" class="w-full">
                            <a-select-option v-for="timezone in timezones" :key="timezone" :value="timezone">
                                {{ timezone }} - {{ getGmtOffset(timezone) }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                    <div class="flex items-center">
                        <a-checkbox v-model:checked="formState.allDay">{{ t('eventModal.sections.dateTime.allDay') }}</a-checkbox>
                        <a-checkbox v-model:checked="formState.is_repeat" class="ml-6">{{ t('eventModal.sections.dateTime.repeat') }}</a-checkbox>
                    </div>
                </div>
            </div>

            <!-- Recurrence Section -->
            <template v-if="formState.is_repeat">
                <div class="form-section">
                    <div class="section-title">
                        <CalendarOutlined class="text-gray-500 mr-2" />
                        <span>{{ t('eventModal.sections.recurrence.label') }}</span>
                    </div>
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-7">
                        <div class="space-y-4 col-span-3">
                            <div>
                                <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.type') }}</label>
                                <Select v-model:value="formState.rrule.freq" :options="freqOptions" class="w-full" />
                            </div>

                            <div v-if="formState.rrule.freq === 'weekly'">
                                <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.weekDays.label') }}</label>
                                <Checkbox.Group v-model:value="formState.rrule.byweekday" :options="weekDays" 
                                    class="grid grid-cols-4 gap-2" />
                            </div>

                            <div v-if="formState.rrule.freq === 'monthly'">
                                <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.monthDays.label') }}</label>
                                <a-select v-model:value="formState.rrule.bymonthday" mode="multiple"
                                    :placeholder="t('eventModal.sections.recurrence.monthDays.placeholder')" class="w-full"
                                    :options="monthDays.map(day => ({ label: `Ngày ${day}`, value: day }))" />
                            </div>

                            <div>
                                <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.interval.label') }}</label>
                                <Input v-model:value="formState.rrule.interval" 
                                    type="number" 
                                    min="1"
                                    :max="999"
                                    @input="(e) => {
                                        const value = parseInt(e.target.value);
                                        if (value < 1) formState.rrule.interval = 1;
                                    }"
                                    @blur="!formState.rrule.interval || formState.rrule.interval < 1 ? formState.rrule.interval = 1 : formState.rrule.interval" 
                                    class="w-full" />
                            </div>
                        </div>

                        <div class="space-y-4 col-span-4">
                            <div class="flex flex-col gap-2 mb-8">
                                <label class="text-gray-700 font-medium">{{ t('eventModal.sections.recurrence.endType.label') }}</label>
                                <a-radio-group v-model:value="formState.rrule.endType" class="flex">
                                    <a-radio value="never">{{ t('eventModal.sections.recurrence.endType.never') }}</a-radio>
                                    <a-radio value="until">{{ t('eventModal.sections.recurrence.endType.until') }}</a-radio>
                                    <a-radio value="count">{{ t('eventModal.sections.recurrence.endType.count') }}</a-radio>
                                </a-radio-group>
                            </div>

                            <div class="grid grid-cols-1">
                                <div v-if="formState.rrule.endType === 'count'">
                                    <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.count.label') }}</label>
                                    <Input v-model:value="formState.rrule.count" type="number" min="1" :placeholder="t('eventModal.sections.recurrence.count.placeholder')"
                                        class="w-full" />
                                </div>

                                <div v-if="formState.rrule.endType === 'until'">
                                    <label class="text-gray-700 block font-medium mb-2">{{ t('eventModal.sections.recurrence.until.label') }}</label>
                                    <a-date-picker v-model:value="formState.rrule.until" :placeholder="t('eventModal.sections.recurrence.until.placeholder')"
                                        class="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Description Section -->
            <div class="form-section">
                <div class="flex justify-between items-center">
                    <div class="section-title">
                        <AlignLeftOutlined class="text-gray-500 mr-2" />
                        <span>{{ t('eventModal.sections.description.label') }}</span>
                    </div>
    
                    <div class="section-title" v-if="formState.type == 'event'">
                        <Upload
                            v-model:file-list="formState.attachments"
                            :before-upload="() => false"
                            multiple
                            @change="handleBeforeUpload"
                            list-type="picture-card"
                            :max-count="5"
                            class="text-blue-600 cursor-pointer hover:text-blue-800"
                        >
                            {{ t('eventModal.sections.description.addAttachment') }}
                        </Upload>
                    </div>
                </div>

                <Editor
                    v-model="formState.description"
                    editorStyle="min-height: 200px; max-height: 400px; overflow-y: auto; background-color: white;"
                    class="w-full"
                    :pt="{
                        toolbar: {
                        root: { class: 'bg-gray-50 p-2' }
                        },
                        content: {
                        root: { class: 'bg-white' }
                        }
                    }"
                    :toolbar="[
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'font': [] }],
                        ['list-ordered', 'list-unordered', 'indent-left', 'indent-right'],
                        ['align-left', 'align-center', 'align-right', 'align-justify'],
                        ['text-color', 'background-color'],
                        ['link', 'image', 'video'],
                        ['code-block', 'blockquote'],
                        ['script-sub', 'script-super'],
                        ['clean']
                    ]"
                    />
            </div>

            <!-- Location Section -->
            <div class="form-section" v-if="formState.type == 'event'">
                <div class="section-title">
                    <EnvironmentOutlined class="text-gray-500 mr-2" />
                    <span>{{ t('eventModal.sections.location.label') }}</span>
                </div>
                <a-form-item name="location" class="w-full">
                    <a-input :placeholder="t('eventModal.sections.location.placeholder')" class="rounded-lg" v-model:value="formState.location" />
                </a-form-item>
            </div>

            <!-- Participants Section -->
            <div class="form-section" v-if="formState.type == 'event'">
                <div class="section-title">
                    <UserOutlined class="text-gray-500 mr-2" />
                    <span>{{ t('eventModal.sections.participants.label') }}</span>
                </div>
                <div class="space-y-4">
                    <a-select v-model:value="formState.attendees" mode="multiple"
                        label-in-value 
                        :placeholder="t('eventModal.sections.participants.placeholder')" 
                        class="w-full" :filter-option="false"
                        :not-found-content="state.fetching ? undefined : null" :options="state.data"
                        @search="fetchUser"
                        :disabled="formState.user_id != user.id">
                        <template v-if="state.fetching" #notFoundContent>
                            <a-spin size="small" />
                        </template>
                    </a-select>
                    <div class="flex gap-3" v-if="formState.user_id == user.id">
                        <span>{{ t('eventModal.sections.participants.permissions.label') }}</span>
                        <div class="flex gap-4 items-center">
                            <a-radio-group v-model:value="formState.attendeeRole" class="flex gap-4">
                                <a-radio value="viewer">{{ t('eventModal.sections.participants.permissions.viewer') }}</a-radio>
                                <a-radio value="editor">{{ t('eventModal.sections.participants.permissions.editor') }}</a-radio>
                            </a-radio-group>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Privacy Section -->
            <div class="form-section flex flex-col gap-2">
                <div class="grid grid-cols-1 gap-2 md:grid-cols-2" v-if="formState.type == 'event'">
                    <div>
                        <div class="section-title">
                            <LockOutlined class="text-gray-500 mr-2" />
                            <span>{{ t('eventModal.sections.privacy.label') }}</span>
                        </div>
                        <div class="flex gap-6 items-center">
                            <a-checkbox v-model:checked="formState.is_private">{{ t('eventModal.sections.privacy.private') }}</a-checkbox>
                            <a-checkbox v-model:checked="formState.is_busy">{{ t('eventModal.sections.privacy.busy') }}</a-checkbox>
                        </div>
                    </div>
    
                    <div>
                        <!-- Notification Section -->
                        <div class="section-title">
                            <BellOutlined class="text-gray-500 mr-2" />
                            <span>{{ t('eventModal.sections.notifications.label') }}</span>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center mb-0">
                                <Checkbox v-model:checked="formState.is_reminder">{{ t('eventModal.sections.notifications.enable') }}</Checkbox>
                                <div v-if="formState.is_reminder" @click="addReminder" class="cursor-pointer">
                                    <a class="text-blue-600 hover:text-blue-800">{{ t('eventModal.sections.notifications.add') }}</a>
                                </div>
                            </div>
    
                        </div>
                    </div>
    
                </div>
                
                <div v-if="formState.is_reminder" class="space-y-2">
                    <div v-for="(reminder, index) in formState.reminder" :key="index" 
                        class="bg-gray-50 p-2 rounded-lg">
                        <Row :gutter="8" align="middle">
                        <Col span="8" class="flex items-center">
                            <Select 
                                v-model:value="reminder.type" 
                                placeholder="Loại nhắc nhở" 
                                class="w-full text-sm"
                                size="small"
                            >
                                <Select.Option value="email">Email</Select.Option>
                                <Select.Option value="web">Web</Select.Option>
                            </Select>
                            <span class="ml-2 text-sm">{{ t('eventModal.sections.notifications.before') }}</span>
                        </Col>
                        <Col span="6">
                            <InputNumber 
                                v-model:value="reminder.time" 
                                min="1"
                                size="small"
                                @blur="reminder.time = reminder.time || 1" 
                                placeholder="Thời gian"
                                class="w-full text-sm" 
                            />
                        </Col>
                        <Col span="7">
                            <Select 
                                v-model:value="reminder.unit" 
                                placeholder="Đơn vị" 
                                class="w-full text-sm"
                                size="small"
                                >
                                <Select.Option value="minutes">{{ t('eventModal.sections.notifications.units.minutes') }}</Select.Option>
                                <Select.Option value="hours">{{ t('eventModal.sections.notifications.units.hours') }}</Select.Option>
                            </Select>
                        </Col>
                        <Col span="3">
                            <Button 
                                type="text" 
                                size="small"
                                @click="removeReminder(index)" 
                                class="text-red-500 hover:!text-red-700 px-1"
                                >
                                <DeleteOutlined class="text-lg" />
                            </Button>
                        </Col>
                        </Row>
                    </div>
                </div>
            </div>

            <!-- URL Section -->
            <div class="form-section" v-if="formState.type == 'event'">
                <div class="section-title">
                    <LinkOutlined class="text-gray-500 mr-2" />
                    <span>{{ t('eventModal.sections.link.label') }}</span>
                </div>
                <a-form-item name="url" class="w-full">
                    <a-input :placeholder="t('eventModal.sections.link.placeholder')" class="bg-gray-50 rounded-lg" v-model:value="formState.url" />
                </a-form-item>
            </div>

        </a-form>
    </a-drawer>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, defineProps, defineEmits, watchEffect, watch, nextTick, computed, h } from 'vue';
import {
    CalendarOutlined,
    UserOutlined,
    EnvironmentOutlined,
    TagOutlined,
    LinkOutlined,
    BellOutlined,
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    PaperClipOutlined,
    AlignLeftOutlined
} from '@ant-design/icons-vue';
import { Button, Checkbox, Col, InputNumber, message, Row, Card, Tag, Select, DatePicker, Input, Modal, Upload } from 'ant-design-vue';
import { QuillEditor } from '@vueup/vue-quill';
import 'quill/dist/quill.snow.css';
// import moment from "moment-timezone";
import moment from 'moment';
import debounce from 'lodash/debounce';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateTime } from "luxon";
import { eventRules, setFormState } from '@/validators/eventRules';
import { recurringEventRules } from '@/validators/recurringEventRules';
import Editor from 'primevue/editor';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

dayjs.extend(utc);
dayjs.extend(timezone);

const drawerWidth = ref('100%');
const props = defineProps({
    visible: Boolean,
    event: Object,
});
const emit = defineEmits(['update:visible', 'calendar-updated']);

const selectedDate = ref(null);
const dirApi = import.meta.env.VITE_API_BASE_URL;
const token = localStorage.getItem('access_token');
const user = JSON.parse(localStorage.getItem('user'));
const timezones = moment.tz.names();
const tags = ref([]);
const origin = ref(typeof window !== 'undefined' ? window.location.origin : '');
const isLoading = ref(false);
const originalIsRepeat = ref(false); // Lưu trạng thái ban đầu của is_repeat


const editOption = ref("EDIT_1");

const updateDrawerWidth = () => {
    drawerWidth.value = window.innerWidth > 768 ? '50%' : '100%';
};
const handleClose = () => {
    formState.value = {
        id: null,
        title: "",
        start: null,
        end: null,
        allDay: false,
        type: "event",
        location: "",
        url: "",
        attendees: [],
        color_code: "#ff4d4f",
        is_reminder: false,
        reminder: [],
        is_repeat: false,
        is_done: false,
        is_busy: false,
        parent_id: null,
        tags: null,
        recurrence: null,
        timezone_code: "UTC",
        description: "",
        exclude_time: [],
        uuid: "",
        attendeeRole: "viewer",
        attachments: [],
        rrule: {
            freq: null,
            interval: 1,
            count: null,
            until: null,
            byweekday: [],
            bymonthday: [],
            bymonth: [],
            bysetpos: [],
        },
        shareLink: false,
    };
    originalIsRepeat.value = false;
    emit('update:visible', false);
};

onMounted(async () => {
    updateDrawerWidth();
    window.addEventListener('resize', updateDrawerWidth);
});
const formatDateTime = (isoString) => {
    return DateTime.fromISO(isoString).toFormat("yyyy-MM-dd HH:mm");
};

const updateFormStateFromProps = (event) => {
    if (event) {
        console.log("Dữ liệu sự kiện:", event);

        originalIsRepeat.value = event.recurrence === 1;

        // Xử lý ngày trong tuần nếu là sự kiện lặp lại theo tuần
        let byweekday = [];
        if (event.recurrence === 1 && event.info?.extendedProps?.freq === 'weekly') {
            // Nếu có dữ liệu byweekday từ server, sử dụng nó
            if (Array.isArray(event.info.extendedProps.byweekday) && event.info.extendedProps.byweekday.length > 0) {
                byweekday = event.info.extendedProps.byweekday;
            } else {
                // Nếu không có, lấy ngày từ thời gian bắt đầu
                const startDate = dayjs(event.start).tz(event.info?.extendedProps?.timezone || "UTC");
                const startDay = startDate.day();
                const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
                byweekday = [weekdays[startDay]];
            }
        }

        // Xử lý thời gian cho sự kiện lặp lại
        let startTime, endTime;
        if (event.recurrence === 1) {
            // Nếu là sự kiện lặp lại, sử dụng thời gian của sự kiện hiện tại
            startTime = event.start;
            endTime = event.end;
        } else {
            // Nếu không phải sự kiện lặp lại, sử dụng thời gian từ server
            startTime = event.start_time;
            endTime = event.end_time;
        }

        formState.value = {
            ...formState.value, // Giữ nguyên dữ liệu cũ
            id: event.id || null,
            title: event.title || "",
            start: startTime ? dayjs(startTime).tz(event.info?.extendedProps?.timezone) : dayjs().tz(event.info?.extendedProps?.timezone),
            end: endTime ? dayjs(endTime).tz(event.info?.extendedProps?.timezone) : dayjs().tz(event.info?.extendedProps?.timezone).add(1, 'hour'),
            allDay: event.is_all_day || false,
            user_id: event.user_id,
            type: event.type || "event",
            location: event.location || "",
            url: event.url || "",
            attendees: Array.isArray(event.attendees) && event.attendees.length > 0
                ? event.attendees.map(att => ({
                    label: att.email || att.user?.email || '',
                    value: att.user_id || att.id || att.user?.id || ''
                }))
                : [],
            tags: event.tag_id || null,
            is_private: event.is_private,
            color_code: event.color || "#ff4d4f",
            is_reminder: Boolean(event.is_reminder),
            reminder: parseReminders(event.reminder),
            is_repeat: event.recurrence === 1 ? Boolean(event.recurrence === 1) : false,
            exclude_time: Array.isArray(event.info?.extendedProps?.exclude_time) 
                ? event.info.extendedProps.exclude_time 
                : [],
            timezone_code: event.info?.extendedProps?.timezone || "UTC",
            description: event.info?.extendedProps?.description || "",
            uuid: event.uuid ? event.uuid : null,
            is_busy: event.is_busy === 1,
            parent_id: event.parent_id ? event.parent_id : null,
            attendeeRole: event.attendees.length > 0 ? event.attendees[0].role : "viewer", //lấy quyền của khách mời
            attachments: event.attachments || [],
            // Nếu sự kiện lặp lại (is_repeat = true), cập nhật rrule
            rrule: event.recurrence === 1 ? {
                freq: event.info?.extendedProps?.freq || "daily",
                interval: Number(event.info?.extendedProps?.interval) || 1,
                count: event.info?.extendedProps?.count 
                    ? Number(event.info.extendedProps.count) 
                    : null,
                until: event.info?.extendedProps?.until
                    ? dayjs(event.info.extendedProps.until)
                    : dayjs("3000-12-31 23:59:59"),
                byweekday: Array.isArray(event.info?.extendedProps?.byweekday)
                    ? event.info.extendedProps.byweekday
                    : [],
                bymonthday: Array.isArray(event.info?.extendedProps?.bymonthday)
                    ? event.info.extendedProps.bymonthday
                    : [],
                bymonth: Array.isArray(event.info?.extendedProps?.bymonth)
                    ? event.info.extendedProps.bymonth
                    : [],
                bysetpos: Array.isArray(event.info?.extendedProps?.bysetpos)
                    ? event.info.extendedProps.bysetpos
                    : [],
                endType: event.info?.extendedProps?.count ? "count" 
                    : event.info?.extendedProps?.until && dayjs(event.info?.extendedProps?.until).year() < 3000 ? "until" 
                    : ""
            } : {
                freq: null,
                interval: 1,
                count: null,
                until: dayjs("3000-12-31 23:59:59"),
                byweekday: [],
                bymonthday: [],
                bymonth: [],
                bysetpos: [],
                endType: ""
            }
        };
    }
};

const validateFormState = () => {
    // Kiểm tra thời gian bắt đầu và kết thúc
    if (formState.value.start && formState.value.end) {
        if (dayjs(formState.value.start).isAfter(formState.value.end)) {
            formState.value.end = dayjs(formState.value.start).add(1, 'hour');
        }
    }

    // Kiểm tra reminder
    if (formState.value.is_reminder && formState.value.reminder.length === 0) {
        formState.value.reminder = [{ type: "email", time: 5, unit: "minutes" }];
    }

    // Kiểm tra rrule khi là sự kiện lặp lại
    if (formState.value.is_repeat) {
        if (!formState.value.rrule.freq) {
            formState.value.rrule.freq = "daily";
        }
        if (!formState.value.rrule.interval || formState.value.rrule.interval < 1) {
            formState.value.rrule.interval = 1;
        }
    }
};

// Theo dõi sự thay đổi của props.event
watch(() => props.event, async (newEvent) => {
    if(newEvent != null) {
        await nextTick();
        getAllTagByUser();
        updateFormStateFromProps(newEvent);
        validateFormState();
    }
}, { immediate: true });

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDrawerWidth);
});


const formState = ref({
    id: null,
    title: "",
    start: null,
    end: null,
    allDay: false,
    type: "event",
    location: "",
    url: "",
    attendees: [],
    color_code: "#ff4d4f",
    is_reminder: false,
    reminder: [],
    is_repeat: false,
    is_done: false,
    is_busy: false,
    parent_id: null,
    tags: null,
    recurrence: null,
    timezone_code: "UTC",
    description: "",
    exclude_time: [],
    uuid: "",
    attendeeRole: "viewer",
    is_private: false,
    rrule: {
        freq: null,
        interval: 1,
        count: null,
        until: dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
        byweekday: [],
        bymonthday: [],
        bymonth: [],
        bysetpos: [],
    },
    shareLink: false,
});

const rules = {
    title: [
        { required: true, message: t('validation.title.required'), trigger: "blur" },
        { min: 3, max: 255, message: t('validation.title.min'), trigger: "blur" },
        { max: 255, message: t('validation.title.max'), trigger: "blur" },
    ],
    time: [
        { required: true, message: t('validation.time.required'), trigger: "change" },
        {
            validator: (_, value) => {
                if (!value || value.length !== 2) return Promise.reject(t('validation.time.invalid'));
                if (dayjs(value[0]).isAfter(value[1])) return Promise.reject(t('validation.time.start_after_end'));
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    attendees: [
        {
            validator: (_, value) => {
                if (value.length > 10) return Promise.reject(t('validation.attendees.max'));
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    reminder: [
        {
            validator: (_, value) => {
                if (value.length > 3) return Promise.reject(t('validation.reminder.max'));
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    rrule: {
        freq: [
            { required: true, message: t('validation.rrule.freq'), trigger: "change" },
        ],
        interval: [
            { required: true, message: t('validation.rrule.interval.required'), trigger: "change" },
            { type: 'number', min: 1, message: t('validation.rrule.interval.min'), trigger: "change" },
        ],
        until: [
            {
                validator: (_, value) => {
                    if (formState.value.is_repeat && !value) {
                        return Promise.reject(t('validation.rrule.until'));
                    }
                    return Promise.resolve();
                },
                trigger: "change",
            },
        ],
        byweekday: [
            {
                validator: (_, value) => {
                    if (formState.value.rrule.freq === 'weekly' && (!value || value.length === 0)) {
                        return Promise.reject(t('validation.rrule.byweekday'));
                    }
                    return Promise.resolve();
                },
                trigger: "change",
            },
        ],
        bymonthday: [
            {
                validator: (_, value) => {
                    if (formState.value.rrule.freq === 'monthly' && (!value || value.length === 0)) {
                        return Promise.reject(t('validation.rrule.bymonthday'));
                    }
                    return Promise.resolve();
                },
                trigger: "change",
            },
        ],
    },
};


watch(
    () => formState.value.is_repeat,
    async (newValue) => {
        await nextTick(); // Chờ Vue cập nhật xong trước khi gán dữ liệu mới

        if (newValue) {
            // Nếu bật lặp lại, đảm bảo rrule có dữ liệu mặc định
            formState.value.rrule = {
                ...formState.value.rrule, // Giữ nguyên các giá trị khác
                freq: formState.value.rrule.freq || "daily", // Set mặc định là daily nếu chưa có
                interval: formState.value.rrule.interval || 1,
                count: formState.value.rrule.count || null,
                until: formState.value.rrule.until || dayjs("3000-12-31 23:59:59"),
                byweekday: formState.value.rrule.byweekday || [],
                bymonthday: formState.value.rrule.bymonthday || [],
                bymonth: formState.value.rrule.bymonth || [],
                bysetpos: formState.value.rrule.bysetpos || [],
                endType: formState.value.rrule.endType || "",
            };
        } else {
            // Khi tắt lặp lại, reset rrule về giá trị mặc định
            formState.value.rrule = {
                freq: null,
                interval: 1,
                count: null,
                until: null,
                byweekday: [],
                bymonthday: [],
                bymonth: [],
                bysetpos: [],
                endType: "",
            };
        }
    },
    { immediate: true }
);

watch(
  () => formState.value.allDay,
  (newValue) => {
    if (newValue) {
      // Khi chuyển sang cả ngày
      if (formState.value.start && formState.value.end) {
        // Kiểm tra nếu start và end cùng ngày
        if (dayjs(formState.value.start).format('YYYY-MM-DD') === dayjs(formState.value.end).format('YYYY-MM-DD')) {
          // Nếu cùng ngày, set end = start + 1 ngày
          formState.value.end = dayjs(formState.value.start).add(1, 'day');
        } else {
          // Nếu khác ngày, chỉ cần set thời gian về đầu ngày và cuối ngày
          formState.value.start = dayjs(formState.value.start).startOf('day');
          formState.value.end = dayjs(formState.value.end).endOf('day');
        }
      }
    } else {
      // Khi tắt cả ngày, set lại thời gian mặc định
      if (formState.value.start) {
        formState.value.start = dayjs(formState.value.start).hour(dayjs().hour()).minute(dayjs().minute());
      }
      if (formState.value.end) {
        formState.value.end = dayjs(formState.value.end).hour(dayjs().hour()).minute(dayjs().minute());
      }
    }
  }
);

const freqOptions = [
    { label: "Hàng ngày", value: "daily" },
    { label: "Hàng tuần", value: "weekly" },
    { label: "Hàng tháng", value: "monthly" },
    { label: "Hàng năm", value: "yearly" },
];

const weekDays = [
    { label: "T2", value: "MO" },
    { label: "T3", value: "TU" },
    { label: "T4", value: "WE" },
    { label: "T5", value: "TH" },
    { label: "T6", value: "FR" },
    { label: "T7", value: "SA" },
    { label: "CN", value: "SU" },
];

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

const copyToClipboard = () => {
    navigator.clipboard.writeText(`${origin}/calendar/event/${formState.value.uuid}/invite`).then(() => {
        message.success('Đã sao chép liên kết!');
    });
};

watch(
    () => formState.value.rrule?.endType,
    (newVal) => {
        if (newVal === "count") {
            formState.value.rrule.until = null;
        } else if (newVal === "until") {
            formState.value.rrule.count = null;
        } else if (newVal === "") { 
            formState.value.rrule.count = null;
            formState.value.rrule.until = null;
        }
    }
);

const addReminder = () => {
    if (!Array.isArray(formState.value.reminder)) {
        formState.value.reminder = [];
    }

    if (formState.value.reminder.length < 3) {
        formState.value.reminder.push({ type: "email", time: 5, unit: "minutes" });
    } else {
        message.warning(t('eventModal.warning.maxReminders'));
    }
};
const formatReminders = (reminders) => {
    if (!Array.isArray(reminders)) {
        return [];
    }

    const formattedReminders = reminders.map(({ type, time, unit }) => ({
        type,
        set_time: unit === "hours" ? time * 60 : time, // Chuyển đổi giờ thành phút
    }));

    // Loại bỏ các phần tử trùng lặp
    return formattedReminders.filter((reminder, index, self) =>
        index === self.findIndex((r) => r.type === reminder.type && r.set_time === reminder.set_time)
    );
};
const parseReminders = (reminders) => {
    if (!Array.isArray(reminders)) {
        return [];
    }

    return reminders.map(reminder => {
        const set_time = reminder.set_time || 5;
        return {
            type: reminder.type || "email",
            time: set_time >= 60 ? Math.floor(set_time / 60) : set_time,
            unit: set_time >= 60 ? "hours" : "minutes"
        };
    });
};
const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
        start.value = dates[0]; // Cập nhật biến start
        end.value = dates[1];   // Cập nhật biến end
        console.log("Thời gian bắt đầu:", start.value.format("YYYY-MM-DD HH:mm:ss"));
        console.log("Thời gian kết thúc:", end.value.format("YYYY-MM-DD HH:mm:ss"));
    }
};
const removeReminder = (index) => {
    formState.value.reminder.splice(index, 1);

    if (formState.value.reminder.length == 0) {
        formState.value.is_reminder = false;
    }
};
const colors = [
  { label: 'blue', value: '#1890ff' }, 
  { label: 'red', value: '#ff4d4f' }, 
  { label: 'green', value: '#52c41a' },
  { label: 'yellow', value: '#faad14' }, 
  { label: 'purple', value: '#722ed1' },
  { label: 'gray', value: '#bfbfbf' }, 
  { label: 'orange', value: '#fa541c' }, 
  { label: 'pink', value: '#eb2f96' }, 
  { label: 'brown', value: '#a97c50' }, 
  { label: 'cyan', value: '#13c2c2' }, 
  { label: 'emerald', value: '#237804' }, 
  { label: 'navy', value: '#003a8c' },
  { label: 'black', value: '#000000' }
];

const selectColor = (color) => {
    formState.value.color_code = color;
};

// cập nhật giờ thông báo
watch(
    () => formState.value.reminder,
    (newReminders) => {
        newReminders.forEach((reminder) => {
            if (reminder.unit === "hours" && reminder.time > 24) {
                message.info(t('eventModal.warning.maxHours'));
                reminder.time = 24; // Giới hạn tối đa 24 giờ
            }
            if (reminder.unit === "minutes" && reminder.time > 60) {
                reminder.unit = "hours"; // Chuyển sang giờ
                reminder.time = Math.floor(reminder.time / 60); // Chuyển đổi thành giờ
            }
        });
    },
    { deep: true }
);

const getAllTagByUser = async () => {
    try {
        const res = await axios.get(`${dirApi}tags`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.data.code === 200) {
            // Cập nhật danh sách tags
            tags.value = res.data.data.map(tag => ({
                label: tag.name,
                value: tag.id
            }));

            // Nếu có event và event có tag_id, cập nhật formState.tags
            if (props.event && props.event.tag_id) {
                formState.value.tags = props.event.tag_id;
            } else {
                formState.value.tags = null;
            }
        } else {
            message.error('Không thể tải danh sách tags');
        }
    } catch (error) {
        message.error('Đã xảy ra lỗi khi tải danh sách tags');
    }
}

const transformAttendeesData = (data) => {
    // Lấy danh sách người tham gia hiện tại từ event gốc
    const existingAttendees = props.event?.attendees || [];
    
    return data.map(option => {
        // Tìm xem người này đã tồn tại trong danh sách cũ chưa
        const existingAttendee = existingAttendees.find(att => 
            att.user_id === option.value || att.id === option.value
        );
        
        // Nếu đã tồn tại, giữ nguyên status cũ
        // Nếu chưa tồn tại, set status là pending
        return {
            user_id: option.value,
            status: existingAttendee ? existingAttendee.status : 'pending',
            role: formState.value.attendeeRole
        };
    });
};

// Lấy thông tin khách mời
const state = ref({
    data: [],
    fetching: false
});

let lastFetchId = 0;

const fetchUser = debounce(async (value) => {
    if (!value) {
        state.value.data = [];
        return;
    }

    lastFetchId += 1;
    const fetchId = lastFetchId;

    state.value.fetching = true;

    try {
        const response = await axios.get(`${dirApi}guest?search=${value}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (fetchId !== lastFetchId) return;

        const fetchedUsers = response.data.data.map(user => ({
            label: `${user.email}`,
            value: user.id
        }));

        // So sánh với attendees đã chọn trước đó
        const selectedAttendees = formState.value.attendees.map(att => att.value);

        state.value.data = fetchedUsers.map(user => ({
            ...user,
            selected: selectedAttendees.includes(user.value) // Đánh dấu user đã chọn
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        state.value.data = [];
    } finally {
        state.value.fetching = false;
    }
}, 300);
// Kết thúc hàm lấy thông tin khách mời

const getGmtOffset = (timezone) => {
    const offset = moment.tz(timezone).utcOffset();
    const hours = Math.floor(Math.abs(offset / 60));
    const minutes = Math.abs(offset % 60);
    return `UTC${offset >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
const filterOption = (input, option) => {
    return option.value.toLowerCase().includes(input.toLowerCase());
};
const handleExcludeDate = (date) => {
    if (date) {
        const formattedDate = dayjs(date).hour(dayjs(formState.value.start).hour()).minute(dayjs(formState.value.start).minute()).second(0).format("YYYY-MM-DD HH:mm:ss");
        if (!formState.value.exclude_time.includes(formattedDate)) {
            formState.value.exclude_time.push(formattedDate);
        }
    }
};

const formRef = ref();

// Xử lý cập nhật sự kiện
const handleSubmit = async () => {
    try {
        // Validate form using formRef
        await formRef.value.validate();

        // If validation passes, proceed with update
        if (originalIsRepeat.value === true) {
            // Check if freq has changed
            const originalFreq = props.event?.info?.extendedProps?.freq;
            const newFreq = formState.value.rrule?.freq;
            const hasFreqChanged = originalFreq !== newFreq;

            // Check if start time has changed - compare actual time values
            const originalStart = dayjs(props.event?.start)
                                    .tz(props.event?.info?.extendedProps?.timezone)
                                    .format(props.event?.info?.allDay ? "YYYY-MM-DD 00:00:00" : "YYYY-MM-DD HH:mm:ss");
            const newStart = formState.value.start
                                    .tz(formState.value.timezone_code)
                                    .format(props.event?.info?.allDay ? "YYYY-MM-DD 00:00:00" : "YYYY-MM-DD HH:mm:ss");
            const hasStartChanged = originalStart !== newStart;

            // Case 1: Only start time changed, frequency unchanged
            if (hasStartChanged && !hasFreqChanged) {
                Modal.confirm({
                    title: t('options.recurrence.edit.title'),
                    width: 600,
                    content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_1",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_1",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.one')),
                            ]),
                        ]),
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_1B",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_1B",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.follow')),
                            ]),
                        ]),
                    ]),
                    okText: t('options.recurrence.edit.update'),
                    cancelText: t('options.recurrence.edit.cancel'),
                    onOk() {
                        updateEvent({ code: editOption.value, date: formState.value.start, id: formState.value.id });
                    },
                });
            }
            // Case 2: Both frequency and start time changed
            else if (hasFreqChanged && hasStartChanged) {
                // Automatically use EDIT_1B without showing modal
                updateEvent({ code: "EDIT_1B", date: formState.value.start, id: formState.value.id });
            }
            // Case 3: Recurrence settings changed
            else if (hasRecurrenceChanges()) {
                Modal.confirm({
                    title: t('options.recurrence.edit.title'),
                    width: 600,
                    content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_1B",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_1B",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.follow')),
                            ]),
                        ]),
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_A",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_A",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.all')),
                            ]),
                        ]),
                    ]),
                    okText: t('options.recurrence.edit.update'),
                    cancelText: t('options.recurrence.edit.cancel'),
                    onOk() {
                        updateEvent({ code: editOption.value, date: formState.value.start, id: formState.value.id });
                    },
                });
            }
            // Case 4: No changes to frequency or start time
            else {
                Modal.confirm({
                    title: t('options.recurrence.edit.title'),
                    width: 600,
                    content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_1",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_1",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.one')),
                            ]),
                        ]),
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_1B",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_1B",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.follow')),
                            ]),
                        ]),
                        h("div", { class: "mb-3" }, [
                            h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                                h("input", {
                                    type: "radio",
                                    name: "editOption",
                                    value: "EDIT_A",
                                    class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                    checked: editOption.value === "EDIT_A",
                                    onInput: (e) => {
                                        editOption.value = e.target.value;
                                    },
                                }),
                                h("span", { class: "text-lg" }, t('options.recurrence.edit.all')),
                            ]),
                        ]),
                    ]),
                    okText: t('options.recurrence.edit.update'),
                    cancelText: t('options.recurrence.edit.cancel'),
                    onOk() {
                        updateEvent({ code: editOption.value, date: formState.value.start, id: formState.value.id });
                    },
                });
            }
        } else {
            // Nếu không có lặp lại, cập nhật ngay lập tức
            updateEvent({ code: "EDIT_N", date: formState.value.start, id: formState.value.id });
        }
    } catch (error) {
        console.log(error)
    }
};

// Hàm cập nhật sự kiện
const updateEvent = async ({ code, date, id }) => {
    isLoading.value = true;
    console.log(formState.value.attendees)
    try {
        const dataApi = {
            id: id,
            code: code,
            start_time: formState.value.start
                ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
                : null,
            title: formState.value.title || "(Không có tiêu đề)",
            updated_date: formState.value.start
                ? formState.value.start.format("YYYY-MM-DD HH:mm:ss")
                : null,
            end_time: formState.value.end
                ? formState.value.end.format("YYYY-MM-DD HH:mm:ss")
                : null,
            description: formState.value.description || null,
            location: formState.value.location || null,
            attendees: formState.value.attendees ? transformAttendeesData(formState.value.attendees) : null,
            sendMail: formState.value.sendMail,
            is_reminder: formState.value.is_reminder || 0,
            reminder: formatReminders(formState.value.reminder) || null,
            color_code: formState.value.color_code || null,
            is_busy: formState.value.is_busy ? 1 : 0,
            is_all_day: formState.value.allDay ? 1 : 0,
            is_repeat: formState.value.is_repeat ? 1 : 0,
            parent_id: formState.value.parent_id || null,
            is_done: 0,
            rrule: formState.value.rrule || null,
            exclude_time: formState.value.exclude_time || null,
            timezone_code: formState.value.timezone_code || null,
            type: formState.value.type || null,
            freq: formState.value.rrule?.freq || null,
            interval: formState.value.rrule?.interval ?? 1,
            count: formState.value.rrule?.count ?? null,
            until: formState.value.rrule?.endType === "count" 
                ? dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss")
                : formState.value.rrule?.endType === "until" 
                    ? (formState.value.rrule?.until && 
                       dayjs(formState.value.rrule.until).format() !== dayjs(props.event?.info?.extendedProps?.until).format()
                        ? dayjs(formState.value.rrule.until).format("YYYY-MM-DD 00:00:00")
                        : dayjs(props.event?.info?.extendedProps?.until).format("YYYY-MM-DD 00:00:00"))
                    : dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
            byweekday: formState.value.rrule?.byweekday.length && formState.value.rrule?.freq === "weekly" ? formState.value.rrule.byweekday : null,
            bymonthday: formState.value.rrule?.bymonthday.length && formState.value.rrule?.freq === "monthly" ? formState.value.rrule.bymonthday : null,
            bymonth: formState.value.rrule?.bymonth.length && formState.value.rrule?.freq === "yearly" ? formState.value.rrule.bymonth : null,
            tag_id: formState.value.tags || null,
            is_private: formState.value.is_private ? 1 : 0,
            // path: formState.value.attachments.map(att => att.id),
            link: null,
        };

        console.log("data send",dataApi);

        const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}tasks/${id}`, dataApi, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
        });

        if (res.data.code === 200) {
            message.success(t('eventModalEdit.message.success'));
            
            await Promise.all(
                presignedUrls.value.map(async (info, index) => {
                    // Upload file to S3
                    try {
                    await axios.put(info.url, fileUploads.value[index], {
                        headers: {
                        "Content-Type": info.metadata.mime
                        }
                    });

                    // Save file information to database with required fields
                    await axios.post(
                        `${dirApi}file-entry/store/file`,
                        {
                        files: [{
                            file_name: info.metadata.file_name,
                            client_name: info.metadata.client_name,
                            extension: info.metadata.extension,
                            size: info.metadata.size,
                            mime: info.metadata.mime,
                            task_id: res.data.data.id
                        }]
                        },
                        {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                        },
                        }
                    );
                    } catch (error) {
                    console.error("Error uploading file:", error);
                    message.error(`Upload file ${info.metadata.client_name} thất bại`);
                    }
                })
            );

            // Emit event với dữ liệu đã cập nhật
            const updatedEventData = {
                id: id,
                title: formState.value.title,
                start: formState.value.start.format("YYYY-MM-DD HH:mm:ss"),
                end: formState.value.end.format("YYYY-MM-DD HH:mm:ss"),
                color: formState.value.color_code,
                is_all_day: formState.value.allDay,
                type: formState.value.type,
                location: formState.value.location,
                description: formState.value.description,
                is_reminder: formState.value.is_reminder,
                reminder: formatReminders(formState.value.reminder),
                is_repeat: formState.value.is_repeat,
                recurrence: formState.value.is_repeat ? 1 : 0,
                info: {
                    extendedProps: {
                        freq: formState.value.rrule?.freq,
                        interval: formState.value.rrule?.interval,
                        count: formState.value.rrule?.count,
                        until: formState.value.rrule?.until,
                        byweekday: formState.value.rrule?.byweekday,
                        bymonthday: formState.value.rrule?.bymonthday,
                        bymonth: formState.value.rrule?.bymonth,
                        timezone: formState.value.timezone_code,
                        description: formState.value.description,
                        exclude_time: formState.value.exclude_time
                    }
                }
            };
            
            emit('calendar-updated', updatedEventData);
            
            // Reset form và đóng modal
            formState.value = {
                id: null,
                title: "",
                start: null,
                end: null,
                allDay: false,
                type: "event",
                location: "",
                url: "",
                attendees: [],
                color_code: "#ff4d4f",
                is_reminder: false,
                reminder: [],
                is_repeat: false,
                is_done: false,
                is_busy: false,
                parent_id: null,
                tags: null,
                recurrence: null,
                timezone_code: "UTC",
                description: "",
                exclude_time: [],
                uuid: "",
                attendeeRole: "viewer",
                attachments: [],
                rrule: {
                    freq: null,
                    interval: 1,
                    count: null,
                    until: dayjs("3000-12-31 23:59:59").format("YYYY-MM-DD HH:mm:ss"),
                    byweekday: [],
                    bymonthday: [],
                    bymonth: [],
                    bysetpos: [],
                },
            };
            emit('update:visible', false);
        } else {
            message.warning(t('eventModalEdit.message.error'));
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật sự kiện:", error);
        message.error(t('eventModalEdit.message.error'));
    } finally {
        isLoading.value = false;
    }
};

// Tạo computed property cho rules
const formRules = computed(() => ({
    ...eventRules,
    ...recurringEventRules
}));

// Add watch for formState
watch(
    () => formState.value,
    (newValue) => {
        setFormState(newValue);
    },
    { deep: true, immediate: true }
);

// chọn mặc định thứ của ngày bắt đầu khi không chọn thứ
watch(
  () => formState.value.rrule?.byweekday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'weekly' && 
        (!newVal || newVal.length === 0) && 
        formState.value.start) {
      
      const startDay = dayjs(formState.value.start).day();
      const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      formState.value.rrule.byweekday = [weekdays[startDay]];
    }
  }
);

// Thêm watch cho freq để xử lý khi chuyển sang lặp theo tuần
watch(
  () => formState.value.rrule?.freq,
  (newVal, oldVal) => {
    if (newVal === 'weekly') {
      // Nếu đang sửa sự kiện và có dữ liệu byweekday, giữ nguyên selection
      if (props.event?.recurrence === 1 && 
          props.event?.info?.extendedProps?.freq === 'weekly' &&
          props.event?.info?.extendedProps?.byweekday?.length > 0 &&
          oldVal === null) {
        formState.value.rrule.byweekday = props.event.info.extendedProps.byweekday;
      } else if (!formState.value.rrule.byweekday || formState.value.rrule.byweekday.length === 0) {
        // Nếu không có selection hoặc đổi từ loại khác sang weekly
        const startDay = dayjs(formState.value.start).day();
        const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        formState.value.rrule.byweekday = [weekdays[startDay]];
      }
    } else if (newVal === 'monthly') {
      // Nếu đang sửa sự kiện và có dữ liệu bymonthday, giữ nguyên selection
      if (props.event?.recurrence === 1 && 
          props.event?.info?.extendedProps?.freq === 'monthly' &&
          props.event?.info?.extendedProps?.bymonthday?.length > 0 &&
          oldVal === null) {
        formState.value.rrule.bymonthday = props.event.info.extendedProps.bymonthday;
      } else if (!formState.value.rrule.bymonthday || formState.value.rrule.bymonthday.length === 0) {
        // Nếu không có selection hoặc đổi từ loại khác sang monthly
        const startDay = dayjs(formState.value.start).date();
        formState.value.rrule.bymonthday = [startDay];
      }
    }
  }
);

// Thêm watch cho is_repeat để xử lý khi bật/tắt lặp lại
watch(
  () => formState.value.is_repeat,
  (newVal) => {
    if (newVal && formState.value.rrule?.freq === 'weekly') {
      // Khi bật lặp lại và đang ở chế độ lặp theo tuần
      if (props.event?.recurrence === 1 && 
          props.event?.info?.extendedProps?.freq === 'weekly' &&
          props.event?.info?.extendedProps?.byweekday?.length > 0) {
        // Nếu đang sửa sự kiện và có dữ liệu byweekday, giữ nguyên selection
        formState.value.rrule.byweekday = props.event.info.extendedProps.byweekday;
      } else if (!formState.value.rrule.byweekday || formState.value.rrule.byweekday.length === 0) {
        // Nếu không có selection
        const startDay = dayjs(formState.value.start).day();
        const weekdays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        formState.value.rrule.byweekday = [weekdays[startDay]];
      }
    }
  }
);

watch(
  () => formState.value.rrule?.bymonthday,
  (newVal) => {
    if (formState.value.rrule?.freq === 'monthly' && (!newVal || newVal.length === 0) && formState.value.start) {
      // Lấy ngày trong tháng từ ngày bắt đầu
      const startDay = dayjs(formState.value.start).date();
      formState.value.rrule.bymonthday = [startDay];
    }
  }
);

// kiểm tra có sửa các thuộc tính lặp lại hay không
const hasRecurrenceChanges = () => {
    
    const originalProps = props.event.info.extendedProps;
    const newProps = formState.value.rrule;
    
    // Chỉ kiểm tra các thuộc tính liên quan đến lặp lại
    const hasRecurrencePropertyChanged = 
        originalProps.freq !== newProps.freq ||
        originalProps.interval !== newProps.interval ||
        originalProps.count !== newProps.count ||
        (originalProps.until && newProps.until && dayjs(originalProps.until).format() !== dayjs(newProps.until).format()) ||
        (originalProps.byweekday?.length > 0 && newProps.byweekday?.length > 0 && 
         JSON.stringify(originalProps.byweekday) !== JSON.stringify(newProps.byweekday)) ||
        (originalProps.bymonthday?.length > 0 && newProps.bymonthday?.length > 0 && 
         JSON.stringify(originalProps.bymonthday) !== JSON.stringify(newProps.bymonthday)) ||
        (originalProps.bymonth?.length > 0 && newProps.bymonth?.length > 0 && 
         JSON.stringify(originalProps.bymonth) !== JSON.stringify(newProps.bymonth));

    return hasRecurrencePropertyChanged;
};

// Thêm watch cho is_reminder để tự động thêm reminder mặc định
watch(
    () => formState.value.is_reminder,
    (newVal) => {
        if (newVal && (!formState.value.reminder || formState.value.reminder.length === 0)) {
            formState.value.reminder = [{ type: "email", time: 5, unit: "minutes" }];
        }
    }
);

const presignedUrls = ref([]);
const fileUploads = ref([]);

// handle before upload
const handleBeforeUpload = async (info) => {
  const files = info.fileList.map(file => file.originFileObj).filter(Boolean);
  const formData = new FormData();

  // Thay đổi cách append file vào FormData
  files.forEach((file, index) => {
    formData.append(`files[${index}]`, file); // Thêm index vào tên field
  });

  console.log('Files to upload:', files);
  console.log('FormData entries:');
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const { data } = await axios.post(
      `${dirApi}s3/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        // Thêm timeout và maxContentLength
        timeout: 30000, // 30 giây
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('API Response:', data);

    if (data.presigned_urls && data.presigned_urls.length > 0) {
      presignedUrls.value = data.presigned_urls;
      console.log('Presigned URLs:', data.presigned_urls);
      
      // Reset fileUploads trước khi thêm file mới
      fileUploads.value = [];
      files.forEach(file => {
        fileUploads.value.push(file);
      });
      console.log('File uploads:', fileUploads.value);
    } else {
      console.log('No presigned URLs received');
    }

  } catch (error) {
    console.error("Upload failed", error);
    // Reset các biến khi upload thất bại
    presignedUrls.value = [];
    fileUploads.value = [];
  }

  return false; // Ngăn Upload tự động xử lý
};

// Hàm xóa file đính kèm
const removeAttachment = (index) => {
  fileUploads.value.splice(index, 1);
  
  // Xóa presignedUrl tương ứng
  if (presignedUrls.value && presignedUrls.value.length > index) {
    presignedUrls.value.splice(index, 1);
  }

  console.log('File Uploads:', fileUploads.value);
  console.log('Presigned URLs:', presignedUrls.value);
};
</script>

<style scoped>
.event-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-section {
    background-color: white;
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #f3f4f6;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
    display: flex;
    align-items: center;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.75rem;
    font-size: 1rem;
}

:deep(.ant-input-borderless) {
    background: transparent;
}

:deep(.ant-select-selector) {
    background-color: rgb(249, 250, 251) !important;
    border-radius: 0.5rem !important;
}

:deep(.ant-input),
:deep(.ant-select),
:deep(.ant-picker) {
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

:deep(.ant-input:hover),
:deep(.ant-select:hover),
:deep(.ant-picker:hover) {
    border-color: #1890ff;
}

:deep(.ant-checkbox-wrapper) {
    transition: color 0.2s;
}

:deep(.ant-checkbox-wrapper:hover) {
    color: #2563eb;
}

:deep(.ant-tag) {
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
}

.recurrence-card {
    background-color: #f9fafb;
    border-color: #e5e7eb;
}

:deep(.ant-card-head) {
    border-bottom: 1px solid #e5e7eb;
}

:deep(.ant-radio-wrapper) {
    transition: color 0.2s;
}

:deep(.ant-radio-wrapper:hover) {
    color: #2563eb;
}

:deep(.ant-btn) {
    border-radius: 0.5rem;
    transition: all 0.2s;
}

:deep(.ant-btn-primary) {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.ant-btn-primary:hover) {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.ant-drawer-content-wrapper) {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

:deep(.ant-drawer-header) {
    border-bottom: 1px solid #e5e7eb;
}

:deep(.ant-drawer-title) {
    font-size: 1.125rem;
    font-weight: 500;
}

:deep(.ant-form-item) {
    margin-bottom: 0.75rem;
}

:deep(.ant-form-item-label) {
    padding-bottom: 0.25rem;
}

:deep(.ant-checkbox-group) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}

@media (max-width: 768px) {
    .form-section {
        padding: 0.5rem;
    }
    
    :deep(.ant-checkbox-group) {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Giảm size của thumbnail upload */
:deep(.ant-upload-list-picture-card .ant-upload-list-item-container) {
  width: 70px !important;
  height: 70px !important;
}
:deep(.ant-upload-list-picture-card .ant-upload-list-item) {
  width: 70px !important;
  height: 70px !important;
  font-size: 12px !important;
  margin: 0 !important;
}

:deep(.ant-upload-picture-card-wrapper .ant-upload-select) {
  width: 70px !important;
  height: 70px !important;
  font-size: 12px !important;
  margin: 0 !important;
}
</style>