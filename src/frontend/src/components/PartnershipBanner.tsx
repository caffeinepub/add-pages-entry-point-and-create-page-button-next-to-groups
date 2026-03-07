import { Sparkles } from "lucide-react";

export default function PartnershipBanner() {
  return (
    <div className="bg-gradient-to-r from-saffron/10 via-deep-blue/10 to-saffron/10 rounded-[20px] p-6 shadow-soft mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-saffron to-deep-blue p-3 rounded-full">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">
            Partnership Program
          </h3>
          <p className="text-sm text-muted-foreground">
            Building a stronger civic community together
          </p>
        </div>
      </div>
    </div>
  );
}
