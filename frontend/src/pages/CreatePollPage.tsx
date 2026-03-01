import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCreatePoll } from "../hooks/useQueries";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { formatBackendError } from "../utils/backendErrors";
import { Switch } from "@/components/ui/switch";

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isPublic, setIsPublic] = useState(true);

  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const createPoll = useCreatePoll();

  const isActorReady = !!actor && !actorFetching;
  const isAuthenticated = !!identity;

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      toast.error("Please enter a poll question.");
      return;
    }

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Please provide at least 2 options.");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please log in to create a poll.");
      return;
    }

    if (!isActorReady) {
      toast.error("Still connecting to the network. Please try again.");
      return;
    }

    try {
      await createPoll.mutateAsync({
        question: question.trim(),
        options: validOptions,
        isPublic,
      });
      navigate({ to: "/polls" });
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
          onClick={() => navigate({ to: "/polls" })}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Create Poll</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Actor not ready notice */}
          {!isActorReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
              <Loader2 size={14} className="animate-spin" />
              <span>Connecting to network…</span>
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Poll Question <span className="text-destructive">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              rows={3}
              disabled={createPoll.isPending}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Options <span className="text-destructive">*</span>
              <span className="text-muted-foreground font-normal ml-1">(min 2, max 6)</span>
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={createPoll.isPending}
                    className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={createPoll.isPending}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                disabled={createPoll.isPending}
                className="mt-2 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              >
                <Plus size={16} />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* Privacy toggle */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Public Poll</p>
              <p className="text-xs text-muted-foreground">
                {isPublic ? "Anyone can see and vote" : "Only you can see results"}
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={createPoll.isPending}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              createPoll.isPending ||
              !isActorReady ||
              !question.trim() ||
              options.filter((o) => o.trim()).length < 2
            }
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPoll.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Poll…</span>
              </>
            ) : !isActorReady ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <span>Create Poll</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
