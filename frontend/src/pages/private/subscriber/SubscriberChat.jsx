// import React from 'react'

// const SubscriberChat = () => {
//   return (
//     <div>SubscriberChat</div>
//   )
// }

// export default SubscriberChat
import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, Loader2, MoreVertical, MessageCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import chatService from "@/src/services/chatService";

const SubscriberChat = () => {
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;
  const [creators, setCreators] = useState([]);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const bottomRef = useRef(null);
  const selectedCreatorRef = useRef(null);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    selectedCreatorRef.current = selectedCreator;
  }, [selectedCreator]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  // Load all creators the subscriber is subscribed to
  // In the useEffect for loading contacts
useEffect(() => {
  loadCreators(); // or loadCreators()
  
  // Setup socket listeners
  chatService.on('new_message', handleNewMessage);
  chatService.on('user_typing', handleUserTyping);
  chatService.on('user_online_status', handleUserOnlineStatus);
  chatService.on('online_users', handleOnlineUsersSnapshot);
  
  // Connect socket
  chatService.connect();
  
  // Join appropriate room after connection
  if (currentUserId) {
    setTimeout(() => {
      if (user?.role === 'creator') {
        chatService.joinCreatorRoom(currentUserId);
      } else if (user?.role === 'subscriber') {
        chatService.joinSubscriberRoom(currentUserId);
      }
    }, 1000);
  }
  
  return () => {
    chatService.off('new_message', handleNewMessage);
    chatService.off('user_typing', handleUserTyping);
    chatService.off('user_online_status', handleUserOnlineStatus);
    chatService.off('online_users', handleOnlineUsersSnapshot);
    chatService.disconnect();
  };
}, [user?.role, currentUserId]);

  const getUserId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const rawId = value._id || value.id || value;
      return rawId?.toString?.() || null;
    }
    return value?.toString?.() || null;
  };

  // Load messages when creator is selected
  useEffect(() => {
    if (selectedCreator) {
      loadMessages();
      markMessagesAsRead();
    }
  }, [selectedCreator]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCreators = async () => {
    try {
      setLoading(true);
      // Get all creators the subscriber is subscribed to
      const response = await chatService.getSubscribedCreators();
      setCreators(response?.data?.creators || []);
    } catch (error) {
      console.error('Failed to load creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedCreator) return;
    
    try {
      setLoadingMessages(true);
      const response = await chatService.getConversationWithUser(selectedCreator._id);
      const conversationData = response?.data || {};
      
      setMessages(conversationData.messages || []);
      
      // Update creator's last message in the list
      setCreators(prev => prev.map(creator => 
        getUserId(creator._id) === getUserId(selectedCreator._id)
          ? { 
              ...creator, 
              lastMessage: conversationData.lastMessage,
              lastMessageAt: conversationData.lastMessageAt,
              unreadCount: 0
            }
          : creator
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedCreator) return;
    
    try {
      await chatService.markMessagesAsRead(selectedCreator._id);
      // Update unread count in creators list
      setCreators(prev => prev.map(creator => 
        getUserId(creator._id) === getUserId(selectedCreator._id) ? { ...creator, unreadCount: 0 } : creator
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleNewMessage = (data) => {
    const { message, sender } = data;
    const senderId = getUserId(sender?._id ? sender : message?.senderId);
    const activeCreator = selectedCreatorRef.current;
    
    // Update messages if this is the active conversation
    if (activeCreator && senderId === getUserId(activeCreator._id)) {
      setMessages(prev => {
        const exists = prev.some((m) => getUserId(m._id) === getUserId(message?._id));
        return exists ? prev : [...prev, message];
      });
      chatService.markMessagesAsRead(activeCreator._id).catch((error) => {
        console.error("Failed to mark messages as read:", error);
      });
    }
    
    // Update creators list with new message
    setCreators(prev => {
      const updated = prev.map(creator => 
        getUserId(creator._id) === senderId
          ? {
              ...creator,
              lastMessage: message.content,
              lastMessageAt: message.createdAt,
              unreadCount: getUserId(activeCreator?._id) === getUserId(creator._id) ? 0 : (creator.unreadCount + 1)
            }
          : creator
      );
      
      // Sort by lastMessageAt (most recent first)
      return updated.sort((a, b) => 
        new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
      );
    });
  };

  const handleUserTyping = (data) => {
    const activeCreator = selectedCreatorRef.current;
    if (activeCreator && getUserId(data.userId) === getUserId(activeCreator._id)) {
      setOtherUserTyping(data.isTyping);
      setTimeout(() => setOtherUserTyping(false), 3000);
    }
  };

  const handleUserOnlineStatus = (data) => {
    const normalizedUserId = getUserId(data.userId);
    if (!normalizedUserId) return;
    setOnlineStatus(prev => ({
      ...prev,
      [normalizedUserId]: data.isOnline
    }));
  };

  const handleOnlineUsersSnapshot = (data) => {
    const nextState = {};
    (data?.userIds || []).forEach((id) => {
      const normalizedId = getUserId(id);
      if (normalizedId) nextState[normalizedId] = true;
    });
    setOnlineStatus(nextState);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !selectedCreator) return;

    setSending(true);
    try {
      const response = await chatService.sendMessage(selectedCreator._id, text);
      const newMessage = response?.data?.message;
      if (!newMessage) return;
      setMessages(prev => {
        const exists = prev.some((m) => getUserId(m._id) === getUserId(newMessage?._id));
        return exists ? prev : [...prev, newMessage];
      });
      setInputText("");
      
      // Update creators list
      setCreators(prev => {
        const updated = prev.map(creator => 
          getUserId(creator._id) === getUserId(selectedCreator._id)
            ? {
                ...creator,
                lastMessage: text,
                lastMessageAt: new Date().toISOString()
              }
            : creator
        );
        return updated.sort((a, b) => 
          new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
        );
      });
      
      // Clear typing indicator
      chatService.sendTyping(selectedCreator._id, false);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!selectedCreator) return;
    
    chatService.sendTyping(selectedCreator._id, true);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      chatService.sendTyping(selectedCreator._id, false);
    }, 1000);
    setTypingTimeout(timeout);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return msgDate.toLocaleDateString();
  };

  const formatMessageTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
  };

  const filteredCreators = creators.filter(creator =>
    creator.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* WhatsApp-style Sidebar */}
      <div className="w-96 flex flex-col border-r bg-background min-h-0">
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">Chats</span>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              className="pl-9 bg-muted border-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Creators List */}
        <ScrollArea className="flex-1">
          {filteredCreators.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-2">Subscribe to creators to start chatting</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCreators.map((creator) => (
                <button
                  key={creator._id}
                  onClick={() => setSelectedCreator(creator)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
                    getUserId(selectedCreator?._id) === getUserId(creator._id) ? "bg-accent" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback className="text-sm">
                        {getInitials(creator.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    {onlineStatus[getUserId(creator._id)] && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium truncate">{creator.fullName}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatTime(creator.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="text-sm text-muted-foreground truncate">
                        {creator.lastMessage || "No messages yet"}
                      </p>
                      {creator.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {creator.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area - WhatsApp Style */}
      {selectedCreator ? (
        <div className="flex-1 flex flex-col bg-muted/30 min-h-0">
          {/* Chat Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b bg-background">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedCreator.avatar} />
                  <AvatarFallback>{getInitials(selectedCreator.fullName)}</AvatarFallback>
                </Avatar>
                {onlineStatus[getUserId(selectedCreator._id)] && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedCreator.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {onlineStatus[getUserId(selectedCreator._id)] ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <div className="flex flex-col gap-2 max-w-3xl mx-auto">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Send className="h-8 w-8" />
                  </div>
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const messageSenderId = getUserId(msg.senderId);
                    const prevSenderId = getUserId(messages[idx - 1]?.senderId);
                    const isSubscriber = messageSenderId === currentUserIdRef.current;
                    const showAvatar = !isSubscriber && (idx === 0 || prevSenderId !== messageSenderId);
                    
                    return (
                      <div key={msg._id || idx} className={`flex ${isSubscriber ? "justify-end" : "justify-start"} gap-2`}>
                        {!isSubscriber && showAvatar && (
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="text-xs">
                              {getInitials(selectedCreator.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[70%] ${!isSubscriber && !showAvatar ? "ml-10" : ""}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm ${
                              isSubscriber
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-background rounded-bl-sm shadow-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <p className={`text-[10px] text-muted-foreground mt-0.5 ${isSubscriber ? "text-right" : "text-left"}`}>
                            {formatMessageTime(msg.createdAt)}
                            {isSubscriber && msg.read && <span className="ml-1">✓✓</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {otherUserTyping && (
                    <div className="flex justify-start gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(selectedCreator.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-background px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                          <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-background border-t">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                onKeyUp={handleTyping}
                className="flex-1 bg-muted/50"
                disabled={sending}
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                disabled={!inputText.trim() || sending}
                className="shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Select a creator to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriberChat;