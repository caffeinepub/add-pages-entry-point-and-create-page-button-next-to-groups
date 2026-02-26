import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EventsPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Events & Campaigns</h2>
          <Button className="bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)]">
            Create Event
          </Button>
        </div>

        {/* Coming Soon Message */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[oklch(0.45_0.12_250)]" />
              Political Events & Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create and join political events, town halls, rallies, and civic campaigns. 
                Connect with your community and participate in local and national events.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-[oklch(0.45_0.12_250)] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Event Creation</h4>
                    <p className="text-xs text-muted-foreground">
                      Organize rallies, town halls, and campaign events
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-[oklch(0.45_0.12_250)] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">RSVP System</h4>
                    <p className="text-xs text-muted-foreground">
                      Mark interest or confirm attendance for events
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-[oklch(0.45_0.12_250)] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Location-Based</h4>
                    <p className="text-xs text-muted-foreground">
                      Find events happening in your area
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-[oklch(0.45_0.12_250)] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Event Reminders</h4>
                    <p className="text-xs text-muted-foreground">
                      Get notified about upcoming events you're interested in
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-8 mt-8 text-sm text-muted-foreground border-t">
          <p>
            © 2025. Built with love using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[oklch(0.45_0.12_250)] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
