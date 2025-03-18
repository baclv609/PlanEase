export const recurringEventRules = {
  is_recurring: [{ type: "boolean", message: "Giá trị không hợp lệ", trigger: "change" }],
  repeat_type: [
      { validator: validateRepeatType, trigger: "change" }
  ],
  interval: [{ validator: validateInterval, trigger: "change" }],
  byweekday: [{ validator: validateByWeekday, trigger: "change" }],
  bymonthday: [{ validator: validateByMonthDay, trigger: "change" }],
  bysetpos: [{ validator: validateBySetPos, trigger: "change" }],
  bymonth: [{ validator: validateByMonth, trigger: "change" }],
  end_repeat_type: [{ validator: validateEndRepeatType, trigger: "change" }],
  count: [{ validator: validateCount, trigger: "change" }],
  until: [{ validator: validateUntilDate, trigger: "change" }]
};

//  1. Kiểm tra kiểu lặp (repeat_type)
function validateRepeatType(rule, value, callback, source) {
  if (source.is_recurring) {
      const validTypes = ["daily", "weekly", "monthly", "yearly"];
      if (!value || !validTypes.includes(value)) {
          return callback(new Error("Vui lòng chọn kiểu lặp hợp lệ"));
      }
  }
  callback();
}

//  2. Kiểm tra khoảng cách lặp (interval)
function validateInterval(rule, value, callback, source) {
  if (source.is_recurring) {
      if (!value || value < 1) {
          return callback(new Error("Khoảng cách lặp phải là số nguyên dương"));
      }
  }
  callback();
}

//  3. Kiểm tra ngày trong tuần (byweekday) cho weekly
function validateByWeekday(rule, value, callback, source) {
  if (source.is_recurring && source.repeat_type === "weekly") {
      if (!value || value.length === 0) {
          return callback(new Error("Vui lòng chọn ít nhất một ngày trong tuần"));
      }
  }
  callback();
}

//  4. Kiểm tra ngày trong tháng (bymonthday) cho monthly
function validateByMonthDay(rule, value, callback, source) {
  if (source.is_recurring && source.repeat_type === "monthly") {
      if (!value || value < 1 || value > 31) {
          return callback(new Error("Ngày trong tháng phải từ 1 đến 31"));
      }
  }
  callback();
}

//  5. Kiểm tra vị trí trong tháng (bysetpos) cho monthly
function validateBySetPos(rule, value, callback, source) {
  if (source.is_recurring && source.repeat_type === "monthly") {
      if (value !== undefined && (value < -1 || value > 5)) {
          return callback(new Error("Vị trí trong tháng phải từ -1 đến 5"));
      }
  }
  callback();
}

//  6. Kiểm tra tháng (bymonth) cho yearly
function validateByMonth(rule, value, callback, source) {
  if (source.is_recurring && source.repeat_type === "yearly") {
      if (!value || value < 1 || value > 12) {
          return callback(new Error("Tháng phải từ 1 đến 12"));
      }
  }
  callback();
}

// 7. Kiểm tra kiểu kết thúc lặp (end_repeat_type)
function validateEndRepeatType(rule, value, callback, source) {
  if (source.is_recurring) {
      const validEndTypes = ["count", "until"];
      if (!value || !validEndTypes.includes(value)) {
          return callback(new Error("Vui lòng chọn kiểu kết thúc lặp hợp lệ"));
      }
  }
  callback();
}

//  8. Kiểm tra số lần lặp (count) nếu chọn "count"
function validateCount(rule, value, callback, source) {
  if (source.is_recurring && source.end_repeat_type === "count") {
      if (!value || value < 1) {
          return callback(new Error("Số lần lặp phải là số nguyên dương"));
      }
  }
  callback();
}

// 9. Kiểm tra ngày kết thúc (until) nếu chọn "until"
function validateUntilDate(rule, value, callback, source) {
  if (source.is_recurring && source.end_repeat_type === "until") {
      if (!value || new Date(value) <= new Date(source.start)) {
          return callback(new Error("Ngày kết thúc phải sau ngày bắt đầu"));
      }
  }
  callback();
}
