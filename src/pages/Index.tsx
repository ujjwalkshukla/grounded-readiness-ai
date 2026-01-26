import { Brain, Sparkles, Shield, Target } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { ResultsView } from '@/components/ResultsView';
import { useResumeAnalysis } from '@/hooks/useResumeAnalysis';

const Index = () => {
  const { stage, result, analyzeResume, evaluateCustomCriteria, reset } = useResumeAnalysis();

  const isProcessing = ['uploading', 'extracting', 'detecting_domain', 'generating_criteria', 'scoring'].includes(stage);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Career Intelligence
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
              Discover Your{' '}
              <span className="gradient-text">AI Readiness</span>{' '}
              Score
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and get an evidence-based assessment of how prepared you are 
              to thrive in an AI-first workplace. No fluff, just facts from your experience.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {stage === 'idle' || stage === 'error' ? (
          <div className="space-y-16">
            {/* Upload Section */}
            <section className="animate-fade-in">
              <UploadZone onFileSelect={analyzeResume} isProcessing={isProcessing} />
            </section>

            {/* Features Grid */}
            <section className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard
                  icon={<Brain className="h-6 w-6" />}
                  title="Domain-Aware"
                  description="Automatically detects your career domain and tailors evaluation criteria accordingly"
                />
                <FeatureCard
                  icon={<Target className="h-6 w-6" />}
                  title="Evidence-Based"
                  description="Every score is grounded in specific evidence from your resume—no guessing"
                />
                <FeatureCard
                  icon={<Shield className="h-6 w-6" />}
                  title="Privacy-First"
                  description="Your resume is processed securely and used only for scoring—never stored"
                />
              </div>
            </section>

            {/* How It Works */}
            <section className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
                How It Works
              </h2>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { step: '1', title: 'Upload', desc: 'Drop your resume' },
                  { step: '2', title: 'Analyze', desc: 'AI extracts insights' },
                  { step: '3', title: 'Evaluate', desc: 'Criteria are scored' },
                  { step: '4', title: 'Learn', desc: 'Get actionable results' },
                ].map((item) => (
                  <div key={item.step} className="glass-card p-6 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-display font-bold mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-display font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : isProcessing ? (
          <div className="py-16 animate-fade-in">
            <ProcessingProgress stage={stage} />
          </div>
        ) : result ? (
          <ResultsView
            result={result}
            onEvaluateCustom={evaluateCustomCriteria}
            onReset={reset}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Your resume content is used only for generating your AI Readiness Score. 
            We don't store your resume or share your data.
          </p>
        </div>
      </footer>
    </div>
  );
};

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="glass-card p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
