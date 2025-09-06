import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { ExtractedContent, APIResponse } from '@/types';
import { isValidUrl, extractTextContent } from '@/lib/content-utils';

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
  try {
    const { url, text } = await request.json();

    if (!url && !text) {
      return NextResponse.json({
        success: false,
        error: 'Either URL or text content is required',
      } as APIResponse);
    }

    // If text is provided directly, return it formatted
    if (text) {
      const extractedContent: ExtractedContent = {
        title: 'User Provided Text',
        content: text,
        author: 'User Input',
        publishedDate: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: extractedContent,
      } as APIResponse<ExtractedContent>);
    }

    // Validate URL
    if (!isValidUrl(url)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid URL format',
      } as APIResponse);
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Content-PDF-Enhancer/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch content: ${response.statusText}`,
      } as APIResponse);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata and content
    const title = $('title').text() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('h1').first().text() || 
                 'Untitled';

    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '';

    const author = $('meta[name="author"]').attr('content') || 
                  $('meta[property="article:author"]').attr('content') || 
                  $('.author').first().text() || 
                  $('[rel="author"]').first().text() || '';

    const publishedDate = $('meta[property="article:published_time"]').attr('content') ||
                         $('time[datetime]').attr('datetime') ||
                         $('time').first().text() ||
                         '';

    const image = $('meta[property="og:image"]').attr('content') ||
                 $('meta[name="twitter:image"]').attr('content') ||
                 '';

    const siteName = $('meta[property="og:site_name"]').attr('content') ||
                    new URL(url).hostname;

    // Extract main content (prioritize article, main, or content containers)
    let mainContent = '';
    const contentSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0 && element.text().length > mainContent.length) {
        mainContent = element.html() || '';
      }
    }

    // Fallback to body if no main content found
    if (!mainContent || mainContent.length < 100) {
      mainContent = $('body').html() || '';
    }

    // Clean and extract text content
    const cleanContent = extractTextContent(mainContent);

    if (!cleanContent || cleanContent.length < 100) {
      return NextResponse.json({
        success: false,
        error: 'Could not extract meaningful content from the provided URL',
      } as APIResponse);
    }

    const extractedContent: ExtractedContent = {
      title: title.trim(),
      author: author.trim() || undefined,
      publishedDate: publishedDate || undefined,
      content: cleanContent,
      url,
      metadata: {
        description: description.trim() || undefined,
        image: image || undefined,
        siteName: siteName || undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: extractedContent,
    } as APIResponse<ExtractedContent>);

  } catch (error) {
    console.error('Content extraction error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract content',
    } as APIResponse);
  }
}
