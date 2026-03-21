// store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // 🔐 LOGIN
      login: async (data) => {
        try {
          set({ loading: true, error: null });

          const res = await api.post("/auth/login", data);
          
          if(res.data.success) {
            set({
              user: res.data.data?.user || null,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } else {
            // Handle error from backend - your controller returns error directly in res.data.error
            const errorMsg = res.data?.error || "Login failed";
            set({
              user: null,
              isAuthenticated: false,
              error: errorMsg,
              loading: false,
            });
            throw new Error(errorMsg);
          }
        } catch (err) {
          // Handle both axios error response and thrown errors
          const errorMsg = err.response?.data?.error || err.message || "Login failed";
          set({
            user: null,
            isAuthenticated: false,
            error: errorMsg,
            loading: false,
          });
          throw err;
        }
      },

      // 📝 SIGNUP
      signup: async (data) => {
        try {
          set({ loading: true, error: null });

          const res = await api.post("/auth/signup", data);
          
          if(res.data.success) {
            set({ 
              user: null, // User needs to login after signup
              isAuthenticated: false,
              loading: false,
              error: null,
            });
          } else {
            // Handle error from backend - your controller returns error directly in res.data.error
            const errorMsg = res.data?.error || "Signup failed";
            set({ 
              user: null,
              isAuthenticated: false,
              error: errorMsg, 
              loading: false,
            });
            throw new Error(errorMsg);
          }
        } catch (err) {
          // Handle both axios error response and thrown errors
          const errorMsg = err.response?.data?.error || err.message || "Signup failed";
          set({
            user: null,
            isAuthenticated: false,
            error: errorMsg,
            loading: false,
          });
          throw err;
        }
      },

      // 👤 GET CURRENT USER
      checkAuth: async () => {
        try {
          set({ loading: true, error: null });

          const res = await api.get("/auth/me");
          
          if(res.data.success) {
            set({
              user: res.data.data?.user || null,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: res.data?.error || "Not authenticated"
            });
          }
        } catch (err) {
          // If not authenticated, clear state without error
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: err, // Don't show error for checkAuth failures
          });
        }
      },

      // 🚪 LOGOUT
      logout: async () => {
        try {
          set({ loading: true });
          await api.post("/auth/logout", {}, { withCredentials: true });
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          // Always clear local state
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      },

      // Helper to clear error manually
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);