import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function PagesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Pages</h2>
          <Button
            onClick={() => navigate({ to: '/pages/create' })}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] gap-2"
          >
            <FileText className="h-4 w-4" />
            Create Page
          </Button>
        </div>

        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-20 w-20 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Pages Coming Soon</h3>
          <p className="mb-6">
            Create and manage public pages for organizations, public figures, and communities.
          </p>
          <Button
            onClick={() => navigate({ to: '/pages/create' })}
            className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]"
          >
            Create Your First Page
          </Button>
        </div>
      </div>
    </div>
  );
}
