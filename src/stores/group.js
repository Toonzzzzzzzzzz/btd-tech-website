import { defineStore } from 'pinia'
import api from '@/api'

export const useGroupStore = defineStore('group', {
  state: () => ({
    groupInfo: null,
  }),
  getters: {
    getGroupInfo: (state) => state.groupInfo,
  },
  actions: {
    async fetchGroupInfo() {
      if (this.groupInfo) {
        return this.groupInfo;
      }
      try {
        const response = await api().get('/groups/info');
        this.groupInfo = response.data.result;
        return this.groupInfo;
      } catch (error) {
        console.error('Error fetching group info:', error);
        throw error;
      }
    },
  },
});