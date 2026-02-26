import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { MapPin, AlertCircle, CheckCircle2, Clock, Plus, Loader2 } from 'lucide-react';

interface LocalIssue {
  id: number;
  title: string;
  description: string;
  status: 'new' | 'inReview' | 'resolved';
  timestamp: number;
  location?: string;
}

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  inReview: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

export default function MyAreaPage() {
  const { identity } = useInternetIdentity();
  const [issues, setIssues] = useState<LocalIssue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const newIssue: LocalIssue = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        status: 'new',
        timestamp: Date.now(),
        location: location.trim() || undefined,
      };
      setIssues((prev) => [newIssue, ...prev]);
      setTitle('');
      setDescription('');
      setLocation('');
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">My Area</h1>
        </div>
        {identity && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Report Issue
          </button>
        )}
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Report Form */}
        {showForm && identity && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <h2 className="font-semibold text-foreground">Report a Local Issue</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location (optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Street, Ward 5"
                className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Issues List */}
        {issues.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No local issues reported yet</p>
            {identity && (
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to report an issue in your area
              </p>
            )}
          </div>
        ) : (
          issues.map((issue) => {
            const config = STATUS_CONFIG[issue.status];
            const StatusIcon = config.icon;
            return (
              <div key={issue.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground text-sm">{issue.title}</h3>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${config.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
                {issue.location && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {issue.location}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(issue.timestamp).toLocaleDateString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
