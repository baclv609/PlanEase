export const recurringEventRules = {
    is_repeat: [
        { type: "boolean", message: "Giá trị không hợp lệ", trigger: "change" }
    ],
    rrule: {
        freq: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat) {
                        const validTypes = ["daily", "weekly", "monthly", "yearly"];
                        if (!value || !validTypes.includes(value)) {
                            callback(new Error("Vui lòng chọn kiểu lặp hợp lệ"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ],
        interval: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat) {
                        if (!value || value < 1) {
                            callback(new Error("Khoảng cách lặp phải là số nguyên dương"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ],
        byweekday: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat && source.rrule.freq === "weekly") {
                        if (!value || value.length === 0) {
                            callback(new Error("Vui lòng chọn ít nhất một ngày trong tuần"));
                            return;
                        }
                        const validDays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
                        if (!value.every(day => validDays.includes(day))) {
                            callback(new Error("Ngày trong tuần không hợp lệ"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ],
        bymonthday: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat && source.rrule.freq === "monthly") {
                        if (!value || value.length === 0) {
                            callback(new Error("Vui lòng chọn ít nhất một ngày trong tháng"));
                            return;
                        }
                        if (!value.every(day => day >= 1 && day <= 31)) {
                            callback(new Error("Ngày trong tháng phải từ 1 đến 31"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ],
        endType: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat) {
                        const validEndTypes = ["", "until", "count"];
                        if (!validEndTypes.includes(value)) {
                            callback(new Error("Kiểu kết thúc không hợp lệ"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ],
        count: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat && source.rrule.endType === "count") {
                        if (!value || value < 1) {
                            callback(new Error("Số lần lặp phải là số nguyên dương"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ],
        until: [
            { 
                validator: (rule, value, callback, source) => {
                    if (source.is_repeat && source.rrule.endType === "until") {
                        if (!value) {
                            callback(new Error("Vui lòng chọn ngày kết thúc"));
                            return;
                        }
                        if (value.isBefore(source.start)) {
                            callback(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
                            return;
                        }
                    }
                    callback();
                }, 
                trigger: "change" 
            }
        ]
    },
    exclude_time: [
        {
            validator: (rule, value, callback) => {
                if (value && !Array.isArray(value)) {
                    callback(new Error("Danh sách ngày loại trừ không hợp lệ"));
                    return;
                }
                callback();
            },
            trigger: "change"
        }
    ]
};
