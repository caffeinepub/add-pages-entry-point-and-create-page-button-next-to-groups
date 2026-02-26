import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreatePoll } from '../hooks/useQueries';
import { getBackendErrorMessage } from '../utils/backendErrors';
import { toast } from 'sonner';

export default function CreatePollPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublic, setIsPublic] = useState(true);

  const createPoll = useCreatePoll();

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const isValid =
    question.trim().length > 0 &&
    options.filter((o) => o.trim().length > 0).length >= 2;

  const handleSubmit = async () => {
    if (!identity) {
      toast.error('Please log in to create a poll');
      return;
    }
    if (!isValid) {
      toast.error('Please provide a question and at least 2 options');
      return;
    }

    const validOptions = options.filter((o) => o.trim().length > 0);

    try {
      await createPoll.mutateAsync({
        question: question.trim(),
        options: validOptions,
        isPublic,
      });
      toast.success('Poll created successfully!');
      navigate({ to: '/polls' });
    } catch (err) {
      toast.error(getBackendErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/polls' })}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Create Poll</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Question */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">
            Poll Question <span className="text-destructive">*</span>
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px]"
            disabled={createPoll.isPending}
          />
        </div>

        {/* Options */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Options <span className="text-destructive">*</span>
            <span className="text-muted-foreground font-normal ml-1">(min 2, max 6)</span>
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={createPoll.isPending}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    disabled={createPoll.isPending}
                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              onClick={addOption}
              disabled={createPoll.isPending}
              className="mt-3 flex items-center gap-2 text-sm text-primary font-medium hover:underline disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>

        {/* Privacy */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Public Poll</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPublic ? 'Visible to everyone' : 'Only visible to you'}
              </p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  isPublic ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || createPoll.isPending || !identity}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPoll.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Poll...
            </>
          ) : (
            'Create Poll'
          )}
        </button>

        {!identity && (
          <p className="text-center text-sm text-muted-foreground">
            Please log in to create a poll
          </p>
        )}
      </div>
    </div>
  );
}
