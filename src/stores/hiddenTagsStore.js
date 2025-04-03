import { defineStore } from "pinia";
import { ref } from "vue";

export const useHiddenTagsStore = defineStore("hiddenTags", () => {
  const hiddenTags = ref([]); 

  // Cập nhật danh sách tag bị ẩn
  const setHiddenTags = (tags) => {
    hiddenTags.value = tags;
    // console.log("Store cập nhật hiddenTags:", hiddenTags.value);
  };

  return {
    hiddenTags,
    setHiddenTags,
  };
});
