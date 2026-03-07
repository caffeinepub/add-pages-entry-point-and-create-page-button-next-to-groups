import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Calendar,
  Coins,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  useGetCallerPointHistory,
  useGetCallerWallet,
} from "../hooks/useQueries";

export default function WalletPointsPage() {
  const { data: wallet, isLoading: walletLoading } = useGetCallerWallet();
  const { data: pointHistory, isLoading: historyLoading } =
    useGetCallerPointHistory();

  if (walletLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-deep-blue" />
        </div>
      </div>
    );
  }

  const civPoints = wallet?.civPoints ?? 0;
  const dailyEarned = wallet?.dailyEarned ?? 0;
  const totalEarned = wallet?.totalEarned ?? 0;
  const level = wallet?.level ?? 1;

  // Format date helper
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get action type display name
  const getActionLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      daily_login: "Daily Login",
      profile_complete: "Profile Completed",
      email_verified: "Email Verified",
      login_streak: "7-Day Streak",
      create_post: "Post Created",
      create_poll: "Poll Created",
      create_group: "Group Created",
      create_page: "Page Created",
      receive_like: "Received Like",
      receive_comment: "Received Comment",
      poll_participation: "Poll Vote",
      share_post: "Post Shared",
      referral_active: "Referral Active",
      referral_level_2: "Referral Level 2",
      spent: "Points Spent",
    };
    return labels[actionType] || actionType;
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          CivPoints Wallet
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your rewards and engagement
        </p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-deep-blue via-deep-blue-dark to-saffron border-0 text-white shadow-premium">
        <CardContent className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-5 w-5 opacity-80" />
              <p className="text-sm opacity-80 font-medium">Current Balance</p>
            </div>
            <h2 className="text-5xl font-bold mb-1">{civPoints.toFixed(1)}</h2>
            <p className="text-lg opacity-90">CivPoints (CP)</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs opacity-70 mb-1">Future Token Value</p>
              <p className="text-sm font-semibold">
                {(civPoints / 1000).toFixed(3)} CVT
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {dailyEarned.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Today Earned</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <Coins className="h-5 w-5 text-saffron mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {totalEarned.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Lifetime Earned</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <Award className="h-5 w-5 text-deep-blue mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Limit Progress */}
      <Card className="mb-6 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">
              Daily Earning Progress
            </p>
            <p className="text-sm font-semibold text-deep-blue">
              {dailyEarned.toFixed(1)} / 100 CP
            </p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-deep-blue to-saffron h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((dailyEarned / 100) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {dailyEarned >= 100
              ? "Daily limit reached!"
              : `${(100 - dailyEarned).toFixed(1)} CP remaining today`}
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-deep-blue" />
            </div>
          ) : !pointHistory || pointHistory.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No transactions yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start earning by engaging with the platform!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="px-6 pb-4">
                {pointHistory.map((transaction) => (
                  <div
                    key={`${transaction.actionType}-${String(transaction.date)}`}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-full ${transaction.points > 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                      >
                        {transaction.points > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {getActionLabel(transaction.actionType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-bold ${transaction.points > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points.toFixed(1)} CP
                      </p>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-soft">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-deep-blue to-blue-600 p-2 rounded-full">
              <Award className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground mb-1">
                Future Token Conversion
              </h3>
              <p className="text-xs text-muted-foreground">
                Your CivPoints will be convertible to CVT tokens at a rate of
                1000 CP = 1 CVT. Keep earning to maximize your future token
                balance!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
