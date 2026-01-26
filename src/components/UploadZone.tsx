import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [selectedFile, onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          'upload-zone p-12 text-center cursor-pointer',
          isDragging && 'active',
          selectedFile && 'border-primary'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-xl bg-primary/10 px-6 py-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="ml-2 rounded-full p-1 hover:bg-destructive/10 transition-colors"
                disabled={isProcessing}
              >
                <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileInput}
              disabled={isProcessing}
            />
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-xl font-display font-semibold text-foreground">
                  Drop your resume here
                </p>
                <p className="mt-2 text-muted-foreground">
                  or click to browse • PDF, DOCX supported
                </p>
              </div>
            </div>
          </label>
        )}
      </div>

      {selectedFile && (
        <div className="mt-6 text-center animate-fade-in">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isProcessing}
            className="px-12 py-6 text-lg font-display font-semibold shadow-glow hover:shadow-glow-lg transition-all"
          >
            {isProcessing ? 'Analyzing...' : 'Analyze AI Readiness'}
          </Button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        🔒 Your resume is processed securely and used only for scoring
      </p>
    </div>
  );
}
