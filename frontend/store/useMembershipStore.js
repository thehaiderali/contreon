import { create } from "zustand";
import { api } from "@/lib/api";


export const useMembershipStore = create((set, get) => ({
  memberships: [],   
  loading: false,
  error: null,

  fetchMemberships: async () => {
    try {
      set({ loading: true, error: null });

      const res = await api.get("/api/subscriptions/my"); 
      if(res.data.success){
         set({ memberships: res.data.data.subscriptions, loading: false });
      }  
     
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  hasAccess:(membershipId)=>{
    const memberships=get().memberships
    for (const m of memberships){
        if(m._id===membershipId){
            return true
        }
    }
    return false
  }

}));