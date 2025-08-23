import { defineStore } from 'pinia'
import api from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
  }),
  getters: {
    getUserInfo: (state) => state.userInfo,
  },
  actions: {
    async fetchUserInfo() {
      if (this.userInfo) {
        return this.userInfo;
      }
      try {
        const response = await api().get('/users/info');
        this.userInfo = response.data.result;
        return this.userInfo;
      } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
      }
    },
  },
});