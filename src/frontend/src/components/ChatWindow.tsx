import { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetConversation, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatWindowProps {
  otherUser: Principal;
}

export default function ChatWindow({ otherUser }: ChatWindowProps) {
  const { identity } = useInternetIdentity();
  const { data: messages, isLoading } = useGetConversation(otherUser);
  const { data: otherUserProfile } = useGetUserProfile(otherUser);
  const sendMessageMutation = useSendMessage();
  const [messageInput, setMessageInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentUserPrincipal = identity?.getPrincipal();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || sendMessageMutation.isPending) return;

    const content = messageInput.trim();
    setMessageInput('');

    await sendMessageMutation.mutateAsync({
      receiver: otherUser,
      content,
    });
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const otherUserName = otherUserProfile?.name || 'User';
  const otherUserInitials = otherUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b bg-[oklch(0.45_0.12_250)] text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src="/assets/generated/default-profile.dim_200x200.png" />
            <AvatarFallback className="bg-white text-[oklch(0.45_0.12_250)] font-bold">
              {otherUserInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{otherUserName}</div>
            <div className="text-xs text-white/70 font-normal truncate max-w-[300px]">
              {otherUser.toString()}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isCurrentUser = currentUserPrincipal && message.sender.toString() === currentUserPrincipal.toString();
                
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src="/assets/generated/default-profile.dim_200x200.png" />
                        <AvatarFallback className={isCurrentUser ? 'bg-[oklch(0.45_0.12_250)] text-white' : 'bg-muted'}>
                          {isCurrentUser ? <User className="h-4 w-4" /> : otherUserInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isCurrentUser
                              ? 'bg-[oklch(0.45_0.12_250)] text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendMessageMutation.isPending}
              className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
            >
              {sendMessageMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

