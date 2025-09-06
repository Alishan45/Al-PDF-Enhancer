'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Globe, Type, Sparkles, CheckCircle, BookOpen } from 'lucide-react';
import { ProcessingOptions } from '@/types';
import { isValidUrl } from '@/lib/content-utils';

interface ContentInputFormProps {
  onSubmit: (input: { url?: string; text?: string }, options: ProcessingOptions) => void;
  isProcessing: boolean;
  currentStep: string;
}

export function ContentInputForm({ onSubmit, isProcessing, currentStep }: ContentInputFormProps) {
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [options, setOptions] = useState<ProcessingOptions>({
    model: 'gemini-2.0-flash-exp',
    action: 'summarize',
    includeOriginal: false,
    generateCitations: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (inputType === 'url') {
      if (!url.trim()) {
        newErrors.url = 'URL is required';
      } else if (!isValidUrl(url)) {
        newErrors.url = 'Please enter a valid URL';
      }
    } else {
      if (!text.trim()) {
        newErrors.text = 'Text content is required';
      } else if (text.trim().length < 50) {
        newErrors.text = 'Text content must be at least 50 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const input = inputType === 'url' ? { url: url.trim() } : { text: text.trim() };
    onSubmit(input, options);
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'extracting':
        return <Globe className="h-4 w-4 animate-spin" />;
      case 'enhancing':
        return <Sparkles className="h-4 w-4 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStepText = () => {
    switch (currentStep) {
      case 'extracting':
        return 'Extracting content...';
      case 'enhancing':
        return 'Enhancing with AI...';
      case 'complete':
        return 'Processing complete!';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          AI Content-to-PDF Enhancer
        </CardTitle>
        <CardDescription>
          Transform web articles or text into enhanced, professionally formatted PDFs using AI
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Type Toggle */}
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={inputType === 'url' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInputType('url')}
              className="flex-1"
            >
              <Globe className="h-4 w-4 mr-2" />
              URL
            </Button>
            <Button
              type="button"
              variant={inputType === 'text' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInputType('text')}
              className="flex-1"
            >
              <Type className="h-4 w-4 mr-2" />
              Text
            </Button>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            {inputType === 'url' ? (
              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={errors.url ? 'border-red-500' : ''}
                />
                {errors.url && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.url}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="text">Text Content</Label>
                <Textarea
                  id="text"
                  placeholder="Paste your text content here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className={errors.text ? 'border-red-500' : ''}
                />
                {errors.text && (
                  <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.text}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {text.length} characters
                </p>
              </div>
            )}
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select value={options.model} onValueChange={(value) => setOptions(prev => ({ ...prev, model: value as ProcessingOptions['model'] }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash-exp">
                  <div className="flex items-center justify-between w-full">
                    <span>Gemini 2.0 Flash (Experimental)</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">FREE • LATEST</span>
                  </div>
                </SelectItem>
                <SelectItem value="gemini-1.5-flash-latest">
                  <div className="flex items-center justify-between w-full">
                    <span>Gemini 1.5 Flash (Latest)</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">FREE • UPDATED</span>
                  </div>
                </SelectItem>
                <SelectItem value="gemini-1.5-flash">
                  <div className="flex items-center justify-between w-full">
                    <span>Gemini 1.5 Flash</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">FREE • STABLE</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex items-center justify-between w-full">
                    <span>GPT-4 Turbo</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">API KEY REQUIRED</span>
                  </div>
                </SelectItem>
                <SelectItem value="claude">
                  <div className="flex items-center justify-between w-full">
                    <span>Claude 3 Sonnet</span>
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">API KEY REQUIRED</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              All Gemini models are free! For premium models (OpenAI/Claude), add your API keys to environment variables.
            </p>
          </div>

          {/* Processing Action */}
          <div className="space-y-2">
            <Label>Processing Action</Label>
            <Select value={options.action} onValueChange={(value) => setOptions(prev => ({ ...prev, action: value as ProcessingOptions['action'] }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select processing action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summarize">Summarize</SelectItem>
                <SelectItem value="expand">Expand & Enhance</SelectItem>
                <SelectItem value="validate">Validate Claims</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="include-original">Include Original Content</Label>
                <p className="text-sm text-muted-foreground">Add the original content to the PDF</p>
              </div>
              <Switch
                id="include-original"
                checked={options.includeOriginal}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeOriginal: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="generate-citations">Generate Citations</Label>
                <p className="text-sm text-muted-foreground">Add references and citations (for validation)</p>
              </div>
              <Switch
                id="generate-citations"
                checked={options.generateCitations}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, generateCitations: checked }))}
              />
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              {getStepIcon()}
              <span className="text-sm font-medium">{getStepText()}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance Content
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
