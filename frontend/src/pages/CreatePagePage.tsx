import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Upload, X, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useCreatePage } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ExternalBlob } from "../backend";
import { formatBackendError } from "../utils/backendErrors";
import { Switch } from "@/components/ui/switch";

const PAGE_CATEGORIES = [
  "Politics",
  "Government",
  "Civic Education",
  "Local Issues",
  "Policy",
  "Economy",
  "Environment",
  "Healthcare",
  "Education",
  "Social Issues",
  "Human Rights",
  "Community",
  "Other",
];

export default function CreatePagePage() {
  const navigate = useNavigate();
  const [pageName, setPageName] = useState("");
  const [category, setCategory] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const createPage = useCreatePage();

  const isActorReady = !!actor && !actorFetching;
  const isAuthenticated = !!identity;

  const filteredCategories = PAGE_CATEGORIES.filter((c) =>
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const clearProfile = () => {
    setProfileFile(null);
    setProfilePreview(null);
    setUploadProgress(0);
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pageName.trim()) {
      toast.error("Please enter a page name.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description.");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to create a page.");
      return;
    }
    if (!isActorReady) {
      toast.error("Still connecting to the network. Please try again.");
      return;
    }

    try {
      let profileBlob: ExternalBlob | null = null;

      if (profileFile) {
        const bytes = new Uint8Array(await profileFile.arrayBuffer());
        profileBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      await createPage.mutateAsync({
        pageName: pageName.trim(),
        category,
        description: description.trim(),
        profileImage: profileBlob,
        isPrivate,
      });

      navigate({ to: "/communities" });
    } catch (error: unknown) {
      const msg = formatBackendError(error);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/communities" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Create Page</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isActorReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
              <Loader2 size={14} className="animate-spin" />
              <span>Connecting to network…</span>
            </div>
          )}

          {/* Page Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Page Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Enter page name"
              disabled={createPage.isPending}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
              Category <span className="text-destructive">*</span>
            </label>
            <div
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm cursor-pointer flex items-center justify-between"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className={category ? "text-foreground" : "text-muted-foreground"}>
                {category || "Select a category"}
              </span>
              <Search size={14} className="text-muted-foreground" />
            </div>

            {showCategoryDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories…"
                    className="w-full bg-muted/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setCategorySearch("");
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                        category === cat ? "text-primary font-medium" : "text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {filteredCategories.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      No categories found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this page about?"
              rows={4}
              disabled={createPage.isPending}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Profile Image (optional)
            </label>
            {profilePreview ? (
              <div className="relative w-24 h-24">
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-border"
                />
                <button
                  type="button"
                  onClick={clearProfile}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/80"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                disabled={createPage.isPending}
                className="flex items-center gap-2 border-2 border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
              >
                <Upload size={16} />
                <span>Upload profile image</span>
              </button>
            )}
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileChange}
            />
          </div>

          {createPage.isPending && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Privacy toggle */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Private Page</p>
              <p className="text-xs text-muted-foreground">
                {isPrivate ? "Only invited members can see this page" : "Anyone can view this page"}
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={createPage.isPending}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              createPage.isPending ||
              !isActorReady ||
              !pageName.trim() ||
              !category ||
              !description.trim()
            }
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPage.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Page…</span>
              </>
            ) : !isActorReady ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <span>Create Page</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
