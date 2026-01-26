import { AIReadinessResult, CriterionResult } from '@/types/resume';
import { ScoreDisplay } from './ScoreDisplay';
import { CriterionCard } from './CriterionCard';
import { CustomCriteriaInput } from './CustomCriteriaInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ResultsViewProps {
  result: AIReadinessResult;
  onEvaluateCustom: (criteria: string) => Promise<CriterionResult | null>;
  onReset: () => void;
}

export function ResultsView({ result, onEvaluateCustom, onReset }: ResultsViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 pb-16">
      {/* Header with domain */}
      <div className="text-center space-y-4 animate-fade-in">
        <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
          Detected Domain: {result.domain}
          <span className="ml-2 text-muted-foreground">
            ({Math.round(result.domain_confidence * 100)}% confidence)
          </span>
        </Badge>
        
        <h2 className="text-3xl md:text-4xl font-display font-bold">
          Your <span className="gradient-text">AI Readiness</span> Score
        </h2>
      </div>

      {/* Main score */}
      <ScoreDisplay score={result.overall_score} band={result.band} />

      {/* Criteria breakdown */}
      <div className="space-y-6">
        <h3 className="text-2xl font-display font-semibold text-center">
          Evaluation Breakdown
        </h3>
        
        <div className="grid gap-6">
          {result.criteria_results.map((criterion, index) => (
            <CriterionCard
              key={criterion.criterion}
              criterion={criterion}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Custom criteria evaluation */}
      <CustomCriteriaInput onEvaluate={onEvaluateCustom} />

      {/* Reset button */}
      <div className="text-center pt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
}
