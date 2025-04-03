import { ref, computed } from 'vue';

export function useTagFilter() {
  const hiddenTagIds = ref([]); // Lưu trữ các tag_id cần ẩn
  const events = ref([]); // Lưu trữ tất cả sự kiện
  const transformedEvents = ref([]);

  // Computed property để lấy các sự kiện đã được lọc
  const filteredEvents = computed(() => {
    return events.value.filter((event) => {
      // Nếu event.tag_id nằm trong danh sách cần ẩn -> ẩn đi
      if (event.tag_id === null && hiddenTagIds.value.includes('null')) {
        return false;
      }
      if (event.tag_id !== null && hiddenTagIds.value.includes(event.tag_id)) {
        return false;
      }
      return true;
    });
  });

  // Hàm để set danh sách sự kiện
  const setEvents = (newEvents) => {
    events.value = newEvents;
  };

  // Hàm chính để lọc sự kiện theo danh sách tag_id
  const filterByTags = (tagsToHide) => {
    if (!Array.isArray(tagsToHide)) return;
    hiddenTagIds.value = tagsToHide.map(tag => (tag === 'null' ? 'null' : Number(tag)));
  };

  // Cập nhật transformedEvents dựa trên filterByTags
  const updateTransformedEvents = () => {
    transformedEvents.value = events.value.filter(event => 
      event.tag_id !== null && typeof event.tag_id === 'number' && !hiddenTagIds.value.includes(event.tag_id)
    );
  };

  // Hàm lọc dữ liệu dựa trên danh sách ẩn và trả về các sự kiện bị ẩn
  const getHiddenEvents = (tagsToHide = []) => {
    if (!Array.isArray(tagsToHide) || tagsToHide.length === 0) {
      return [];
    }
    const tagsToFilter = tagsToHide.map(tag => (tag === 'null' ? 'null' : Number(tag)));
    return events.value.filter(event => 
      (event.tag_id === null && tagsToFilter.includes('null')) ||
      (event.tag_id !== null && tagsToFilter.includes(event.tag_id))
    );
  };

  return {
    filteredEvents,
    setEvents,
    filterByTags,
    updateTransformedEvents,
    transformedEvents,
    getHiddenEvents,
  };
}
