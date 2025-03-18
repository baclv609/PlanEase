import dayjs from 'dayjs';

let formState = null;

export const setFormState = (state) => {
    formState = state;
};

export const eventRules = {
    title: [
        { required: true, message: "Tiêu đề không được để trống", trigger: "blur" },
        { min: 3, message: "Tiêu đề phải có ít nhất 3 ký tự", trigger: "blur" },
    ],
    start: [
        { required: true, message: "Vui lòng chọn thời gian bắt đầu", trigger: "change" }
    ],
    end: [
        { required: true, message: "Vui lòng chọn thời gian kết thúc", trigger: "change" },
        {
            validator: (_, value) => {
                if (!value || !formState?.start) {
                    return Promise.resolve();
                }
                const startTime = dayjs(formState.start);
                const endTime = dayjs(value);
                if (endTime.isBefore(startTime)) {
                    return Promise.reject("Thời gian kết thúc phải sau thời gian bắt đầu");
                }
                return Promise.resolve();
            },
            trigger: "change",
        }
    ],
    timezone_code: [
        { required: true, message: "Vui lòng chọn múi giờ", trigger: "change" }
    ],
    type: [
        { required: true, message: "Vui lòng chọn loại sự kiện", trigger: "change" }
    ],
    color_code: [
        { required: true, message: "Vui lòng chọn màu", trigger: "change" }
    ],
    location: [
        { max: 255, message: "Địa điểm không được vượt quá 255 ký tự", trigger: "blur" }
    ],
    url: [
        {
            pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
            message: "URL không hợp lệ",
            trigger: "blur"
        }
    ],
    description: [
        { max: 1000, message: "Nội dung không được vượt quá 1000 ký tự", trigger: "blur" }
    ],
    attendees: [
        {
            validator: (_, value) => {
                if (value && value.length > 10) {
                    return Promise.reject("Không thể thêm quá 10 khách mời");
                }
                return Promise.resolve();
            },
            trigger: "change"
        }
    ]
};
