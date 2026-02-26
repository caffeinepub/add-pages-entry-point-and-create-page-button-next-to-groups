import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [principalInput, setPrincipalInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);

  const handleStartConversation = () => {
    try {
      const principal = Principal.fromText(principalInput);
      setSelectedUser(principal);
    } catch (error) {
      toast.error('Invalid Principal ID. Please check and try again.');
    }
  };

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Messages</h2>

        {!selectedUser ? (
          <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center text-center py-8">
              <div className="bg-[oklch(0.45_0.12_250)]/10 rounded-full p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-[oklch(0.45_0.12_250)]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start a Conversation
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Enter a user's Principal ID to start messaging
              </p>
              
              <div className="w-full max-w-md space-y-3">
                <Input
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  placeholder="Enter Principal ID..."
                  className="w-full"
                />
                <Button
                  onClick={handleStartConversation}
                  disabled={!principalInput.trim()}
                  className="w-full bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
                >
                  Start Conversation
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              className="mb-2"
            >
              ← Back to Messages
            </Button>
            <ChatWindow otherUser={selectedUser} />
          </div>
        )}
      </div>
    </div>
  );
}
