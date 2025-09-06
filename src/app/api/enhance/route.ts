import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedContent, EnhancedContent, ProcessingOptions, APIResponse, Citation } from '@/types';
import { generateTableOfContents, generateCitationId } from '@/lib/content-utils';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
}) : null;

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
}) : null;

// Gemini setup with the free API key
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAvXWuNwwBtBnnJK1N261oWbYsEpgJp2FA');

// Function to get the appropriate Gemini model
function getGeminiModel(modelName: string) {
  return gemini.getGenerativeModel({ model: modelName });
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
  try {
    const { content, options }: { content: ExtractedContent; options: ProcessingOptions } = await request.json();

    if (!content || !options) {
      return NextResponse.json({
        success: false,
        error: 'Content and processing options are required',
      } as APIResponse);
    }

    let enhancedText: string;
    let citations: Citation[] = [];

    // Generate the appropriate prompt based on the action
    const prompt = generatePrompt(content, options);

    // Process based on selected model
    switch (options.model) {
      case 'openai':
        enhancedText = await processWithOpenAI(prompt, options);
        break;
      case 'claude':
        enhancedText = await processWithClaude(prompt, options);
        break;
      case 'gemini-2.0-flash-exp':
      case 'gemini-1.5-flash-latest':
      case 'gemini-1.5-flash':
        enhancedText = await processWithGemini(prompt, options);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid AI model selected',
        } as APIResponse);
    }

    // Generate citations if requested and action is validate
    if (options.generateCitations && options.action === 'validate') {
      citations = generateValidationCitations(content, enhancedText);
    }

    // Generate table of contents
    const tableOfContents = generateTableOfContents(enhancedText);

    const enhancedContent: EnhancedContent = {
      original: content,
      enhanced: enhancedText,
      action: options.action,
      model: options.model,
      citations: citations.length > 0 ? citations : undefined,
      tableOfContents: tableOfContents.length > 0 ? tableOfContents : undefined,
    };

    return NextResponse.json({
      success: true,
      data: enhancedContent,
    } as APIResponse<EnhancedContent>);

  } catch (error) {
    console.error('AI enhancement error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enhance content',
    } as APIResponse);
  }
}

function generatePrompt(content: ExtractedContent, options: ProcessingOptions): string {
  const baseInfo = `Title: ${content.title}\nAuthor: ${content.author || 'Unknown'}\nContent: ${content.content}`;

  switch (options.action) {
    case 'summarize':
      return `Please provide a comprehensive summary of the following article. Include the main points, key arguments, and conclusions. Structure your response with clear headings and bullet points where appropriate.\n\n${baseInfo}`;
    
    case 'expand':
      return `Please expand on the following article by adding more detailed explanations, examples, and context. Enhance the content while maintaining accuracy and providing valuable insights. Use proper markdown formatting with headings and sections.\n\n${baseInfo}`;
    
    case 'validate':
      return `Please analyze the following article for factual accuracy and provide a detailed validation report. Include:\n1. Fact-checking of key claims\n2. Identification of potential biases or unsupported statements\n3. Suggestions for additional research or verification\n4. Overall credibility assessment\n\nFormat your response with clear sections and use markdown formatting.\n\n${baseInfo}`;
    
    default:
      return `Please analyze and improve the following content:\n\n${baseInfo}`;
  }
}

async function processWithOpenAI(prompt: string, _options: ProcessingOptions): Promise<string> {
  if (!openai || !process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert content analyst and writer. Provide high-quality, well-structured responses using markdown formatting. Be thorough, accurate, and professional.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || 'No response generated';
}

async function processWithClaude(prompt: string, _options: ProcessingOptions): Promise<string> {
  if (!anthropic || !process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4096,
    temperature: 0.3,
    system: `You are an expert content analyst and writer. Provide high-quality, well-structured responses using markdown formatting. Be thorough, accurate, and professional.`,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : 'No response generated';
}

async function processWithGemini(prompt: string, options: ProcessingOptions): Promise<string> {
  try {
    const modelName = options.model;
    const geminiModel = getGeminiModel(modelName);
    
    const result = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `You are an expert content analyst and writer. Provide high-quality, well-structured responses using markdown formatting. Be thorough, accurate, and professional.\n\n${prompt}`
        }]
      }]
    });

    const response = await result.response;
    const text = response.text();
    
    return text || 'No response generated from Gemini';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateValidationCitations(content: ExtractedContent, _enhancedText: string) {
  // Generate basic citations for validation
  const citations = [];

  if (content.url) {
    citations.push({
      id: generateCitationId(),
      title: content.title,
      url: content.url,
      author: content.author,
      publishedDate: content.publishedDate,
      description: 'Original source article',
    });
  }

  // In a real implementation, you would extract mentioned sources from the enhanced text
  // and create proper citations for them

  return citations;
}
