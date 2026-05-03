import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useChatStore from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

const ChatList = ({ onSelectConversation }) => {
  const { conversations, fetchConversations } = useChatStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await fetchConversations();
      setLoading(false);
    };
    load();
  }, []);

  const getOtherUser = (conv) =>
    conv.participants.find((p) => p._id !== user?._id);

  // unreadCount is a plain object on the client after JSON parse: { "userId": number }
  const getUnread = (conv) => {
    if (!conv.unreadCount || !user?._id) return 0;
    return conv.unreadCount[user._id] || 0;
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherUser = getOtherUser(conv);
    return otherUser?.fullName?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a conversation with a creator or subscriber
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const otherUser = getOtherUser(conv);
            const unread = getUnread(conv);

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`flex items-center gap-3 p-4 hover:bg-muted cursor-pointer transition-colors border-b ${
                  unread > 0 ? 'bg-muted/50' : ''
                }`}
              >
                <Avatar>
                  <AvatarImage src={otherUser?.profileImageUrl} />
                  <AvatarFallback>
                    {otherUser?.fullName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`font-medium truncate ${unread > 0 ? 'font-semibold' : ''}`}>
                      {otherUser?.fullName}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {unread > 0 && (
                  <Badge variant="default" className="rounded-full shrink-0">
                    {unread}
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;