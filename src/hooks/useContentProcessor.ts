import { useState } from 'react';
import { ExtractedContent, EnhancedContent, ProcessingOptions, APIResponse } from '@/types';

export interface ContentProcessorState {
  isProcessing: boolean;
  currentStep: 'idle' | 'extracting' | 'enhancing' | 'complete';
  extractedContent: ExtractedContent | null;
  enhancedContent: EnhancedContent | null;
  error: string | null;
}

export const useContentProcessor = () => {
  const [state, setState] = useState<ContentProcessorState>({
    isProcessing: false,
    currentStep: 'idle',
    extractedContent: null,
    enhancedContent: null,
    error: null,
  });

  const extractContent = async (input: { url?: string; text?: string }) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'extracting',
      error: null,
    }));

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const result: APIResponse<ExtractedContent> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to extract content');
      }

      setState(prev => ({
        ...prev,
        extractedContent: result.data!,
        currentStep: 'idle',
        isProcessing: false,
      }));

      return result.data!;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to extract content',
        isProcessing: false,
        currentStep: 'idle',
      }));
      throw error;
    }
  };

  const enhanceContent = async (content: ExtractedContent, options: ProcessingOptions) => {
    setState(prev => ({
      ...prev,
      isProcessing: true,
      currentStep: 'enhancing',
      error: null,
    }));

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, options }),
      });

      const result: APIResponse<EnhancedContent> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to enhance content');
      }

      setState(prev => ({
        ...prev,
        enhancedContent: result.data!,
        currentStep: 'complete',
        isProcessing: false,
      }));

      return result.data!;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enhance content',
        isProcessing: false,
        currentStep: 'idle',
      }));
      throw error;
    }
  };

  const processContent = async (input: { url?: string; text?: string }, options: ProcessingOptions) => {
    try {
      const extracted = await extractContent(input);
      return await enhanceContent(extracted, options);
    } catch (error) {
      // Error handling is managed in individual functions
      throw error;
    }
  };

  const generatePDF = async (content: EnhancedContent, options?: Record<string, boolean>) => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, options }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.original.title}-enhanced.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      }));
      throw error;
    }
  };

  const reset = () => {
    setState({
      isProcessing: false,
      currentStep: 'idle',
      extractedContent: null,
      enhancedContent: null,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    extractContent,
    enhanceContent,
    processContent,
    generatePDF,
    reset,
    clearError,
  };
};
