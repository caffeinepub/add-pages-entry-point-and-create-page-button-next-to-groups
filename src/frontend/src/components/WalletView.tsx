import { Button } from "@/components/ui/button";
import { Clock, Download, Send, TrendingUp, Wallet } from "lucide-react";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function WalletView() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const tokenBalance = userProfile?.civicTokenBalance
    ? Number(userProfile.civicTokenBalance)
    : 0;

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-[20px]" />
          <div className="h-32 bg-muted rounded-[20px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-deep-blue via-deep-blue-dark to-saffron rounded-[20px] p-8 shadow-premium mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 opacity-80" />
            <p className="text-sm opacity-80 font-medium">Total Balance</p>
          </div>
          <h2 className="text-5xl font-bold mb-1">
            {tokenBalance.toLocaleString()}
          </h2>
          <p className="text-lg opacity-90">CVT</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          disabled
          className="bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 rounded-[20px] h-24 flex flex-col items-center justify-center gap-2 shadow-soft"
        >
          <Send className="h-6 w-6" />
          <span className="text-sm font-semibold">Send</span>
        </Button>
        <Button
          disabled
          className="bg-white dark:bg-gray-800 text-foreground hover:bg-gray-50 dark:hover:bg-gray-700 rounded-[20px] h-24 flex flex-col items-center justify-center gap-2 shadow-soft"
        >
          <Download className="h-6 w-6" />
          <span className="text-sm font-semibold">Receive</span>
        </Button>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-[20px] p-6 shadow-soft border border-amber-200 dark:border-amber-800 mb-6">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-2 rounded-full">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">
              Wallet Features Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              Send, receive, and manage your Civic Tokens. Participate in
              governance and earn rewards for civic engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-[20px] p-6 shadow-soft">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No transactions yet</p>
        </div>
      </div>
    </div>
  );
}
