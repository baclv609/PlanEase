export const recurringEventRules = {
    is_recurring: [{ type: "boolean", message: "Giá trị không hợp lệ", trigger: "change" }],
    repeat_type: [
      { required: true, message: "Vui lòng chọn kiểu lặp", trigger: "change" },
      { type: "enum", enum: ["daily", "weekly", "monthly", "yearly"], message: "Kiểu lặp không hợp lệ", trigger: "change" }
    ],
    interval: [
      { type: "integer", min: 1, message: "Khoảng cách lặp phải là số nguyên dương", trigger: "change" }
    ],
    byweekday: [
      { validator: (rule, value, callback, source) => {
          if (source.repeat_type === "weekly" && (!value || value.length === 0)) {
            callback(new Error("Vui lòng chọn ít nhất một ngày trong tuần"));
          } else {
            callback();
          }
        }, trigger: "change"
      }
    ],
    bymonthday: [
      { validator: (rule, value, callback, source) => {
          if (source.repeat_type === "monthly" && (value < 1 || value > 31)) {
            callback(new Error("Ngày trong tháng phải từ 1 đến 31"));
          } else {
            callback();
          }
        }, trigger: "change"
      }
    ],
    bysetpos: [
      { validator: (rule, value, callback, source) => {
          if (source.repeat_type === "monthly" && (value < -1 || value > 5)) {
            callback(new Error("Vị trí trong tháng phải từ -1 đến 5"));
          } else {
            callback();
          }
        }, trigger: "change"
      }
    ],
    bymonth: [
      { validator: (rule, value, callback, source) => {
          if (source.repeat_type === "yearly" && (value < 1 || value > 12)) {
            callback(new Error("Tháng phải từ 1 đến 12"));
          } else {
            callback();
          }
        }, trigger: "change"
      }
    ],
    end_repeat_type: [
      { required: true, message: "Vui lòng chọn kiểu kết thúc lặp", trigger: "change" }
    ],
    count: [
      { type: "integer", min: 1, message: "Số lần lặp phải là số nguyên dương", trigger: "change" }
    ],
    until: [
      { validator: (rule, value, callback, source) => {
          if (source.end_repeat_type === "until" && (!value || new Date(value) <= new Date(source.start))) {
            callback(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
          } else {
            callback();
          }
        }, trigger: "change"
      }
    ]
  };
  