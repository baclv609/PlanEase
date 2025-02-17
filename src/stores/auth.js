import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const user = ref({ avatar: '', name: '' });

  const token = ref(localStorage.getItem('token') || '');
  const router = useRouter();

  const isAuthenticated = computed(() => !!token.value);

  const setUser = (userData, userToken) => {
    user.value = userData;
    token.value = userToken;
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    user.value = null;
    token.value = '';
    localStorage.removeItem('token');
    router.push('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    logout,
  };
});
