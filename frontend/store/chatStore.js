import { create } from 'zustand';
import { api } from '@/lib/api';
import io from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  socket: null,
  isConnected: false,
  typingUsers: new Set(),

  initSocket: () => {
    const existing = get().socket;
    if (existing) return existing;

    const socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      set({ isConnected: true });

      const { user } = useAuthStore.getState();
      if (user?._id) {
        socket.emit('join', user._id);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connect error:', error.message);
      set({ isConnected: false });
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      set({ isConnected: false });
    });

    socket.on('new-message', (message) => {
      const { currentConversation, messages } = get();

      if (currentConversation?._id === message.conversationId) {
        set({ messages: [...messages, message] });
      }

      get().fetchConversations();
    });

    socket.on('user-typing', ({ userId, isTyping }) => {
      set((state) => {
        const updated = new Set(state.typingUsers);

        if (isTyping) updated.add(userId);
        else updated.delete(userId);

        return { typingUsers: updated };
      });
    });

    socket.on('messages-read', ({ conversationId, readBy }) => {
      const { currentConversation } = get();

      if (currentConversation?._id === conversationId) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.senderId?._id !== readBy ? { ...msg, read: true } : msg
          ),
        }));
      }

      get().fetchConversations();
    });

    socket.on('message-notification', () => {
      get().fetchConversations();
    });

    set({ socket });
    return socket;
  },

  fetchConversations: async () => {
    try {
      const response = await api.get('/chat/conversations');

      if (response.data.success) {
        const conversations = response.data.data;

        set({ conversations });

        const { user } = useAuthStore.getState();

        const totalUnread = conversations.reduce((sum, conv) => {
          const count = conv.unreadCount?.[user?._id] || 0;
          return sum + count;
        }, 0);

        set({ unreadCount: totalUnread });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);

      if (response.data.success) {
        set({ messages: response.data.data });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  getOrCreateConversation: async (otherUserId) => {
    try {
      const response = await api.post('/chat/conversations', { otherUserId });

      if (response.data.success) {
        await get().fetchConversations();
        return response.data.data;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  },

  sendMessage: (conversationId, receiverId, content) => {
    const { socket } = get();

    if (socket && content.trim()) {
      socket.emit('send-message', {
        conversationId,
        receiverId,
        content,
      });
    }
  },

  joinConversation: (conversationId) => {
    const { socket, conversations } = get();

    if (socket) {
      socket.emit('join-conversation', conversationId);

      set({
        currentConversation:
          conversations.find((c) => c._id === conversationId) || null,
      });
    }
  },

  leaveConversation: (conversationId) => {
    const { socket } = get();

    if (socket) {
      socket.emit('leave-conversation', conversationId);
      set({ currentConversation: null, messages: [] });
    }
  },

  sendTyping: (conversationId, receiverId, isTyping) => {
    const { socket } = get();

    if (socket) {
      socket.emit('typing', {
        conversationId,
        receiverId,
        isTyping,
      });
    }
  },

  markAsRead: (conversationId, senderId) => {
    const { socket } = get();

    if (socket) {
      socket.emit('mark-read', {
        conversationId,
        senderId,
      });
    }
  },

  disconnect: () => {
    const { socket } = get();

    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
      });
    }
  },
}));

export default useChatStore;