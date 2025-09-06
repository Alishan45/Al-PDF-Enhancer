import { ExtractedContent, TOCItem } from '@/types';

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function extractTextContent(html: string): string {
  // Basic HTML to text conversion - in a real app you'd use a proper library
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateTableOfContents(content: string): TOCItem[] {
  const headings: TOCItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  let idCounter = 0;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = `heading-${++idCounter}`;

    headings.push({
      id,
      title,
      level,
    });
  }

  return buildHierarchicalTOC(headings);
}

function buildHierarchicalTOC(flatTOC: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const item of flatTOC) {
    // Find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    const newItem = { ...item, children: [] };

    if (stack.length === 0) {
      result.push(newItem);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(newItem);
    }

    stack.push(newItem);
  }

  return result;
}

export function formatMarkdownContent(content: string): string {
  // Add proper spacing and formatting for markdown
  return content
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/^#{1,6}\s+/gm, (match) => `\n${match}`) // Add space before headings
    .trim();
}

export function generateCitationId(): string {
  return `cite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateContent(content: ExtractedContent): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content.title || content.title.trim().length === 0) {
    errors.push('Content title is required');
  }

  if (!content.content || content.content.trim().length < 50) {
    errors.push('Content must be at least 50 characters long');
  }

  if (content.url && !isValidUrl(content.url)) {
    errors.push('Invalid URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
