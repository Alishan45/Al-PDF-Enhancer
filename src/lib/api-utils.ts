export function checkApiAvailability() {
  return {
    openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_for_testing',
    claude: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_key_for_testing',
    gemini: true, // Always available with free tier
  };
}

export function getModelDisplayInfo(model: string) {
  const availability = checkApiAvailability();
  
  switch (model) {
    case 'gemini':
      return {
        name: 'Gemini Pro',
        status: 'FREE',
        statusColor: 'green',
        available: true,
        description: 'Free Google AI model (included by default)',
      };
    case 'openai':
      return {
        name: 'GPT-4 Turbo',
        status: availability.openai ? 'AVAILABLE' : 'API KEY REQUIRED',
        statusColor: availability.openai ? 'green' : 'orange',
        available: availability.openai,
        description: availability.openai 
          ? 'Premium OpenAI model (API key configured)' 
          : 'Premium OpenAI model (requires API key)',
      };
    case 'claude':
      return {
        name: 'Claude 3 Sonnet',
        status: availability.claude ? 'AVAILABLE' : 'API KEY REQUIRED',
        statusColor: availability.claude ? 'green' : 'orange',
        available: availability.claude,
        description: availability.claude 
          ? 'Premium Anthropic model (API key configured)' 
          : 'Premium Anthropic model (requires API key)',
      };
    default:
      return {
        name: 'Unknown Model',
        status: 'UNAVAILABLE',
        statusColor: 'red',
        available: false,
        description: 'Unknown model',
      };
  }
}
