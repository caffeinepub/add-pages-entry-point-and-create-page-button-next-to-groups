import { BadgeCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VerificationStatusCardProps {
  verified: boolean;
}

export default function VerificationStatusCard({ verified }: VerificationStatusCardProps) {
  return (
    <Card className={`mb-6 rounded-2xl shadow-md border-2 ${
      verified 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700' 
        : 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-full ${
            verified 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-amber-400 to-yellow-500'
          }`}>
            {verified ? (
              <ShieldCheck className="h-7 w-7 text-white" />
            ) : (
              <AlertCircle className="h-7 w-7 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {verified && <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />}
              <h3 className="text-xl font-bold text-foreground">
                {verified ? 'Verified Account' : 'Not Verified'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {verified 
                ? 'Your account has been verified and authenticated' 
                : 'Complete verification to unlock premium features'}
            </p>
          </div>
        </div>

        <Button
          disabled
          className={`w-full rounded-xl h-11 font-semibold ${
            verified
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {verified ? 'View Verification Details' : 'Verify Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
