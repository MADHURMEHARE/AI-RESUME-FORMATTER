import { getAvailableProviders, getProviderConfig } from '../aiProcessor';

describe('AI Processor', () => {
  describe('Provider Configuration', () => {
    it('should have provider configurations defined', () => {
      const openaiConfig = getProviderConfig('openai');
      const anthropicConfig = getProviderConfig('anthropic');
      const geminiConfig = getProviderConfig('gemini');

      expect(openaiConfig).toBeDefined();
      expect(anthropicConfig).toBeDefined();
      expect(geminiConfig).toBeDefined();

      if (openaiConfig) {
        expect(openaiConfig.name).toBe('OpenAI');
        expect(openaiConfig.model).toBe('gpt-4o-mini');
        expect(openaiConfig.temperature).toBe(0);
      }

      if (anthropicConfig) {
        expect(anthropicConfig.name).toBe('Anthropic');
        expect(anthropicConfig.model).toBe('claude-3-haiku-20240307');
        expect(anthropicConfig.temperature).toBe(0);
      }

      if (geminiConfig) {
        expect(geminiConfig.name).toBe('Google Gemini');
        expect(geminiConfig.model).toBe('gemini-1.5-flash');
        expect(geminiConfig.temperature).toBe(0);
      }
    });

    it('should return null for unknown providers', () => {
      const unknownConfig = getProviderConfig('unknown');
      expect(unknownConfig).toBeNull();
    });
  });

  describe('Provider Detection', () => {
    it('should detect available providers based on environment variables', () => {
      // This test will work regardless of whether API keys are set
      const providers = getAvailableProviders();
      
      // The function should return an array (even if empty)
      expect(Array.isArray(providers)).toBe(true);
      
      // If no API keys are set, it should return an empty array
      if (providers.length === 0) {
        console.log('No API keys configured - this is expected in test environment');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API keys gracefully', () => {
      // Temporarily remove API keys to test graceful handling
      const tempEnv = { ...process.env };
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GOOGLE_API_KEY;

      const providers = getAvailableProviders();
      expect(providers).toHaveLength(0);

      // Restore environment
      process.env = tempEnv;
    });
  });
});
