import { useState } from 'react';
import { ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { CriterionResult } from '@/types/resume';
import { cn } from '@/lib/utils';

interface CriterionCardProps {
  criterion: CriterionResult;
  index: number;
}

export function CriterionCard({ criterion, index }: CriterionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-score-excellent';
    if (score >= 65) return 'bg-score-good';
    if (score >= 50) return 'bg-score-moderate';
    if (score >= 35) return 'bg-score-needs-work';
    return 'bg-score-low';
  };

  const getScoreWidth = (score: number) => {
    return `${score}%`;
  };

  return (
    <div
      className="criterion-card"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-foreground">
            {criterion.criterion}
          </h3>
          
          {/* Score bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-1000', getScoreColor(criterion.score))}
                style={{ width: getScoreWidth(criterion.score) }}
              />
            </div>
            <span className="font-display font-bold text-lg min-w-[3ch]">
              {criterion.score}
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className="mt-4 text-muted-foreground leading-relaxed">
        {criterion.explanation}
      </p>

      {/* Evidence toggle */}
      {criterion.evidence_used.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide evidence
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View evidence from resume ({criterion.evidence_used.length})
              </>
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 animate-fade-in">
              {criterion.evidence_used.map((evidence, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <Quote className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground italic">{evidence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
