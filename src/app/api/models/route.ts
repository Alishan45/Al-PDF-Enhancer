import { NextResponse } from 'next/server';

export async function GET() {
  const availability = {
    gemini: true, // Always available with free API key
    openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_for_testing',
    claude: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_key_for_testing',
  };

  const models = [
    {
      id: 'gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash (Experimental)',
      provider: 'Google',
      status: 'FREE • LATEST',
      statusColor: 'green',
      available: true,
      isDefault: true,
      description: 'Latest experimental Gemini model with enhanced capabilities (free)',
    },
    {
      id: 'gemini-1.5-flash-latest',
      name: 'Gemini 1.5 Flash (Latest)',
      provider: 'Google',
      status: 'FREE • UPDATED',
      statusColor: 'green',
      available: true,
      isDefault: false,
      description: 'Latest Gemini 1.5 Flash with most recent updates (free)',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      provider: 'Google',
      status: 'FREE • STABLE',
      statusColor: 'green',
      available: true,
      isDefault: false,
      description: 'Fast, reliable Gemini model for most use cases (free)',
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
