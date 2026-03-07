import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Edit,
  Loader2,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import { useState } from "react";
import EditConstituencyModal from "../components/EditConstituencyModal";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function MyConstituencyPage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-deep-blue" />
        </div>
      </div>
    );
  }

  // Parse location from user profile (format: "Country, State, District")
  const locationParts =
    userProfile?.location?.split(",").map((s) => s.trim()) || [];
  const [country, state, district] = locationParts;

  return (
    <div className="min-h-full bg-background pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🗳 My Constituency
          </h1>
          <p className="text-muted-foreground">
            View your location hierarchy, local representatives, polls, and
            announcements
          </p>
        </div>

        {/* Location Hierarchy Card */}
        <Card className="mb-6 rounded-2xl shadow-md border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Your Location Hierarchy
              </CardTitle>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="rounded-xl"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit / Change
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  Country
                </Badge>
                <span className="font-semibold text-foreground">
                  {country || "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  State
                </Badge>
                <span className="font-semibold text-foreground">
                  {state || "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  District
                </Badge>
                <span className="font-semibold text-foreground">
                  {district || "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  MP Constituency
                </Badge>
                <span className="font-semibold text-foreground">
                  Not available
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  MLA Constituency
                </Badge>
                <span className="font-semibold text-foreground">
                  Not available
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  Mandal
                </Badge>
                <span className="font-semibold text-foreground">
                  Not available
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                <Badge variant="secondary" className="text-xs">
                  Village
                </Badge>
                <span className="font-semibold text-foreground">
                  Not available
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Representatives Section */}
        <Card className="mb-6 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Local Representatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Representative information will be displayed here
              </p>
              <p className="text-xs mt-1">Coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Local Polls Section */}
        <Card className="mb-6 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Local Polls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Polls specific to your constituency will appear here
              </p>
              <p className="text-xs mt-1">No local polls available yet</p>
            </div>
          </CardContent>
        </Card>

        {/* Local Announcements Section */}
        <Card className="mb-6 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Local Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Important announcements from your area will be shown here
              </p>
              <p className="text-xs mt-1">No announcements at this time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Constituency Modal */}
      <EditConstituencyModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </div>
  );
}
