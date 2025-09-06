import { NextResponse } from 'next/server';

export async function GET() {
  const availability = {
    gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy_key_for_testing',
    openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_for_testing',
    claude: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_key_for_testing',
  };

  const models = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash (Experimental)',
      provider: 'Google',
      status: availability.gemini ? 'AVAILABLE' : 'API KEY REQUIRED',
      statusColor: availability.gemini ? 'green' : 'orange',
      available: availability.gemini,
      isDefault: true,
      description: availability.gemini 
        ? 'Latest experimental Gemini model with enhanced capabilities' 
        : 'Latest experimental Gemini model (requires API key)',
    },
    {
      id: 'gemini-1.5-flash-latest',
      name: 'Gemini 1.5 Flash (Latest)',
      provider: 'Google',
      status: availability.gemini ? 'AVAILABLE' : 'API KEY REQUIRED',
      statusColor: availability.gemini ? 'green' : 'orange',
      available: availability.gemini,
      isDefault: false,
      description: availability.gemini 
        ? 'Latest Gemini 1.5 Flash with most recent updates' 
        : 'Latest Gemini 1.5 Flash (requires API key)',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'Google',
      status: availability.gemini ? 'AVAILABLE' : 'API KEY REQUIRED',
      statusColor: availability.gemini ? 'green' : 'orange',
      available: availability.gemini,
      isDefault: false,
      description: availability.gemini 
        ? 'Fast, reliable Gemini model for most use cases' 
        : 'Fast, reliable Gemini model (requires API key)',
    },
    {
      id: 'openai',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      status: availability.openai ? 'AVAILABLE' : 'API KEY REQUIRED',
      statusColor: availability.openai ? 'green' : 'orange',
      available: availability.openai,
      isDefault: false,
      description: availability.openai 
        ? 'Premium OpenAI model (API key configured)' 
        : 'Premium OpenAI model (requires API key)',
    },
    {
      id: 'claude',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      status: availability.claude ? 'AVAILABLE' : 'API KEY REQUIRED',
      statusColor: availability.claude ? 'green' : 'orange',
      available: availability.claude,
      isDefault: false,
      description: availability.claude 
        ? 'Premium Anthropic model (API key configured)' 
        : 'Premium Anthropic model (requires API key)',
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      availability,
      models,
    },
  });
}
