import { BadgeCheck, Coins } from "lucide-react";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function DashboardCards() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-[20px] p-6 shadow-soft animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </div>
        <div className="bg-card rounded-[20px] p-6 shadow-soft animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const tokenBalance = userProfile?.civicTokenBalance
    ? Number(userProfile.civicTokenBalance)
    : 0;
  const isVerified = userProfile?.verifiedStatus || false;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Civic Tokens Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-[20px] p-6 shadow-soft border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gradient-to-br from-saffron to-deep-blue p-3 rounded-full mb-3">
            <Coins className="h-6 w-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {tokenBalance.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">CVT</p>
        </div>
      </div>

      {/* Verified Badge Card */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-[20px] p-6 shadow-soft border border-amber-200 dark:border-amber-800 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center h-full">
          <div
            className={`p-3 rounded-full mb-3 ${isVerified ? "bg-gradient-to-br from-amber-400 to-yellow-500" : "bg-gray-300"}`}
          >
            <BadgeCheck className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-bold text-foreground text-center">
            {isVerified ? "Verified" : "Not Verified"}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Status
          </p>
        </div>
      </div>
    </div>
  );
}
