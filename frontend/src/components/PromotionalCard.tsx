import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';

export default function PromotionalCard() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 mb-4 shadow-md">
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-white/90" />
          <span className="text-white/90 text-xs font-semibold uppercase tracking-wide">
            Communities
          </span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight mb-1">
          Connect with your civic community
        </h3>
        <p className="text-white/80 text-sm mb-4">
          Join groups, follow pages, and engage with fellow citizens.
        </p>
        <button
          onClick={() => navigate({ to: '/communities' })}
          className="bg-white text-primary font-semibold text-sm px-4 py-2 rounded-xl hover:bg-white/90 transition-all"
        >
          Explore Now
        </button>
      </div>
    </div>
  );
}
