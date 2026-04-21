import { api } from '@/lib/api';
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return;
    
    console.log("[chat/socket] connecting", { hasToken: Boolean(token) });
    const options = {
      withCredentials: true
    };
    if (token) {
      options.auth = { token };
    }
    this.socket = io('http://localhost:3000', options);
    
    this.socket.on('connect', () => {
      console.log('[chat/socket] connected', {
        id: this.socket?.id,
        connected: this.socket?.connected
      });
    });
    
    this.socket.on('new_message', (data) => {
      console.log('[chat/socket] received new_message', data);
      this.notifyListeners('new_message', data);
    });
    
    this.socket.on('user_typing', (data) => {
      console.log('[chat/socket] received user_typing', data);
      this.notifyListeners('user_typing', data);
    });

    this.socket.on('user_online_status', (data) => {
      console.log('[chat/socket] received user_online_status', data);
      this.notifyListeners('user_online_status', data);
    });

    this.socket.on('online_users', (data) => {
      console.log('[chat/socket] received online_users', data);
      this.notifyListeners('online_users', data);
    });

    this.socket.on('message_sent', (data) => {
      console.log('[chat/socket] received message_sent ack', data);
      this.notifyListeners('message_sent', data);
    });

    this.socket.on('message_error', (data) => {
      console.error('[chat/socket] received message_error', data);
      this.notifyListeners('message_error', data);
    });
    
    this.socket.on('disconnect', () => {
      console.log('[chat/socket] disconnected', {
        id: this.socket?.id
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Optional socket send (REST sendMessage is primary)
  sendMessageSocket(receiverId, content) {
    if (this.socket) {
      console.log('[chat/socket] emit send_message', { receiverId, contentLength: content?.length || 0 });
      this.socket.emit('send_message', { receiverId, content });
    }
  }

  // Send typing status
  sendTyping(receiverId, isTyping) {
    if (this.socket) {
      console.log('[chat/socket] emit typing', { receiverId, isTyping });
      this.socket.emit('typing', { receiverId, isTyping });
    }
  }
  // Get all subscribers for a creator
async getSubscribers() {
  const response = await api.get('/chat/creator/subscribers');
  return response.data;
}

// Get all subscribed creators for a subscriber
async getSubscribedCreators() {
  const response = await api.get('/chat/subscriber/creators');
  return response.data;
}

// Get conversation with a specific user (with messages)
async getConversationWithUser(userId) {
  const response = await api.get(`/chat/conversation/${userId}`);
  return response.data;
}


// Mark messages as read for a user
async markMessagesAsRead(userId) {
  const response = await api.post(`/chat/mark-read/${userId}`);
  return response.data;
}

// Join creator room (for real-time updates)
joinCreatorRoom(creatorId) {
  if (this.socket) {
    console.log('[chat/socket] emit join_creator_room', { creatorId });
    this.socket.emit('join_creator_room', { creatorId });
  }
}

// Join subscriber room (for real-time updates)
joinSubscriberRoom(subscriberId) {
  if (this.socket) {
    console.log('[chat/socket] emit join_subscriber_room', { subscriberId });
    this.socket.emit('join_subscriber_room', { subscriberId });
  }
}

  // Event listeners
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  // REST API methods
  async getConversations() {
    const response = await api.get('/chat/conversations');
    return response.data;
  }

  async getOrCreateConversation(otherUserId) {
    const response = await api.post(`/chat/conversations/${otherUserId}`);
    return response.data;
  }

  async getMessages(conversationId, limit = 50, before = null) {
    let url = `/chat/conversations/${conversationId}/messages?limit=${limit}`;
    if (before) url += `&before=${before}`;
    const response = await api.get(url);
    return response.data;
  }

  async sendMessage(receiverId, content) {
    const response = await api.post('/chat/messages', { receiverId, content });
    return response.data;
  }

  async deleteMessage(messageId) {
    const response = await api.delete(`/chat/messages/${messageId}`);
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get('/chat/conversations/unread-count');
    return response.data;
  }

  async markConversationAsRead(conversationId) {
    const response = await api.post(`/chat/conversations/${conversationId}/read`);
    return response.data;
  }



// Update online status
async updateOnlineStatus(isOnline) {
  const response = await api.post('/chat/online-status', { isOnline });
  return response.data;
}

}


export default new ChatService();