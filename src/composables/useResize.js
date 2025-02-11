import { onMounted, onUnmounted, ref } from 'vue';

const hasMobile = ref(false);
const width = ref(window.innerWidth);
export function useResize() {
  const handleResize = () => {
    width.value = window.innerWidth;
    hasMobile.value = window.innerWidth < 768;
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    hasMobile,
    width,
  };
}
