import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  band: string;
}

export function ScoreDisplay({ score, band }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(score, Math.round(increment * step));
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayScore(score);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 80) return 'text-score-excellent';
    if (score >= 65) return 'text-score-good';
    if (score >= 50) return 'text-score-moderate';
    if (score >= 35) return 'text-score-needs-work';
    return 'text-score-low';
  };

  const getScoreGradient = () => {
    if (score >= 80) return 'from-score-excellent to-score-good';
    if (score >= 65) return 'from-score-good to-primary';
    if (score >= 50) return 'from-score-moderate to-score-good';
    if (score >= 35) return 'from-score-needs-work to-score-moderate';
    return 'from-score-low to-score-needs-work';
  };

  const circumference = 2 * Math.PI * 120;
  const progress = (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center animate-score-reveal">
      <div className="relative w-72 h-72">
        {/* Background ring */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-75"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--score-excellent))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'text-7xl font-display font-bold transition-colors',
            getScoreColor()
          )}>
            {displayScore}
          </span>
          <span className="text-muted-foreground font-medium">out of 100</span>
        </div>
      </div>

      {/* Band label */}
      <div className={cn(
        'mt-4 px-6 py-2 rounded-full font-display font-semibold text-lg bg-gradient-to-r',
        getScoreGradient(),
        'text-white shadow-lg'
      )}>
        {band}
      </div>

      <p className="mt-4 text-center text-muted-foreground max-w-sm">
        Your AI Readiness Score indicates how prepared you are to thrive in an AI-first workplace
      </p>
    </div>
  );
}
