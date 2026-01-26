import { useState, useCallback } from 'react';
import { AIReadinessResult, ProcessingStage, CriterionResult } from '@/types/resume';
import { toast } from '@/hooks/use-toast';

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-resume`;

export function useResumeAnalysis() {
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [result, setResult] = useState<AIReadinessResult | null>(null);
  const [resumeText, setResumeText] = useState<string>('');

  const analyzeResume = useCallback(async (file: File) => {
    setStage('uploading');
    setResult(null);

    try {
      // Extract text from file
      setStage('extracting');
      const text = await extractTextFromFile(file);
      setResumeText(text);

      if (text.length < 50) {
        throw new Error('Could not extract sufficient text from the resume');
      }

      // Simulate stage progression for UX
      setStage('detecting_domain');
      await sleep(500);
      
      setStage('generating_criteria');
      await sleep(500);
      
      setStage('scoring');

      // Call the analysis API
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ resumeText: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setStage('complete');

    } catch (error) {
      console.error('Analysis error:', error);
      setStage('error');
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  }, []);

  const evaluateCustomCriteria = useCallback(async (criteria: string): Promise<CriterionResult | null> => {
    if (!resumeText) {
      toast({
        title: 'No Resume',
        description: 'Please analyze a resume first',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ resumeText, customCriteria: criteria }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Evaluation failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Custom evaluation error:', error);
      toast({
        title: 'Evaluation Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
      return null;
    }
  }, [resumeText]);

  const reset = useCallback(() => {
    setStage('idle');
    setResult(null);
    setResumeText('');
  }, []);

  return {
    stage,
    result,
    analyzeResume,
    evaluateCustomCriteria,
    reset,
  };
}

async function extractTextFromFile(file: File): Promise<string> {
  // For text-based extraction, we'll read the file as text
  // In production, you'd want to use a proper PDF parser
  
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }

  // For PDF/DOCX, we'll try to read as text (this is a simplified approach)
  // A more robust solution would use PDF.js or similar
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Try to extract readable text from binary
  let text = '';
  let inText = false;
  let buffer = '';
  
  for (let i = 0; i < bytes.length; i++) {
    const char = bytes[i];
    
    // Check for PDF text markers
    if (char >= 32 && char <= 126) {
      buffer += String.fromCharCode(char);
      if (buffer.length > 3) inText = true;
    } else if (char === 10 || char === 13) {
      if (inText && buffer.length > 5) {
        text += buffer + '\n';
      }
      buffer = '';
      inText = false;
    } else {
      if (inText && buffer.length > 5) {
        text += buffer + ' ';
      }
      buffer = '';
      inText = false;
    }
  }

  // Clean up extracted text
  text = text
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // If extraction failed, throw error with helpful message
  if (text.length < 50) {
    throw new Error('Could not extract text from file. Please ensure the file contains readable text or try a different format.');
  }

  return text;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
