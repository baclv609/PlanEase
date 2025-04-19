import dayjs from 'dayjs';

let formState = null;
export const setFormState = (state) => {
    formState = state;
};

export const eventRules = (t) => ({
    title: [
        { required: true, message: t('validation.title.required'), trigger: "blur" },
        { min: 3, message: t('validation.title.min'), trigger: "blur" },
        { max: 255, message: t('validation.title.max'), trigger: "blur" },
    ],
    start: [
        { required: true, message: t('validation.time.required'), trigger: "change" },
        {
          validator: (_, value) => {
            if (!value) {
              return Promise.reject(t('validation.time.required'));
            }
            return Promise.resolve();
          },
          trigger: "change"
        }
    ],
    end: [
        {
          required: true,
          message: t('validation.time.required'),
          trigger: 'change',
        },
        {
          validator: (_, value) => {
            // Kiểm tra nếu không có giá trị nào được chọn
            if (!value) {
              return Promise.reject(t('validation.time.required'));
            }
      
            const start = formState?.value?.start;
            // Kiểm tra nếu "start" có giá trị và "end" trước "start"
            if (start && dayjs(value).isBefore(dayjs(start))) {
              return Promise.reject(t('validation.time.start_after_end'));
            }
      
            return Promise.resolve();
          },
          trigger: 'change',
        },
      ],
    location: [
        { max: 255, message: t('validation.locationMaxLength'), trigger: "blur" }
    ],
    link: [
        {
            validator: (_, value) => {
              if (!value) return Promise.resolve(); // optional field
              const urlRegex = /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(:\d+)?(\/[\w-./?%&=]*)?$/;
              if (!urlRegex.test(value)) {
                return Promise.reject(t('validation.linkInvalid'));
              }
              return Promise.resolve();
            },
            trigger: 'blur',
        }
    ],
    description: [
        { max: 1000, message: t('validation.descriptionMaxLength'), trigger: "blur" }
    ],
    attendees: [
        {
            validator: (_, value) => {
                if (value && value.length > 10) {
                    return Promise.reject(t('validation.attendees.max'));
                }
                return Promise.resolve();
            },
            trigger: "change"
        }
    ]
});
