import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from 'dayjs';

export const useFilterStore = defineStore("filter", () => {
  // State
  const filters = ref({
    type: null,
    is_private: null,
    dateRange: null,
    excludedStartTime: null,
    excludedEndTime: null,
    selectedTagIds: []
  });

  // Getters
  const activeFilters = computed(() => {
    return Object.entries(filters.value).filter(([key, value]) => {
      if (key === 'selectedTagIds') {
        return value.length > 0;
      }
      return value !== null;
    });
  });

  // Actions
  const updateFilter = (key, value) => {
    console.log(`Updating filter ${key} to:`, value);
    filters.value[key] = value;
  };

  const updateSelectedTags = (tagIds) => {
    console.log('Updating selected tags:', tagIds);
    filters.value.selectedTagIds = tagIds;
  };

  const resetFilters = () => {
    console.log('Resetting all filters');
    filters.value = {
      type: null,
      is_private: null,
      dateRange: null,
      excludedStartTime: null,
      excludedEndTime: null,
      selectedTagIds: []
    };
  };

  return {
    filters,
    activeFilters,
    updateFilter,
    updateSelectedTags,
    resetFilters
  };
}); 