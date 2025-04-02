import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHiddenTagsStore = defineStore('hiddenTags', () => {
  // State
  const hiddenTagIds = ref([]);

  // Actions
  const addHiddenTag = (tagId) => {
    if (!hiddenTagIds.value.includes(tagId)) {
      hiddenTagIds.value.push(tagId);
    }
  };

  const removeHiddenTag = (tagId) => {
    hiddenTagIds.value = hiddenTagIds.value.filter(id => id !== tagId);
  };

  const setHiddenTags = (tags) => {
    hiddenTagIds.value = tags;
  };

  const clearHiddenTags = () => {
    hiddenTagIds.value = [];
  };

  // Getters
  const getHiddenTags = () => {
    return hiddenTagIds.value;
  };

  const isTagHidden = (tagId) => {
    return hiddenTagIds.value.includes(tagId);
  };

  return {
    // State
    hiddenTagIds,
    
    // Actions
    addHiddenTag,
    removeHiddenTag,
    setHiddenTags,
    clearHiddenTags,
    
    // Getters
    getHiddenTags,
    isTagHidden
  };
}); 