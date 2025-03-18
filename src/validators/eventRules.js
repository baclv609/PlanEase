export const eventRules = {
    title: [
        { required: true, message: "Tiêu đề không được để trống", trigger: "blur" },
        { min: 5, max: 100, message: "Tiêu đề phải từ 5 đến 100 ký tự", trigger: "blur" }
    ],
    start: [
        { required: true, message: "Vui lòng chọn ngày bắt đầu", trigger: "change" },
        { validator: (rule, value, callback) => {
            if (!value || isNaN(Date.parse(value))) {
                callback(new Error("Ngày bắt đầu không hợp lệ"));
            } else {
                callback();
            }
        }, trigger: "change" }
    ],
    end: [
        { validator: (rule, value, callback, source) => {
            if (value && source.start && new Date(value) <= new Date(source.start)) {
                callback(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
            } else {
                callback();
            }
        }, trigger: "change" }
    ],
    timezone: [{ required: true, message: "Múi giờ không hợp lệ", trigger: "change" }],
    category: [{ required: true, message: "Loại sự kiện không được để trống", trigger: "change" }],
    status: [{ required: true, message: "Trạng thái không hợp lệ", trigger: "change" }],
    color: [
        { pattern: /^#([0-9A-Fa-f]{6})$/, message: "Mã màu không hợp lệ", trigger: "blur" }
    ],
    priority: [
        { type: "integer", min: 1, max: 5, message: "Mức độ ưu tiên phải từ 1 đến 5", trigger: "change" }
    ],
    notification_type: [{ required: true, message: "Vui lòng chọn phương thức thông báo", trigger: "change" }],
    notification_time: [
        { type: "integer", min: 1, message: "Thời gian gửi thông báo phải là số nguyên dương", trigger: "change" }
    ],
    attendees: [
        { type: "array", message: "Danh sách người tham gia không hợp lệ", trigger: "blur" },
        { validator: (rule, value, callback) => {
            if (value && !value.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
                callback(new Error("Email người tham gia không hợp lệ"));
            } else {
                callback();
            }
        }, trigger: "blur" }
    ],
    googleMeetLink: [
        { validator: (rule, value, callback) => {
            if (value && !/^https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+$/.test(value)) {
                callback(new Error("Đường dẫn Google Meet không hợp lệ"));
            } else {
                callback();
            }
        }, trigger: "blur" }
    ]
};
