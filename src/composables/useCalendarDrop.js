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
        let newStart = dayjs(info.event.start).format("YYYY-MM-DD HH:mm:ss");
        let endEvent = info.event.end ? dayjs(info.event.end).format("YYYY-MM-DD HH:mm:ss") : null;


        console.log("New Start Time:", newStart);

        console.log("New End Time:", endEvent);


        if (info.event.extendedProps.recurrence === 1) {
            selectedEvent.value = {
                id: info.event.id,
                start_time: newStart,
                end_time: endEvent
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
                                onInput: (e) => {
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
                                onInput: (e) => {
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
                    const payload = {
                        code: editOption.value,
                        start_time: newStart,
                        end_time: endEvent,
                        id: info.event.id,
                        timezone_code: userTimezone
                    };
                    console.log("Payload: ", payload);


                    handleUpdate(payload);
                },
                onCancel() {
                    info.revert();
                },
            });
        } else {
            await handleUpdate({
                code: "EDIT_N",
                start_time: newStart,
                end_time: endEvent,
                id: info.event.id,
                timezone_code: userTimezone
            });
        }
    };

    return {
        eventDrop,
    };
}

 const handleUpdate = async (payload) => {
    try {
        const response = await axios.put(`${dirApi}tasks/${payload.id}/onDrag`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        console.log("✅ Success:", response.data);

        message.success("Cập nhật tác vụ thành công 🤡");
    } catch (error) {
        console.error('❌ Lỗi:', error.response ? error.response.data : error);
        message.error("Đã xảy ra lỗi khi cập nhật tác vụ. Vui lòng thử lại.");
    }
};