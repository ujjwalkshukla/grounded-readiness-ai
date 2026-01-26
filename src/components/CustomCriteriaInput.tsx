import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CriterionResult } from '@/types/resume';
import { CriterionCard } from './CriterionCard';

interface CustomCriteriaInputProps {
  onEvaluate: (criteria: string) => Promise<CriterionResult | null>;
}

export function CustomCriteriaInput({ onEvaluate }: CustomCriteriaInputProps) {
  const [criteria, setCriteria] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CriterionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criteria.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const evalResult = await onEvaluate(criteria.trim());
      if (evalResult) {
        setResult(evalResult);
      } else {
        setError('Could not find sufficient evidence in your resume to evaluate this criteria.');
      }
    } catch (err) {
      setError('Failed to evaluate criteria. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 mt-8">
      <h3 className="font-display font-semibold text-lg mb-4">
        Evaluate Custom Criteria
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Enter a skill or area you'd like to evaluate (e.g., "leadership", "cloud computing")
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="Enter criteria to evaluate..."
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={!criteria.trim() || isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Evaluate'
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <CriterionCard criterion={result} index={0} />
        </div>
      )}
    </div>
  );
}
