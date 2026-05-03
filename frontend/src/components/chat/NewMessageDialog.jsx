import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import useChatStore from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

const NewMessageDialog = ({ open, onOpenChange, onConversationCreated }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { getOrCreateConversation } = useChatStore();
  const { user } = useAuthStore();

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const response = await api.get(`/users/search?q=${search}`);
      if (response.data.success) {
        setResults(response.data.data.filter(u => u._id !== user?._id));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (otherUser) => {
    setCreating(true);
    try {
      const conversation = await getOrCreateConversation(otherUser._id);
      if (conversation) {
        onConversationCreated(conversation);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="max-h-96 overflow-y-auto space-y-2">
          {results.map((otherUser) => (
            <div
              key={otherUser._id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => handleStartChat(otherUser)}
            >
              <Avatar>
                <AvatarImage src={otherUser.profileImageUrl} />
                <AvatarFallback>
                  {otherUser.fullName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{otherUser.fullName}</p>
                <p className="text-sm text-muted-foreground truncate">{otherUser.email}</p>
              </div>
              <div className="text-xs px-2 py-1 rounded-full bg-muted">
                {otherUser.role === 'creator' ? 'Creator' : 'Subscriber'}
              </div>
            </div>
          ))}
          
          {search && !loading && results.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No users found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;