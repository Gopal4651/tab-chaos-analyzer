import type { ChaosAnalysis, ChaosLevel } from '@/lib/types.js';
import clsx from 'clsx';

interface ChaosScoreDisplayProps {
  analysis: ChaosAnalysis;
}

const LEVEL_CONFIG: Record<ChaosLevel, {
  label: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  zen: {
    label: 'Zen Master',
    emoji: '🧘‍♀️',
    color: 'chaos-zen',
    description: 'Your tabs are in perfect harmony'
  },
  organized: {
    label: 'Organized Human',
    emoji: '📊',
    color: 'chaos-good',
    description: 'Functional and efficient browsing'
  },
  controlled: {
    label: 'Controlled Chaos',
    emoji: '🤹‍♂️',
    color: 'chaos-mild',
    description: 'Walking the productivity tightrope'
  },
  hoarder: {
    label: 'Digital Hoarder',
    emoji: '📚',
    color: 'chaos-bad',
    description: 'Your browser is struggling'
  },
  apocalypse: {
    label: 'Browser Apocalypse',
    emoji: '🔥',
    color: 'chaos-apocalypse',
    description: 'Send help immediately'
  }
};

export default function ChaosScoreDisplay({ analysis }: ChaosScoreDisplayProps) {
  const config = LEVEL_CONFIG[analysis.level];
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (analysis.score / 100) * circumference;

  return (
    <div className="text-center">
      {/* Circular Progress */}
      <div className="chaos-score-circle mb-4">
        <svg width="120" height="120" className="drop-shadow-sm">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke={`var(--color-${config.color.replace('chaos-', '')})`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
            style={{
              '--color-zen': '#10b981',
              '--color-good': '#3b82f6',
              '--color-mild': '#f59e0b',
              '--color-bad': '#ef4444',
              '--color-apocalypse': '#dc2626'
            } as React.CSSProperties}
          />
        </svg>
        
        {/* Score in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {analysis.score}
            </div>
            <div className="text-xs text-gray-500 -mt-1">
              /100
            </div>
          </div>
        </div>
      </div>

      {/* Level Badge */}
      <div className={clsx(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-3',
        `chaos-level-${analysis.level}`
      )}>
        <span className="text-lg">{config.emoji}</span>
        <span>{config.label}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 max-w-xs mx-auto">
        {config.description}
      </p>

      {/* Score breakdown hint */}
      <div className="mt-4 text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          <span>Score based on duplicates, stale tabs, clustering & volume</span>
        </div>
      </div>
    </div>
  );
}