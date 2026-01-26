import { Check, Loader2 } from 'lucide-react';
import { ProcessingStage } from '@/types/resume';
import { cn } from '@/lib/utils';

interface ProcessingProgressProps {
  stage: ProcessingStage;
}

const stages = [
  { key: 'extracting', label: 'Extracting resume content' },
  { key: 'detecting_domain', label: 'Identifying career domain' },
  { key: 'generating_criteria', label: 'Generating evaluation criteria' },
  { key: 'scoring', label: 'Calculating AI readiness score' },
] as const;

export function ProcessingProgress({ stage }: ProcessingProgressProps) {
  const currentIndex = stages.findIndex(s => s.key === stage);

  return (
    <div className="w-full max-w-md mx-auto glass-card p-8">
      <h3 className="text-xl font-display font-semibold text-center mb-8 gradient-text">
        Analyzing Your Resume
      </h3>
      
      <div className="space-y-4">
        {stages.map((s, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = s.key === stage;
          
          return (
            <div
              key={s.key}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-all duration-500',
                isComplete && 'bg-primary/10',
                isCurrent && 'bg-primary/5 ring-1 ring-primary/20'
              )}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
                  isComplete && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              <span
                className={cn(
                  'font-medium transition-colors duration-300',
                  isComplete && 'text-primary',
                  isCurrent && 'text-foreground',
                  !isComplete && !isCurrent && 'text-muted-foreground'
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
