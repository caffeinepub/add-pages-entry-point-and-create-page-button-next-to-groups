import { Coins, History, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CVTBalanceCardProps {
  balance: bigint;
}

export default function CVTBalanceCard({ balance }: CVTBalanceCardProps) {
  const formattedBalance = Number(balance).toLocaleString();

  return (
    <Card className="mb-6 rounded-2xl shadow-lg border-0 overflow-hidden">
      <div className="bg-gradient-to-br from-deep-blue via-[oklch(0.45_0.12_250)] to-saffron p-8 relative">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <CardContent className="p-0 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <p className="text-white/90 text-sm font-medium">Available CVT Balance</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-6xl font-bold text-white mb-1">{formattedBalance}</h2>
            <p className="text-white/80 text-lg font-medium">CVT</p>
          </div>

          <div className="flex gap-3">
            <Button
              disabled
              className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border-0 rounded-xl h-12 font-semibold"
            >
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </Button>
            <Button
              disabled
              className="flex-1 bg-white hover:bg-white/90 text-deep-blue rounded-xl h-12 font-semibold"
            >
              <Send className="h-5 w-5 mr-2" />
              Transfer CVT
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
