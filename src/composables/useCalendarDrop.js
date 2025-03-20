import { h, ref } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Modal } from "ant-design-vue";
import { message } from 'ant-design-vue';
import { useSettings } from "@/composables/useSettings";

dayjs.extend(utc);
dayjs.extend(timezone);

const dirApi = import.meta.env.VITE_API_BASE_URL;

const selectedEvent = ref(null);
const editOption = ref("");

const { initSettings, getUserTimezone } = useSettings();

// Gọi initSettings để khởi tạo cài đặt
initSettings();
const userTimezone = getUserTimezone();

export function useCalendarDrop() {
    const eventDrop = async (info) => {
        let oldStart = dayjs(info.oldEvent.start).format("YYYY-MM-DD HH:mm:ss");
        let oldEnd = info.oldEvent.end ? dayjs(info.oldEvent.end).format("YYYY-MM-DD HH:mm:ss") : null;
        let newStart = dayjs(info.event.start).format("YYYY-MM-DD HH:mm:ss");
        let newEnd = info.event.end ? dayjs(info.event.end).format("YYYY-MM-DD HH:mm:ss") : null;
    
        const isAllDay = info.event.allDay;
    
        if (isAllDay) {
            newEnd = dayjs(newStart).add(1, 'day').format("YYYY-MM-DD HH:mm:ss");
        }
    
        if (info.event.extendedProps.recurrence === 1) {
            selectedEvent.value = {
                id: info.event.id,
                updated_date: oldStart,
                start_time: newStart,
                end_time: newEnd,
                is_all_day: isAllDay ? 1 : 0
            };
    
            Modal.confirm({
                title: "Cập nhật sự kiện lặp lại",
                width: 650,
                content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
                    h("div", { class: "mb-3" }, [
                        h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                            h("input", {
                                type: "radio",
                                name: "editOption",
                                value: "EDIT_1",
                                class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                onChange: (e) => {
                                    editOption.value = e.target.value;
                                },
                            }),
                            h("span", { class: "text-lg" }, "Chỉ cập nhật sự kiện này"),
                        ]),
                    ]),
                    h("div", { class: "mb-3" }, [
                        h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                            h("input", {
                                type: "radio",
                                name: "editOption",
                                value: "EDIT_1B",
                                class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                onChange: (e) => {
                                    editOption.value = e.target.value;
                                },
                            }),
                            h("span", { class: "text-lg" }, "Cập nhật sự kiện này và những sự kiện tiếp theo"),
                        ]),
                    ]),
                ]),
                okText: "Cập nhật",
                cancelText: "Hủy",
                onOk() {
                    if (!editOption.value) {
                        message.error("Vui lòng chọn tùy chọn cập nhật trước khi tiếp tục!");
                        info.revert();
                        return;
                    }
    
                    const payload = {
                        code: editOption.value,
                        updated_date: oldStart,
                        start_time: newStart,
                        end_time: newEnd,
                        id: info.event.id,
                        timezone_code: userTimezone,
                        is_all_day: isAllDay ? 1 : 0
                    };
    
                    handleUpdate(payload, info);
                },
                onCancel() {
                    info.revert();
                },
            });
        } else {
            const payload = {
                code: "EDIT_N",
                start_time: newStart,
                end_time: newEnd,
                id: info.event.id,
                timezone_code: userTimezone,
                is_all_day: isAllDay ? 1 : 0
            };
    
            await handleUpdate(payload, info);
        }
    };

    const eventResize = async (info) => {
        let oldStart = dayjs(info.oldEvent.start).format("YYYY-MM-DD HH:mm:ss");
        let oldEnd = info.oldEvent.end ? dayjs(info.oldEvent.end).format("YYYY-MM-DD HH:mm:ss") : null;
        let newStart = dayjs(info.event.start).format("YYYY-MM-DD HH:mm:ss");
        let newEnd = info.event.end ? dayjs(info.event.end).format("YYYY-MM-DD HH:mm:ss") : null;
    
        const isAllDay = info.event.allDay;
    
        if (isAllDay) {
            newEnd = dayjs(newStart).add(1, 'day').format("YYYY-MM-DD HH:mm:ss");
        }
    
        if (info.event.extendedProps.recurrence === 1) {
            selectedEvent.value = {
                id: info.event.id,
                updated_date: oldStart,
                start_time: newStart,
                end_time: newEnd,
                is_all_day: isAllDay ? 1 : 0
            };
    
            Modal.confirm({
                title: "Cập nhật thời gian sự kiện lặp lại",
                width: 650,
                content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, [
                    h("div", { class: "mb-3" }, [
                        h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                            h("input", {
                                type: "radio",
                                name: "editOption",
                                value: "EDIT_1",
                                class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                onChange: (e) => {
                                    editOption.value = e.target.value;
                                },
                            }),
                            h("span", { class: "text-lg" }, "Chỉ cập nhật sự kiện này"),
                        ]),
                    ]),
                    h("div", { class: "mb-3" }, [
                        h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                            h("input", {
                                type: "radio",
                                name: "editOption",
                                value: "EDIT_1B",
                                class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                onChange: (e) => {
                                    editOption.value = e.target.value;
                                },
                            }),
                            h("span", { class: "text-lg" }, "Cập nhật sự kiện này và những sự kiện tiếp theo"),
                        ]),
                    ]),
                ]),
                okText: "Cập nhật",
                cancelText: "Hủy",
                onOk() {
                    if (!editOption.value) {
                        message.error("Vui lòng chọn tùy chọn cập nhật trước khi tiếp tục!");
                        info.revert();
                        return;
                    }
    
                    const payload = {
                        code: editOption.value,
                        updated_date: oldStart,
                        start_time: newStart,
                        end_time: newEnd,
                        id: info.event.id,
                        timezone_code: userTimezone,
                        is_all_day: isAllDay ? 1 : 0
                    };
    
                    handleUpdate(payload, info);
                },
                onCancel() {
                    info.revert();
                },
            });
        } else {
            const payload = {
                code: "EDIT_N",
                start_time: newStart,
                end_time: newEnd,
                id: info.event.id,
                timezone_code: userTimezone,
                is_all_day: isAllDay ? 1 : 0
            };
    
            await handleUpdate(payload, info);
        }
    };

    return {
        eventDrop,
        eventResize,
    };
}

const handleUpdate = async (payload, info) => {
    try {
        const response = await axios.put(`${dirApi}tasks/${payload.id}/onDrag`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (response.status === 200) {
            message.success(response.data.message);
        } else {
            message.error("Có lỗi xảy ra, vui lòng thử lại.");
            info?.revert();
        }
    } catch (error) {
        console.error('❌ Lỗi:', error.response ? error.response.data : error);

        if (error.response) {
            if (error.response.status === 401) {
                message.error("Bạn không có quyền thực hiện thao tác này!");
                info?.revert();
            } else if (error.response.status === 500) {
                message.error(error.response.data.message);
                info?.revert();
            } else {
                message.error("Đã xảy ra lỗi khi cập nhật tác vụ. Vui lòng thử lại.");
                info?.revert();
            }
        } else {
            message.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
            info?.revert();
        }
    }
};

