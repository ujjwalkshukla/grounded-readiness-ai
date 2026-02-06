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
  // For text files, read directly
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }

  // For PDFs, use pdf.js for proper extraction
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  }

  // For DOCX, extract text from XML content
  if (file.name.toLowerCase().endsWith('.docx')) {
    return await extractTextFromDOCX(file);
  }

  throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Use CDN for the worker - this is more reliable than bundling
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const textParts: string[] = [];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }
  
  const fullText = textParts.join('\n\n').trim();
  
  if (fullText.length < 50) {
    throw new Error('Could not extract sufficient text from the PDF. The file may be scanned or image-based.');
  }
  
  return fullText;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  // DOCX files are ZIP archives containing XML
  const JSZip = (await import('jszip')).default;
  
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Get the main document content
  const docXml = await zip.file('word/document.xml')?.async('string');
  
  if (!docXml) {
    throw new Error('Invalid DOCX file format.');
  }
  
  // Parse XML and extract text content
  const parser = new DOMParser();
  const doc = parser.parseFromString(docXml, 'application/xml');
  
  // Extract text from all <w:t> elements
  const textNodes = doc.getElementsByTagName('w:t');
  const textParts: string[] = [];
  
  for (let i = 0; i < textNodes.length; i++) {
    const text = textNodes[i].textContent;
    if (text) {
      textParts.push(text);
    }
  }
  
  const fullText = textParts.join(' ').trim();
  
  if (fullText.length < 50) {
    throw new Error('Could not extract sufficient text from the DOCX file.');
  }
  
  return fullText;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
