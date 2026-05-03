import React, { useEffect, useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import NewMessageDialog from './NewMessageDialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import useChatStore from '@/store/chatStore';

const ChatContainer = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const { initSocket, socket, isConnected } = useChatStore();

  useEffect(() => {
    if (!socket) {
      initSocket();
    }
  }, [socket]);

  return (
    <>
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
        <div
          className={`${
            selectedConversation ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-80 border-r flex-col`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages</h2>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNewMessage(true)}
              className="gap-2"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ChatList onSelectConversation={setSelectedConversation} />
          </div>
        </div>

        <div
          className={`${
            selectedConversation ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col`}
        >
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8 w-full">
              <div>
                <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
                <p className="text-muted-foreground">
                  Select a conversation or click "New" to start chatting
                </p>

                {!isConnected && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    <p className="text-xs text-orange-500">
                      Connecting to server...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <NewMessageDialog
        open={showNewMessage}
        onOpenChange={setShowNewMessage}
        onConversationCreated={(conversation) => {
          setSelectedConversation(conversation);
          setShowNewMessage(false);
        }}
      />
    </>
  );
};

export default ChatContainer;