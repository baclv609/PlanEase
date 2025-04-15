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


export function useCalendarDrop(t) {
    // Check event has attendees
    const checkHasAteendees = (attendees) => {
        console.log(attendees)
        if (!attendees || attendees.length === 0) {
            return true;
        }
    
        return new Promise((resolve) => {
            Modal.confirm({
                title: t('eventModal.messages.sendEmail.title'),
                content: t('eventModal.messages.sendEmail.content'),
                centered: true,
                width: 600,
                okButtonProps: { style: { display: 'none' } },
                cancelButtonProps: { style: { display: 'none' } },
                footer: () =>
                    h("div", { class: "w-full flex justify-end space-x-4 p-4" }, [
                        h(
                            "button",
                            {
                                class: "text-gray-500 hover:text-gray-700 border-0 px-4 py-2 cursor-pointer font-semibold rounded-lg transition duration-200 text-sm",
                                onClick: () => {
                                    Modal.destroyAll();
                                    resolve("back");
                                },
                            },
                            t('eventModal.messages.sendEmail.back')
                        ),
                        h(
                            "button",
                            {
                                class: "text-red-500 hover:text-red-700 border-0 rounded-lg px-4 py-2 cursor-pointer font-semibold transition duration-200 text-sm",
                                onClick: () => {
                                    Modal.destroyAll();
                                    resolve("no");
                                },
                            },
                            t('eventModal.messages.sendEmail.dontSend')
                        ),
                        h(
                            "button",
                            {
                                class: "text-blue-500 hover:text-blue-700 hover:bg-gray-200 rounded-lg px-4 py-2 cursor-pointer font-semibold border-0 transition duration-200 text-sm",
                                onClick: () => {
                                    Modal.destroyAll();
                                    resolve("yes");
                                },
                            },
                            t('eventModal.messages.sendEmail.send')
                        ),
                    ]),
            });
        });
    }


    const eventDrop = async (info) => {
        const taskTimezone = info.event.extendedProps.timezone;
        
        // Chuyển đổi thời gian sang UTC trước khi lưu
        let oldStart = dayjs(info.oldEvent.start).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss");
        let oldEnd = info.oldEvent.end ? dayjs(info.oldEvent.end).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss") : null;
        let newStart = dayjs(info.event.start).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss");
        let newEnd = info.event.end ? dayjs(info.event.end).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss") : null;
    
        const isAllDay = info.event.allDay;

        console.log("Task timezone:", taskTimezone);
        console.log("Converted times:", { oldStart, oldEnd, newStart, newEnd });
        
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
                title: t('options.recurrence.edit.title'),
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
                                onChange: (e) => {
                                    editOption.value = e.target.value;
                                },
                            }),
                            h("span", { class: "text-lg" }, t('options.recurrence.edit.follow')),
                        ]),
                        
                    ]),
                ]),
                okText: t('options.recurrence.edit.update'),
                cancelText: t('options.recurrence.edit.cancel'),
                onOk: async () => {
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
                        timezone_code: taskTimezone,
                        is_all_day: isAllDay ? 1 : 0
                    };

                    // Check if the event has attendees
                    const choice = await checkHasAteendees(info.event.extendedProps.attendees);
                    if (choice === "back") {
                        info.revert();
                        return // Dừng lại, không làm gì nữa
                    }
                    payload.sendMail = choice;
    
                    // Thêm log để debug payload
                    console.log('Payload:', payload);

                    handleUpdate(payload, info);
                },
                onCancel() {
                    info.revert();
                },
            });
        } else {
            Modal.confirm({
                title: "Xác nhận thay đổi",
                content: "Bạn có chắc chắn muốn thay đổi thời gian của sự kiện này?",
                okText: t('options.recurrence.edit.update'),
                cancelText: t('options.recurrence.edit.cancel'),
                onOk: async () => {
                    const payload = {
                        code: "EDIT_N",
                        start_time: newStart,
                        end_time: newEnd,
                        id: info.event.id,
                        timezone_code: taskTimezone,
                        is_all_day: isAllDay ? 1 : 0
                    };
                    
                    const choice = await checkHasAteendees(info.event.extendedProps.attendees);
                    if (choice === "back") {
                        info.revert();
                        return;
                    }
                    payload.sendMail = choice;

                    await handleUpdate(payload, info);
                },
                onCancel() {
                    info.revert();
                }
            });
        }
    };

    const eventResize = async (info) => {
        const taskTimezone = info.event.extendedProps.timezone;
        
        // Chuyển đổi thời gian sang UTC trước khi lưu
        let oldStart = dayjs(info.oldEvent.start).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss");
        let oldEnd = info.oldEvent.end ? dayjs(info.oldEvent.end).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss") : null;
        let newStart = dayjs(info.event.start).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss");
        let newEnd = info.event.end ? dayjs(info.event.end).tz(taskTimezone).format("YYYY-MM-DD HH:mm:ss") : null;
    
        const isAllDay = info.event.allDay;
        const isFirstEvent = !info.event.extendedProps.parent_id;

        console.log("Task timezone:", taskTimezone);
        console.log("Converted times:", { oldStart, oldEnd, newStart, newEnd });
    
        if (info.event.extendedProps.recurrence === 1) {
            selectedEvent.value = {
                id: info.event.id,
                updated_date: oldStart,
                start_time: newStart,
                end_time: newEnd,
                is_all_day: isAllDay ? 1 : 0
            };
    
            const modalOptions = [
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
                            onChange: (e) => {
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
                            onChange: (e) => {
                                editOption.value = e.target.value;
                            },
                        }),
                        h("span", { class: "text-lg" }, t('options.recurrence.edit.all')),
                    ]),
                ])
            ];
    
            if (!isFirstEvent) {
                modalOptions.push(
                    h("div", { class: "mb-3" }, [
                        h("label", { class: "flex items-center space-x-4 cursor-pointer" }, [
                            h("input", {
                                type: "radio",
                                name: "editOption",
                                value: "EDIT_A",
                                class: "form-radio w-5 h-5 text-blue-600 cursor-pointer",
                                onChange: (e) => {
                                    editOption.value = e.target.value;
                                },
                            }),
                            h("span", { class: "text-lg" }, t('options.recurrence.edit.all')),
                        ]),
                    ])
                );
            }
    
            Modal.confirm({
                title: t('options.recurrence.edit.title'),
                width: 650,
                content: h("div", { class: "p-4 rounded-md border bg-white flex flex-col justify-center" }, modalOptions),
                okText: t('options.recurrence.edit.update'),
                cancelText: t('options.recurrence.edit.cancel'),
                onOk: async () => {
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
                        timezone_code: taskTimezone,
                        is_all_day: isAllDay ? 1 : 0
                    };

                    // Check if the event has attendees
                    const choice = await checkHasAteendees(info.event.extendedProps.attendees);
                    if (choice === "back") {
                        info.revert();
                        return // Dừng lại, không làm gì nữa
                    }
                    payload.sendMail = choice;
    
                    console.log('Payload:', payload);

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
                timezone_code: taskTimezone,
                is_all_day: isAllDay ? 1 : 0
            };

            const choice = await checkHasAteendees(info.event.extendedProps.attendees);
            if (choice === "back") {
                info.revert();
                return // Dừng lại, không làm gì nữa
            }
            payload.sendMail = choice;

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
        // Thêm log để debug request
        console.log('Request payload:', payload);

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
        console.error('❌ Error details:', error.response?.data || error);

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

