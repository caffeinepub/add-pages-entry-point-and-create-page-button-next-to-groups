import React, { useState } from 'react';
import { BookOpen, Brain, ChevronRight, Clock, Star, Loader2 } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  summary: string;
  category: string;
  readingTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Quiz {
  id: number;
  title: string;
  category: string;
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const SAMPLE_MODULES: Module[] = [
  {
    id: 1,
    title: 'Understanding the Indian Constitution',
    summary: 'Learn about the fundamental rights, duties, and structure of the Indian Constitution.',
    category: 'Governance',
    readingTime: 10,
    difficulty: 'beginner',
  },
  {
    id: 2,
    title: 'How Parliament Works',
    summary: 'Explore the legislative process, roles of Lok Sabha and Rajya Sabha.',
    category: 'Policy',
    readingTime: 15,
    difficulty: 'intermediate',
  },
  {
    id: 3,
    title: 'Local Government & Panchayati Raj',
    summary: 'Understand the three-tier system of local self-governance in India.',
    category: 'Governance',
    readingTime: 8,
    difficulty: 'beginner',
  },
  {
    id: 4,
    title: 'Civic Rights & Responsibilities',
    summary: 'Know your fundamental rights and duties as a citizen of India.',
    category: 'Rights & Duties',
    readingTime: 12,
    difficulty: 'beginner',
  },
];

const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 1,
    title: 'Constitution Basics',
    category: 'Governance',
    questionCount: 10,
    difficulty: 'beginner',
  },
  {
    id: 2,
    title: 'Indian Political System',
    category: 'Policy',
    questionCount: 15,
    difficulty: 'intermediate',
  },
  {
    id: 3,
    title: 'Civic Duties Quiz',
    category: 'Rights & Duties',
    questionCount: 8,
    difficulty: 'beginner',
  },
];

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes'>('modules');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSelectedModule(null)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-lg font-bold text-foreground flex-1 truncate">{selectedModule.title}</h1>
        </div>
        <div className="px-4 py-4 max-w-lg mx-auto">
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[selectedModule.difficulty]}`}>
                {selectedModule.difficulty}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedModule.readingTime} min read
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">{selectedModule.title}</h2>
            <p className="text-sm text-muted-foreground">{selectedModule.summary}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This module content is coming soon. We are working on providing comprehensive civic education
              materials to help you understand your rights, duties, and the democratic processes that shape
              our society.
            </p>
            <div className="mt-4 p-3 bg-primary/10 rounded-xl">
              <p className="text-sm text-primary font-medium">
                📚 Full content will be available in the next update!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Civic Education</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'modules'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Modules
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'quizzes'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          <Brain className="w-4 h-4" />
          Quizzes
        </button>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {activeTab === 'modules' &&
          SAMPLE_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className="w-full bg-card border border-border rounded-2xl p-4 hover:bg-muted/50 transition-all text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[module.difficulty]}`}>
                      {module.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{module.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{module.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{module.summary}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {module.readingTime} min read
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}

        {activeTab === 'quizzes' &&
          SAMPLE_QUIZZES.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[quiz.difficulty]}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">{quiz.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {quiz.questionCount} questions
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  Coming soon
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
