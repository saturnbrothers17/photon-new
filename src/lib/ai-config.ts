// AI Provider Configuration
// Easy switching between Qwen and Gemini AI providers

export interface AIProviderConfig {
  provider: 'qwen' | 'gemini';
  qwenApiKey?: string;
  geminiApiKey?: string;
  endpoint?: string;
  model?: string;
}

export const AI_CONFIG = {
  // Default configuration - can be changed here
  defaultProvider: 'qwen' as const,
  
  // Qwen Configuration
  qwen: {
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
    models: {
      vision: 'qwen-vl-max',
      text: 'qwen-turbo'
    }
  },
  
  // Gemini Configuration  
  gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: {
      vision: 'gemini-1.5-flash',
      text: 'gemini-1.5-flash'
    }
  }
};

// Environment variables for API keys
export const getAIConfig = (): AIProviderConfig => {
  return {
    provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as 'qwen' | 'gemini') || AI_CONFIG.defaultProvider,
    qwenApiKey: process.env.NEXT_PUBLIC_QWEN_API_KEY,
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  };
};

// Helper function to check which providers are available
export const getAvailableProviders = () => {
  const config = getAIConfig();
  return {
    qwen: !!config.qwenApiKey,
    gemini: !!config.geminiApiKey,
    primary: config.provider
  };
};

// Quick switch function
export const switchProvider = (provider: 'qwen' | 'gemini') => {
  // This would typically update environment variables or localStorage
  console.log(`Switching AI provider to: ${provider}`);
  return provider;
};
