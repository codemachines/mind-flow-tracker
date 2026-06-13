import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService, isGeminiConfigured } from './gemini';

// Mock import.meta.env
vi.stubEnv('VITE_GEMINI_API_KEY', ''); // Clear key for offline testing fallback

describe('gemini.js Fallback Unit Tests', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GEMINI_API_KEY', ''); // Clear key
  });

  it('should verify that Gemini is not configured if key is empty', () => {
    expect(isGeminiConfigured()).toBe(false);
  });

  it('should resolve mock assessment on analyzeJournal when offline', async () => {
    const result = await geminiService.analyzeJournal(4, ['Anxious', 'Overwhelmed'], 'Mock chemistry exam failed today.', 'JEE');
    
    expect(result.score).toBeGreaterThanOrEqual(5); // high anxiety rating
    expect(result.stressors.length).toBeGreaterThan(0);
    expect(result.cognitiveDistortions.length).toBeGreaterThan(0);
    expect(result.actionPlan.length).toBeGreaterThan(0);
    expect(result.recoveryAdvice).toContain('burnout');
  });

  it('should resolve mock chat message on getChatResponse when offline', async () => {
    const history = [
      { sender: 'user', text: 'help me breathe I am panic' }
    ];

    const response = await geminiService.getChatResponse(history, 'JEE');
    expect(response).toContain('breath');
    expect(response).toContain('Box Breathing');
  });
});
