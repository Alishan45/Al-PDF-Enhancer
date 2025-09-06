'use client';

import { useState } from 'react';
import { ContentInputForm } from '@/components/forms/ContentInputForm';
import { ContentPreview } from '@/components/layout/ContentPreview';
import { useContentProcessor } from '@/hooks/useContentProcessor';
import { ProcessingOptions } from '@/types';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { AnimatedWrapper, SlideIn, FadeIn } from '@/components/layout/AnimatedWrapper';

export default function Home() {
  const {
    isProcessing,
    currentStep,
    enhancedContent,
    error,
    processContent,
    generatePDF,
    reset,
    clearError,
  } = useContentProcessor();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleContentSubmit = async (
    input: { url?: string; text?: string },
    options: ProcessingOptions
  ) => {
    clearError();
    try {
      await processContent(input, options);
      toast.success('Content successfully enhanced!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Processing failed');
    }
  };

  const handlePDFGeneration = async (options: Record<string, boolean>) => {
    if (!enhancedContent) return;
    
    setIsGeneratingPDF(true);
    try {
      await generatePDF(enhancedContent, options);
      toast.success('PDF generated and downloaded successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'PDF generation failed');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleReset = () => {
    reset();
    setIsGeneratingPDF(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <AnimatedWrapper>
          <div className="relative text-center mb-8">
            <div className="absolute top-0 right-0">
              <ThemeToggle />
            </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            AI Content-to-PDF Enhancer
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            Transform web articles and text into beautifully formatted PDFs using AI
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold">🆓 Powered by Latest Gemini Models</span> - Free Google AI models including Gemini 2.0 Flash Experimental. 
              Add your own OpenAI or Claude API keys for premium options.
            </p>
          </div>
          </div>
        </AnimatedWrapper>

        {/* Error Display */}
        {error && (
          <FadeIn className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </FadeIn>
        )}

        {/* Main Content */}
        {!enhancedContent ? (
          <SlideIn delay={0.2}>
            <ContentInputForm
              onSubmit={handleContentSubmit}
              isProcessing={isProcessing}
              currentStep={currentStep}
            />
          </SlideIn>
        ) : (
          <SlideIn className="space-y-6">
            {/* Reset Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Process New Content
              </Button>
            </div>

            {/* Content Preview */}
            <ContentPreview
              content={enhancedContent}
              onGeneratePDF={handlePDFGeneration}
              isGeneratingPDF={isGeneratingPDF}
            />
          </SlideIn>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
