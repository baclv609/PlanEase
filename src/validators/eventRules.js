export const eventRules = {
    title: [{ required: true, message: "Tiêu đề không được để trống", trigger: "blur" }],
    start: [{ required: true, type: "date", message: "Vui lòng chọn ngày bắt đầu", trigger: "change" }],
    end: [
        { type: "date", message: "Ngày kết thúc phải hợp lệ", trigger: "change" },
        {
            validator: (rule, value, callback, source) => {
                if (value && source.start && new Date(value) < new Date(source.start)) {
                    callback(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
                } else {
                    callback();
                }
            }, trigger: "change"
        }
    ],
    timezone: [{ required: true, message: "Múi giờ không hợp lệ", trigger: "change" }],
    category: [{ required: true, message: "Loại sự kiện không được để trống", trigger: "change" }],
    status: [{ required: true, message: "Trạng thái không hợp lệ", trigger: "change" }],
    color: [
        { pattern: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, message: "Mã màu không hợp lệ", trigger: "blur" }
    ],
    priority: [
        { type: "integer", min: 1, max: 5, message: "Mức độ ưu tiên phải từ 1 đến 5", trigger: "change" }
    ],
    notification_type: [{ required: true, message: "Vui lòng chọn phương thức thông báo", trigger: "change" }],
    notification_time: [
        { type: "integer", min: 1, message: "Thời gian gửi thông báo phải là số nguyên dương", trigger: "change" }
    ]
};
