import React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, FileText, Lock, Globe, Loader2 } from 'lucide-react';
import { useGetPageById } from '../hooks/useQueries';

export default function PageDetailPage() {
  const { pageId } = useParams({ from: '/pages/$pageId' });
  const navigate = useNavigate();

  const pageIndex = parseInt(pageId, 10);
  const { data: page, isLoading } = useGetPageById(isNaN(pageIndex) ? undefined : pageIndex);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-20 px-4">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Page not found</p>
        <button
          onClick={() => navigate({ to: '/communities' })}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  const imageUrl = page.profileImage ? page.profileImage.getDirectURL() : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/communities' })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1 truncate">{page.pageName}</h1>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Profile Image */}
        {imageUrl && (
          <div className="w-full h-40 rounded-2xl overflow-hidden mb-4">
            <img src={imageUrl} alt={page.pageName} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Page Info */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-foreground">{page.pageName}</h2>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              {page.isPrivate ? (
                <><Lock className="w-3.5 h-3.5" /> Private</>
              ) : (
                <><Globe className="w-3.5 h-3.5" /> Public</>
              )}
            </div>
          </div>

          <span className="inline-block bg-primary/15 text-primary text-xs font-semibold px-3 py-1 rounded-full">
            {page.category}
          </span>

          {page.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{page.description}</p>
          )}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Owner: {page.owner.toString().slice(0, 12)}...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Created: {new Date(Number(page.creationTime) / 1_000_000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
