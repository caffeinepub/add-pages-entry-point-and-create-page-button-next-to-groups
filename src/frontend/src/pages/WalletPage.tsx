import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, AlertCircle } from 'lucide-react';

export default function WalletPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-[oklch(0.45_0.12_250)]/10 rounded-full">
                <Wallet className="h-6 w-6 text-[oklch(0.45_0.12_250)]" />
              </div>
              <CardTitle>Wallet</CardTitle>
            </div>
            <CardDescription>
              Please log in to access your wallet
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="space-y-6">
        {/* Wallet Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[oklch(0.45_0.12_250)]/10 rounded-full">
                  <Wallet className="h-6 w-6 text-[oklch(0.45_0.12_250)]" />
                </div>
                <div>
                  <CardTitle>Your Wallet</CardTitle>
                  <CardDescription>Manage your CivWorld tokens</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[oklch(0.45_0.12_250)] to-[oklch(0.35_0.12_250)] mb-4">
                <img 
                  src="/assets/generated/civ-token-icon.dim_128x128.png" 
                  alt="CIV Token"
                  className="w-12 h-12"
                />
              </div>
              <div className="text-4xl font-bold mb-2">0.00 CIV</div>
              <p className="text-sm text-muted-foreground">CivWorld Tokens</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-2"
            disabled
          >
            <ArrowUpRight className="h-5 w-5" />
            <span>Send</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-2"
            disabled
          >
            <ArrowDownLeft className="h-5 w-5" />
            <span>Receive</span>
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <Card className="border-[oklch(0.45_0.12_250)]/20 bg-[oklch(0.45_0.12_250)]/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-[oklch(0.45_0.12_250)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Wallet Features Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  CivWorld wallet functionality is currently in development. Soon you'll be able to:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Send and receive CIV tokens</li>
                  <li>View transaction history</li>
                  <li>Earn rewards for civic engagement</li>
                  <li>Support causes and campaigns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
