import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Coins, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { useGetWallet, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CVTBalanceCard from '../components/CVTBalanceCard';
import VerificationStatusCard from '../components/VerificationStatusCard';
import WalletView from '../components/WalletView';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function WalletPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isLoading = walletLoading || profileLoading;

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-24">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Coins size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Your Wallet</h2>
          <p className="text-muted-foreground text-sm">Please log in to view your wallet and token balance.</p>
          <button
            onClick={() => navigate({ to: '/profile' })}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tokenBalance = userProfile?.civicTokenBalance ? userProfile.civicTokenBalance : BigInt(0);
  const isVerified = userProfile?.verifiedStatus ?? false;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 rounded-full hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">My Wallet</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* CVT Balance Card */}
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <CVTBalanceCard balance={tokenBalance} />
        )}

        {/* CivPoints Quick Access Card */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl border-border/40"
          onClick={() => navigate({ to: '/wallet-points' })}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">CivPoints</p>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? '...' : `${wallet?.civPoints?.toFixed(0) ?? 0} CP earned`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Daily</p>
                  <p className="text-sm font-bold text-amber-500">
                    {isLoading ? '...' : `${wallet?.dailyEarned?.toFixed(0) ?? 0}/100`}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level & Stats Card */}
        {!isLoading && wallet && (
          <Card className="rounded-2xl border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Civic Level</p>
                  <p className="text-xs text-muted-foreground">Level {wallet.level?.toFixed(0) ?? 1}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{wallet.totalEarned?.toFixed(0) ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{wallet.dailyEarned?.toFixed(0) ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Today's Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification Status */}
        {!isLoading && (
          <VerificationStatusCard verified={isVerified} />
        )}

        {/* Wallet View (Transaction History / Quick Actions) */}
        <WalletView />
      </div>
    </div>
  );
}
