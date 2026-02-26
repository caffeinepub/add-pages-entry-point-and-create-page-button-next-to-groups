import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Image, X, Loader2, ChevronDown } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreatePage } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

const PAGE_CATEGORIES = [
  'Politics', 'Government', 'Education', 'Health', 'Environment',
  'Economy', 'Social Issues', 'Infrastructure', 'Culture', 'Other',
];

export default function CreatePagePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [pageName, setPageName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const createPage = useCreatePage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const isValid = pageName.trim().length > 0 && category.length > 0;

  const handleSubmit = async () => {
    if (!identity) {
      toast.error('Please log in to create a page');
      return;
    }
    if (!isValid) {
      toast.error('Please provide a page name and category');
      return;
    }

    try {
      let profileImage: ExternalBlob | null = null;
      if (imageFile) {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        profileImage = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      const pageId = await createPage.mutateAsync({
        pageName: pageName.trim(),
        category,
        description: description.trim(),
        profileImage,
        isPrivate,
      });

      toast.success('Page created successfully!');
      navigate({ to: '/communities' });
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/communities' })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Create Page</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Page Name */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Page Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            placeholder="Enter page name"
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={createPage.isPending}
          />
        </div>

        {/* Category */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Category <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={createPage.isPending}
            >
              <span className={category ? 'text-foreground' : 'text-muted-foreground'}>
                {category || 'Select a category'}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                {PAGE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                      category === cat ? 'text-primary font-semibold' : 'text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your page..."
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
            disabled={createPage.isPending}
          />
        </div>

        {/* Profile Image */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">Profile Image</label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
              {createPage.isPending && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={createPage.isPending}
              className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-50"
            >
              <Image className="w-8 h-8" />
              <span className="text-sm">Upload Image</span>
            </button>
          )}
        </div>

        {/* Privacy */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Private Page</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPrivate ? 'Only visible to you' : 'Visible to everyone'}
              </p>
            </div>
            <button
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPrivate ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isPrivate ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || createPage.isPending || !identity}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPage.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Page...
            </>
          ) : (
            'Create Page'
          )}
        </button>

        {!identity && (
          <p className="text-center text-sm text-muted-foreground">
            Please log in to create a page
          </p>
        )}
      </div>
    </div>
  );
}
