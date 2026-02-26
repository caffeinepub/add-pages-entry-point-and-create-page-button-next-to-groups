import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Image, X, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateGroup } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const createGroup = useCreateGroup();

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setUploadProgress(0);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const isValid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!identity) {
      toast.error('Please log in to create a group');
      return;
    }
    if (!isValid) {
      toast.error('Please provide a group name');
      return;
    }

    try {
      let coverImage: ExternalBlob | null = null;
      if (coverFile) {
        const bytes = new Uint8Array(await coverFile.arrayBuffer());
        coverImage = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct)
        );
      }

      const groupId = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        coverImage,
      });

      toast.success('Group created successfully!');
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
        <h1 className="text-lg font-bold text-foreground">Create Group</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Group Name */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Group Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={createGroup.isPending}
          />
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your group..."
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
            disabled={createGroup.isPending}
          />
        </div>

        {/* Cover Image */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">Cover Image</label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover" />
              <button
                onClick={clearCover}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
              {createGroup.isPending && uploadProgress > 0 && uploadProgress < 100 && (
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
              onClick={() => coverInputRef.current?.click()}
              disabled={createGroup.isPending}
              className="w-full h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-50"
            >
              <Image className="w-8 h-8" />
              <span className="text-sm">Upload Cover Image</span>
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || createGroup.isPending || !identity}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createGroup.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Group...
            </>
          ) : (
            'Create Group'
          )}
        </button>

        {!identity && (
          <p className="text-center text-sm text-muted-foreground">
            Please log in to create a group
          </p>
        )}
      </div>
    </div>
  );
}
