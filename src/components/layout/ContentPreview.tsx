'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Clock, 
  User, 
  Calendar, 
  Globe,
  BookOpen,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { EnhancedContent } from '@/types';
import { estimateReadingTime } from '@/lib/content-utils';

interface ContentPreviewProps {
  content: EnhancedContent;
  onGeneratePDF: (options: Record<string, boolean>) => void;
  isGeneratingPDF?: boolean;
}

export function ContentPreview({ content, onGeneratePDF, isGeneratingPDF = false }: ContentPreviewProps) {
  const [pdfOptions, setPdfOptions] = useState({
    includeTableOfContents: true,
    includeCitations: true,
    includeOriginal: false,
  });

  const readingTime = estimateReadingTime(content.enhanced);
  const originalReadingTime = estimateReadingTime(content.original.content);

  const handleGeneratePDF = () => {
    onGeneratePDF(pdfOptions);
  };

  const renderTableOfContents = () => {
    if (!content.tableOfContents || content.tableOfContents.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Table of Contents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {content.tableOfContents.map((item, index) => (
              <div key={index} className={`flex items-center gap-2 text-sm pl-${(item.level - 1) * 4}`}>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCitations = () => {
    if (!content.citations || content.citations.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Citations & References</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.citations.map((citation, index) => (
              <div key={citation.id} className="border-l-2 border-blue-200 pl-4">
                <div className="font-medium">[{index + 1}] {citation.title}</div>
                {citation.author && (
                  <div className="text-sm text-muted-foreground">By {citation.author}</div>
                )}
                {citation.url && (
                  <div className="text-sm">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      {citation.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {citation.description && (
                  <div className="text-sm text-muted-foreground mt-1">{citation.description}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with metadata */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{content.original.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {content.original.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {content.original.author}
                  </div>
                )}
                {content.original.publishedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(content.original.publishedDate).toLocaleDateString()}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readingTime} min read
                </div>
                {content.original.url && (
                  <a
                    href={content.original.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {content.model.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {content.action.charAt(0).toUpperCase() + content.action.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PDF Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Generate PDF
          </CardTitle>
          <CardDescription>
            Customize your PDF output options before downloading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="toc">Include Table of Contents</Label>
                <p className="text-sm text-muted-foreground">Add a navigable table of contents</p>
              </div>
              <Switch
                id="toc"
                checked={pdfOptions.includeTableOfContents}
                onCheckedChange={(checked) => 
                  setPdfOptions(prev => ({ ...prev, includeTableOfContents: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="citations">Include Citations</Label>
                <p className="text-sm text-muted-foreground">Add references section at the end</p>
              </div>
              <Switch
                id="citations"
                checked={pdfOptions.includeCitations}
                onCheckedChange={(checked) => 
                  setPdfOptions(prev => ({ ...prev, includeCitations: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="original">Include Original Content</Label>
                <p className="text-sm text-muted-foreground">Add original text as an appendix</p>
              </div>
              <Switch
                id="original"
                checked={pdfOptions.includeOriginal}
                onCheckedChange={(checked) => 
                  setPdfOptions(prev => ({ ...prev, includeOriginal: checked }))
                }
              />
            </div>
            
            <Button 
              onClick={handleGeneratePDF} 
              disabled={isGeneratingPDF}
              className="w-full"
              size="lg"
            >
              {isGeneratingPDF ? (
                <>
                  <FileText className="h-4 w-4 mr-2 animate-pulse" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      {renderTableOfContents()}

      {/* Enhanced Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Enhanced Content</CardTitle>
          <CardDescription>
            AI-processed content ready for PDF generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: content.enhanced
                  .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-5">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^(.*)$/gim, '<p class="mb-4">$1</p>')
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Citations */}
      {renderCitations()}

      {/* Original Content Preview (if included) */}
      {pdfOptions.includeOriginal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Original Content</CardTitle>
            <CardDescription>
              Original source content ({originalReadingTime} min read)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <div className="whitespace-pre-wrap">
                {content.original.content.substring(0, 1000)}
                {content.original.content.length > 1000 && '...'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
