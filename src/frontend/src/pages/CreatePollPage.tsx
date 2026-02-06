import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useCreatePoll } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isPublic, setIsPublic] = useState(true);
  const createPoll = useCreatePoll();
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, loginStatus } = useInternetIdentity();

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    } else {
      toast.error('Maximum 6 options allowed');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 2 options required');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Check authentication
    if (!identity) {
      toast.error('Please log in to create a poll');
      return;
    }

    // Check actor availability
    if (!actor) {
      toast.error('System not ready. Please wait a moment and try again.');
      return;
    }

    // Validation
    if (!question.trim()) {
      toast.error('Please enter a poll question');
      return;
    }

    const filledOptions = options.filter(opt => opt.trim() !== '');
    if (filledOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    try {
      await createPoll.mutateAsync({
        question: question.trim(),
        options: filledOptions,
        isPublic,
      });

      toast.success('Poll created successfully!');
      
      // Navigate back to polls page
      navigate({ to: '/polls' });
    } catch (error: any) {
      console.error('Failed to create poll:', error);
      toast.error(`Failed to create poll: ${error?.message || 'Unknown error'}`);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!question.trim()) return false;
    const filledOptions = options.filter(opt => opt.trim() !== '');
    return filledOptions.length >= 2;
  };

  // Check if submit should be disabled
  const isSubmitDisabled = !isFormValid() || createPoll.isPending || actorFetching || !actor || !identity;

  return (
    <div className="min-h-full bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/polls' })}
            className="text-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create a Poll</h2>
            <p className="text-sm text-muted-foreground">
              {isPublic ? 'Public Poll' : 'Private Poll'}
            </p>
          </div>
        </div>

        {/* Authentication Warning */}
        {!identity && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please log in to create a poll
            </p>
          </div>
        )}

        {/* Create Poll Form */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleCreatePoll} className="space-y-6">
              {/* Question Input */}
              <div className="space-y-2">
                <Label htmlFor="poll-question" className="text-base font-semibold text-foreground">
                  Enter your Question
                </Label>
                <Input
                  id="poll-question"
                  type="text"
                  placeholder="What would you like to ask?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="text-base border-[oklch(0.70_0.05_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-[oklch(0.45_0.12_250)]"
                  maxLength={200}
                  disabled={!identity}
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground">
                  Options
                </Label>
                
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="text-base border-[oklch(0.70_0.05_250)] focus:border-[oklch(0.45_0.12_250)] focus:ring-[oklch(0.45_0.12_250)]"
                          maxLength={100}
                          disabled={!identity}
                        />
                      </div>
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          aria-label={`Remove option ${index + 1}`}
                          disabled={!identity}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Option Button */}
                {options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="w-full text-[oklch(0.45_0.12_250)] border-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.45_0.12_250)]/5"
                    disabled={!identity}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add option
                  </Button>
                )}
              </div>

              {/* Settings Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-base font-semibold text-foreground">Settings</h3>
                
                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label htmlFor="privacy-toggle" className="text-base font-medium cursor-pointer">
                      Privacy
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isPublic ? 'Anyone can see and vote on this poll' : 'Only you can see this poll'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${!isPublic ? 'text-muted-foreground' : 'text-foreground'}`}>
                      Public
                    </span>
                    <Switch
                      id="privacy-toggle"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      className="data-[state=checked]:bg-[oklch(0.45_0.12_250)]"
                      disabled={!identity}
                    />
                  </div>
                </div>
              </div>

              {/* Post Poll Button */}
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full bg-[oklch(0.45_0.12_250)] hover:bg-[oklch(0.40_0.12_250)] text-white font-medium text-base py-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPoll.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Poll...
                  </>
                ) : actorFetching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Initializing...
                  </>
                ) : !identity ? (
                  'Log in to Post Poll'
                ) : !isFormValid() ? (
                  'Complete Form to Post Poll'
                ) : (
                  'Post Poll'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-8 mt-12 text-sm text-muted-foreground">
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
