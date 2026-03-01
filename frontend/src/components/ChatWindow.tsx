import React, { useState, useRef, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetMessages, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { Message } from '../types';
import { Send, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  otherUser: Principal;
}

export default function ChatWindow({ otherUser }: ChatWindowProps) {
  const { identity } = useInternetIdentity();
  const otherUserId = otherUser.toString();

  const { data: messages = [], isLoading } = useGetMessages(otherUserId);
  const { data: otherUserProfile } = useGetUserProfile(otherUserId);
  const sendMessage = useSendMessage();

  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    try {
      await sendMessage.mutateAsync({ receiver: otherUserId, content: trimmed });
      setNewMessage('');
    } catch {
      // Messaging not yet available
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName = otherUserProfile?.name || otherUserId.slice(0, 8) + '...';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{displayName}</p>
          <p className="text-xs text-muted-foreground">{otherUserId.slice(0, 12)}...</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No messages yet.</p>
            <p className="mt-1 text-xs">Messaging feature coming soon!</p>
          </div>
        ) : (
          (messages as Message[]).map((message: Message, idx: number) => (
            <div key={idx} className="text-sm text-muted-foreground">
              Message {idx + 1}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (coming soon)"
          disabled
          className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sendMessage.isPending}
          className="p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
