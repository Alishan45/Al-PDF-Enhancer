export interface ContentInput {
  type: 'url' | 'text';
  content: string;
}

export interface ProcessingOptions {
  model: 'gemini-2.0-flash-exp' | 'gemini-1.5-flash-latest' | 'gemini-1.5-flash' | 'openai' | 'claude';
  action: 'summarize' | 'expand' | 'validate';
  includeOriginal: boolean;
  generateCitations: boolean;
}

export interface ExtractedContent {
  title: string;
  author?: string;
  publishedDate?: string;
  content: string;
  url?: string;
  metadata?: {
    description?: string;
    image?: string;
    siteName?: string;
  };
}

export interface EnhancedContent {
  original: ExtractedContent;
  enhanced: string;
  action: ProcessingOptions['action'];
  model: ProcessingOptions['model'];
  citations?: Citation[];
  tableOfContents?: TOCItem[];
}

export interface Citation {
  id: string;
  title: string;
  url?: string;
  author?: string;
  publishedDate?: string;
  description?: string;
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

export interface PDFGenerationRequest {
  content: EnhancedContent;
  options?: {
    includeTableOfContents: boolean;
    includeCitations: boolean;
    includeOriginal: boolean;
  };
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ModelConfig {
  name: string;
  provider: 'gemini' | 'openai' | 'claude';
  model: string;
  maxTokens: number;
  isDefault?: boolean;
  requiresApiKey?: boolean;
  description?: string;
}

export const AI_MODELS: Record<string, ModelConfig> = {
  'gemini-2.0-flash-exp': {
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    maxTokens: 8192,
    isDefault: true,
    requiresApiKey: false,
    description: 'Latest experimental Gemini model with enhanced capabilities (free)',
  },
  'gemini-1.5-flash-latest': {
    name: 'Gemini 1.5 Flash (Latest)',
    provider: 'gemini',
    model: 'gemini-1.5-flash-latest',
    maxTokens: 8192,
    requiresApiKey: false,
    description: 'Latest Gemini 1.5 Flash with most recent updates (free)',
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    maxTokens: 8192,
    requiresApiKey: false,
    description: 'Fast, reliable Gemini model for most use cases (free)',
  },
  'gpt-4': {
    name: 'GPT-4 Turbo',
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    requiresApiKey: true,
    description: 'Premium OpenAI model (requires API key)',
  },
  'claude-3': {
    name: 'Claude 3 Sonnet',
    provider: 'claude',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    requiresApiKey: true,
    description: 'Premium Anthropic model (requires API key)',
  },
} as const;
