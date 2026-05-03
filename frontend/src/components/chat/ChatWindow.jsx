import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, MoreVertical, CheckCheck, Check } from 'lucide-react';
import { format } from 'date-fns';
import useChatStore from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

const ChatWindow = ({ conversation, onBack }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    messages,
    fetchMessages,
    sendMessage,
    sendTyping,
    markAsRead,
    joinConversation,
    leaveConversation,
    typingUsers,
    isConnected,
  } = useChatStore();

  const { user } = useAuthStore();

  const otherUser = conversation?.participants?.find((p) => p._id !== user?._id);
  const isOtherTyping = typingUsers.has(otherUser?._id);

  // Join conversation and load messages once socket is connected
  useEffect(() => {
    if (!conversation || !isConnected) return;

    joinConversation(conversation._id);
    fetchMessages(conversation._id);

    if (otherUser) {
      markAsRead(conversation._id, otherUser._id);
    }

    inputRef.current?.focus();

    return () => {
      leaveConversation(conversation._id);
    };
  }, [conversation?._id, isConnected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !conversation || !otherUser || !isConnected) return;

    sendMessage(conversation._id, otherUser._id, message.trim());
    setMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      sendTyping(conversation._id, otherUser._id, false);
      setIsTyping(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!isTyping && e.target.value && isConnected) {
      setIsTyping(true);
      sendTyping(conversation._id, otherUser._id, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(conversation._id, otherUser._id, false);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (date) => {
    const msgDate = new Date(date);
    const now = new Date();
    if (msgDate.toDateString() === now.toDateString()) {
      return format(msgDate, 'h:mm a');
    }
    return format(msgDate, 'MMM d, h:mm a');
  };

  if (!isConnected) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onBack} className="lg:hidden">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar>
          <AvatarImage src={otherUser?.profileImageUrl} />
          <AvatarFallback>
            {otherUser?.fullName?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{otherUser?.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {otherUser?.role === 'creator' ? 'Creator' : 'Subscriber'}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId?._id === user?._id;
          const showAvatar =
            !isOwn &&
            (idx === 0 || messages[idx - 1]?.senderId?._id !== msg.senderId?._id);

          return (
            <div key={msg._id || idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {!isOwn && showAvatar && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={msg.senderId?.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {msg.senderId?.fullName?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isOwn && !showAvatar && <div className="w-8" />}

                <div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div
                    className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                      isOwn ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isOwn && (
                      msg.read ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!message.trim() || !isConnected}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;