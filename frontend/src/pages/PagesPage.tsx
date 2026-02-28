import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPages } from '../hooks/useQueries';
import { FileText, Plus, Loader2 } from 'lucide-react';
import type { Page } from '../types';

export default function PagesPage() {
  const navigate = useNavigate();
  const { data: pages = [], isLoading } = useGetAllPages();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Pages</h1>
        <button
          onClick={() => navigate({ to: '/create-page' })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create
        </button>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No pages yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create the first page!</p>
            <button
              onClick={() => navigate({ to: '/create-page' })}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Create Page
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((page: Page, idx: number) => {
              const imageUrl = page.profileImage
                ? (page.profileImage as any).getDirectURL?.()
                : null;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={page.pageName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {page.pageName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {page.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
