import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import { EnhancedContent, PDFGenerationRequest, APIResponse, TOCItem, Citation } from '@/types';
import { sanitizeFilename, estimateReadingTime } from '@/lib/content-utils';

// Configure Puppeteer for different environments
const isDev = process.env.NODE_ENV === 'development';
const isVercel = process.env.VERCEL === '1';

async function getBrowser() {
  if (isDev) {
    // Use regular puppeteer in development
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  
  if (isVercel) {
    // Use @sparticuz/chromium for Vercel deployment
    return await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  
  // Fallback configuration
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  // Set timeout for Vercel serverless functions
  const timeoutId = setTimeout(() => {
    console.log('PDF generation timeout warning - may exceed serverless limits');
  }, 45000); // 45 seconds warning (Vercel has 60s limit)

  try {
    const { content, options }: PDFGenerationRequest = await request.json();

    if (!content) {
      clearTimeout(timeoutId);
      return NextResponse.json({
        success: false,
        error: 'Content is required for PDF generation',
      } as APIResponse);
    }

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(content, options);

    // Launch Puppeteer and generate PDF
    const browser = await getBrowser();

    const page = await browser.newPage();
    
    // Set content and wait for any dynamic content to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        bottom: '1in',
        left: '0.8in',
        right: '0.8in',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          ${content.original.title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
    });

    await browser.close();
    clearTimeout(timeoutId);

    // Generate filename
    const filename = sanitizeFilename(`${content.original.title}-enhanced`) + '.pdf';

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('PDF generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate PDF',
    } as APIResponse);
  }
}

function generatePDFHTML(content: EnhancedContent, options?: PDFGenerationRequest['options']): string {
  const {
    includeTableOfContents = true,
    includeCitations = true,
    includeOriginal = false,
  } = options || {};

  const readingTime = estimateReadingTime(content.enhanced);
  const currentDate = new Date().toLocaleDateString();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.original.title} - Enhanced</title>
      <style>
        ${getPDFStyles()}
      </style>
    </head>
    <body>
      <!-- Cover Page -->
      <div class="cover-page">
        <div class="cover-content">
          <h1 class="cover-title">${content.original.title}</h1>
          ${content.original.author ? `<p class="cover-author">By ${content.original.author}</p>` : ''}
          <div class="cover-metadata">
            <p><strong>Enhanced with:</strong> ${content.model.toUpperCase()} (${content.action})</p>
            <p><strong>Generated:</strong> ${currentDate}</p>
            <p><strong>Estimated reading time:</strong> ${readingTime} minutes</p>
            ${content.original.url ? `<p><strong>Original source:</strong> <a href="${content.original.url}">${content.original.url}</a></p>` : ''}
          </div>
        </div>
      </div>

      <!-- Table of Contents -->
      ${includeTableOfContents && content.tableOfContents ? generateTOCHTML(content.tableOfContents) : ''}

      <!-- Enhanced Content -->
      <div class="main-content">
        <h1>Enhanced Content</h1>
        <div class="content-body">
          ${convertMarkdownToHTML(content.enhanced)}
        </div>
      </div>

      <!-- Original Content -->
      ${includeOriginal ? `
        <div class="page-break"></div>
        <div class="original-content">
          <h1>Original Content</h1>
          <div class="content-body">
            ${content.original.content.replace(/\n/g, '</p><p>')}
          </div>
        </div>
      ` : ''}

      <!-- Citations -->
      ${includeCitations && content.citations && content.citations.length > 0 ? generateCitationsHTML(content.citations) : ''}
    </body>
    </html>
  `;

  return html;
}

function getPDFStyles(): string {
  return `
    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }

    .cover-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      page-break-after: always;
    }

    .cover-title {
      font-size: 2.5em;
      margin-bottom: 0.5em;
      color: #2c3e50;
    }

    .cover-author {
      font-size: 1.2em;
      color: #7f8c8d;
      margin-bottom: 2em;
    }

    .cover-metadata {
      font-size: 0.9em;
      color: #666;
      max-width: 500px;
      margin: 0 auto;
    }

    .cover-metadata p {
      margin: 0.5em 0;
    }

    .toc {
      page-break-after: always;
      padding: 2em 0;
    }

    .toc h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5em;
    }

    .toc ul {
      list-style: none;
      padding-left: 0;
    }

    .toc li {
      margin: 0.5em 0;
      padding-left: 1em;
    }

    .toc .level-2 { padding-left: 2em; }
    .toc .level-3 { padding-left: 3em; }
    .toc .level-4 { padding-left: 4em; }

    .main-content {
      padding: 2em 0;
    }

    .content-body {
      text-align: justify;
    }

    .content-body h1,
    .content-body h2,
    .content-body h3,
    .content-body h4,
    .content-body h5,
    .content-body h6 {
      color: #2c3e50;
      margin-top: 2em;
      margin-bottom: 1em;
    }

    .content-body h1 {
      font-size: 2em;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5em;
    }

    .content-body h2 {
      font-size: 1.5em;
    }

    .content-body p {
      margin: 1em 0;
    }

    .content-body ul,
    .content-body ol {
      margin: 1em 0;
      padding-left: 2em;
    }

    .content-body blockquote {
      border-left: 4px solid #3498db;
      padding-left: 1em;
      margin: 1.5em 0;
      font-style: italic;
      color: #666;
    }

    .original-content {
      padding: 2em 0;
      color: #555;
    }

    .original-content h1 {
      color: #2c3e50;
      border-bottom: 2px solid #e74c3c;
      padding-bottom: 0.5em;
    }

    .citations {
      page-break-before: always;
      padding: 2em 0;
    }

    .citations h1 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 0.5em;
    }

    .citation {
      margin: 1em 0;
      padding: 1em;
      border-left: 3px solid #3498db;
      background-color: #f8f9fa;
    }

    .citation-title {
      font-weight: bold;
      color: #2c3e50;
    }

    .citation-meta {
      font-size: 0.9em;
      color: #666;
      margin-top: 0.5em;
    }

    .page-break {
      page-break-before: always;
    }

    a {
      color: #3498db;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    @media print {
      body {
        font-size: 12pt;
      }
    }
  `;
}

function generateTOCHTML(toc: TOCItem[]): string {
  return `
    <div class="toc">
      <h1>Table of Contents</h1>
      <ul>
        ${toc.map(item => `
          <li class="level-${item.level}">
            <a href="#${item.id}">${item.title}</a>
            ${item.children ? generateNestedTOC(item.children) : ''}
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function generateNestedTOC(items: TOCItem[]): string {
  return `
    <ul>
      ${items.map(item => `
        <li class="level-${item.level}">
          <a href="#${item.id}">${item.title}</a>
          ${item.children ? generateNestedTOC(item.children) : ''}
        </li>
      `).join('')}
    </ul>
  `;
}

function generateCitationsHTML(citations: Citation[]): string {
  return `
    <div class="citations">
      <h1>Citations & References</h1>
      ${citations.map((citation, index) => `
        <div class="citation">
          <div class="citation-title">[${index + 1}] ${citation.title}</div>
          <div class="citation-meta">
            ${citation.author ? `Author: ${citation.author}<br>` : ''}
            ${citation.url ? `URL: <a href="${citation.url}">${citation.url}</a><br>` : ''}
            ${citation.publishedDate ? `Published: ${citation.publishedDate}<br>` : ''}
            ${citation.description ? `Description: ${citation.description}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function convertMarkdownToHTML(markdown: string): string {
  // Basic markdown to HTML conversion
  // In a production app, you'd use a proper markdown parser like marked or remark
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')
    .replace(/^(.*)$/gim, '<p>$1</p>');
}
