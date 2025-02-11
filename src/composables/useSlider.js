import { ref } from 'vue';

const isCollapsed = ref(false);
export function useSlider() {
  const actionCollapse = (value) => {
    isCollapsed.value = value;
  };

  return {
    isCollapsed,
    actionCollapse,
  };
}
