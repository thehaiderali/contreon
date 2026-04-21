import { create } from 'zustand';
import { api } from '@/lib/api';

const useSubscriptionStore = create((set, get) => ({
  subscriptions: [],
  isLoading: false,
  error: null,

  hasAccess: (tierId) => {
    const { subscriptions } = get();
    return subscriptions.some(
      sub => sub.tierId === tierId && sub.status === 'active'
    );
  },
  hasAccessToCreator: (creatorId) => {
    const { subscriptions } = get();
    return subscriptions.some(
      sub => sub.creatorId === creatorId && sub.status === 'active'
    );
  },

  getSubscriptionByTierId: (tierId) => {
    const { subscriptions } = get();
    return subscriptions.find(sub => sub.tierId === tierId);
  },

  fetchMySubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/subscriptions/my');
      set({ subscriptions: response.data.data.subscriptions, isLoading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch subscriptions',
        isLoading: false 
      });
      throw error;
    }
  },

  createSubscription: async (membershipId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/subscriptions/create', { membershipId });
      if (response.data.data?.subscription) {
        set((state) => ({ 
          subscriptions: [...state.subscriptions, response.data.data.subscription],
          isLoading: false 
        }));
      }
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to create subscription',
        isLoading: false 
      });
      throw error;
    }
  },

  cancelSubscription: async (subscriptionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/subscriptions/cancel/${subscriptionId}`);
      set((state) => ({
        subscriptions: state.subscriptions.map(sub => 
          sub._id === subscriptionId 
            ? { ...sub, status: 'cancelled', cancelDate: new Date(), autoRenew: false }
            : sub
        ),
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Failed to cancel subscription',
        isLoading: false 
      });
      throw error;
    }
  },
  updateSubscription: (subscriptionId, updates) => {
    set((state) => ({
      subscriptions: state.subscriptions.map(sub =>
        sub._id === subscriptionId ? { ...sub, ...updates } : sub
      )
    }));
  },

  clearSubscriptions: () => {
    set({ subscriptions: [], error: null });
  }
}));

export default useSubscriptionStore;