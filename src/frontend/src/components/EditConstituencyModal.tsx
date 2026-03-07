import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import HierarchicalLocationSelector from "./HierarchicalLocationSelector";

interface EditConstituencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditConstituencyModal({
  open,
  onOpenChange,
}: EditConstituencyModalProps) {
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  const [locationString, setLocationString] = useState<string>("");

  // Initialize with current location when modal opens
  useEffect(() => {
    if (open && userProfile?.location) {
      // Convert "Country, State, District" format to "Country > State > District" format
      const parts = userProfile.location.split(",").map((s) => s.trim());
      const formattedLocation = parts.join(" > ");
      setLocationString(formattedLocation);
    }
  }, [open, userProfile]);

  const handleSave = async () => {
    if (!userProfile) {
      toast.error("User profile not found");
      return;
    }

    if (!locationString || locationString.trim() === "") {
      toast.error("Please select your location");
      return;
    }

    // Convert "Country > State > District" format back to "Country, State, District" format
    const parts = locationString.split(" > ").map((s) => s.trim());
    const newLocation = parts.join(", ");

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        location: newLocation,
      });
      toast.success("Constituency updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update constituency:", error);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Your Constituency</DialogTitle>
          <DialogDescription>
            Update your location to see relevant local content, polls, and
            representatives
          </DialogDescription>
        </DialogHeader>

        {profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="py-4">
            <HierarchicalLocationSelector
              value={locationString}
              onChange={setLocationString}
              initialLocation={
                userProfile?.location
                  ? userProfile.location
                      .split(",")
                      .map((s) => s.trim())
                      .join(" > ")
                  : undefined
              }
            />
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saveProfile.isPending}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveProfile.isPending || !locationString}
            className="bg-gradient-to-br from-deep-blue to-[oklch(0.45_0.12_250)] hover:from-deep-blue-dark hover:to-[oklch(0.40_0.12_250)] text-white rounded-xl"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
