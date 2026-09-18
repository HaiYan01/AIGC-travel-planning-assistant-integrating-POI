import { create } from 'zustand';
import { api } from './http';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {
      // 会话失效时同时清除本地存储,避免失效 token 被反复携带
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  }
}));

export const usePlanStore = create((set) => ({
  currentPlan: null,
  myPlans: [],
  communityPlans: [],
  loading: false,

  generatePlan: async (params) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/plans/generate', params, { timeout: 200000 });
      set({ currentPlan: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchMyPlans: async () => {
    const { data } = await api.get('/plans/my');
    set({ myPlans: data });
  },

  fetchPlan: async (id) => {
    const { data } = await api.get(`/plans/${id}`);
    set({ currentPlan: data });
    return data;
  },

  fetchCommunityPlans: async (params) => {
    const { data } = await api.get('/community/plans', { params });
    set({ communityPlans: data.data });
    return data;
  },

  likePlan: async (id) => {
    const { data } = await api.post(`/community/plans/${id}/like`);
    return data;
  },

  copyPlan: async (id) => {
    const { data } = await api.post(`/plans/${id}/copy`);
    return data;
  },

  deletePlan: async (id) => {
    await api.delete(`/plans/${id}`);
    set((state) => ({ myPlans: state.myPlans.filter((p) => p.id !== id) }));
  },

  updatePlan: async (id, updates) => {
    const { data } = await api.put(`/plans/${id}`, updates);
    return data;
  }
}));

export const useChatStore = create((set, get) => ({
  messages: [],
  loading: false,

  sendMessage: async (content, context) => {
    const messages = [...get().messages, { role: 'user', content }];
    set({ messages, loading: true });

    try {
      const payload = { messages };
      if (context?.planId) {
        payload.planId = context.planId;
      } else if (context) {
        payload.context = context;
      }
      
      const { data } = await api.post('/ai/chat', payload, { timeout: 200000 });
      set({
        messages: [...messages, { role: 'assistant', content: data.message }],
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearMessages: () => set({ messages: [] }),

  sendMessageWithHistory: async (content) => {
    const messages = [...get().messages, { role: 'user', content }];
    set({ messages, loading: true });

    try {
      // 获取用户的所有行程
      const { data: plans } = await api.get('/plans/my');
      
      // 获取每个行程的详细信息
      const plansWithDetails = await Promise.all(
        plans.map(async (plan) => {
          try {
            const { data } = await api.get(`/plans/${plan.id}`);
            return data;
          } catch {
            return plan;
          }
        })
      );

      const payload = {
        messages,
        plansHistory: plansWithDetails
      };
      
      const { data } = await api.post('/ai/chat', payload, { timeout: 200000 });
      set({
        messages: [...messages, { role: 'assistant', content: data.message }],
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  }
}));
