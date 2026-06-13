/* eslint-disable no-undef */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService, isGeminiConfigured } from './gemini';

// Mock import.meta.env
vi.stubEnv('VITE_GEMINI_API_KEY', ''); // Clear key for offline testing fallback

// Mock browser localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock function starting with 'mock' so Vitest allows reference inside vi.mock()
const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => {
  class MockGoogleGenerativeAI {
    constructor(apiKey) {
      this.apiKey = apiKey;
    }
    getGenerativeModel() {
      return {
        generateContent: mockGenerateContent
      };
    }
  }
  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI
  };
});

describe('gemini.js Unit Tests', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GEMINI_API_KEY', ''); // Clear key
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should verify that Gemini is not configured if key is empty', () => {
    expect(isGeminiConfigured()).toBe(false);
  });

  it('should verify that Gemini is configured if key is in localStorage', () => {
    localStorage.setItem('mindflow_api_key', 'LOCAL_KEY');
    expect(isGeminiConfigured()).toBe(true);
  });

  it('should handle errors when reading from localStorage fails', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn().mockImplementation(() => { throw new Error('Local read fail'); });
    
    expect(isGeminiConfigured()).toBe(false);
    
    localStorage.getItem = originalGetItem;
  });

  it('should evaluate keywords correctly in mock assessment fallback', async () => {
    const result = await geminiService.analyzeJournal(6, ['Anxious'], 'I should manage my time better because I always feel tired.', 'JEE');
    
    expect(result.stressors).toContain('Time management and study routine tension');
    expect(result.stressors).toContain('Physical burnout and sleep deprivation');
    expect(result.cognitiveDistortions).toContain('Overgeneralization (assuming one setback defines everything)');
    expect(result.cognitiveDistortions).toContain('"Should" statements (harsh self-expectations)');
  });

  it('should resolve mock assessment on analyzeJournal when offline (high stress)', async () => {
    const result = await geminiService.analyzeJournal(4, ['Anxious', 'Overwhelmed'], 'Mock chemistry exam failed today.', 'JEE');
    
    expect(result.score).toBeGreaterThanOrEqual(5); // high anxiety rating
    expect(result.stressors.length).toBeGreaterThan(0);
    expect(result.cognitiveDistortions.length).toBeGreaterThan(0);
    expect(result.actionPlan.length).toBeGreaterThan(0);
    expect(result.recoveryAdvice).toContain('burnout');
  });

  it('should produce low stress rating for positive notes (low stress)', async () => {
    const result = await geminiService.analyzeJournal(9, ['Calm'], 'I feel happy and relaxed', 'NEET');
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.recoveryAdvice).toContain('healthy');
  });

  it('should resolve mock chat message on getChatResponse when offline (breathing keywords)', async () => {
    const history = [
      { sender: 'user', text: 'help me breathe I am panic' }
    ];

    const response = await geminiService.getChatResponse(history, 'JEE');
    expect(response).toContain('breath');
    expect(response).toContain('Box Breathing');
  });

  it('should trigger greetings in mock therapist fallback', async () => {
    const response = await geminiService.getChatResponse([{ sender: 'user', text: 'hello' }]);
    expect(response).toContain('Dr. Seraphina');
  });

  it('should trigger performance support in mock therapist fallback', async () => {
    const response = await geminiService.getChatResponse([{ sender: 'user', text: 'failed physics mock test' }]);
    expect(response).toContain('Mock tests');
  });

  it('should trigger fatigue advice in mock therapist fallback', async () => {
    const response = await geminiService.getChatResponse([{ sender: 'user', text: 'I am so tired' }]);
    expect(response).toContain('fatigue');
  });

  it('should trigger default fallback in mock therapist', async () => {
    const response = await geminiService.getChatResponse([{ sender: 'user', text: 'unrelated message text' }]);
    expect(response).toContain('marathon');
  });

  it('should call Gemini API when configured and handle success for journal analysis', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'MOCK_KEY');
    
    // Simulate successful JSON return
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({
          score: 4,
          summary: 'Good job',
          stressors: ['None'],
          cognitiveDistortions: ['None'],
          actionPlan: ['Keep studying'],
          recoveryAdvice: 'Keep it up!'
        })
      }
    });

    const result = await geminiService.analyzeJournal(7, ['Calm'], 'Nice day');
    expect(result.score).toBe(4);
    expect(result.summary).toBe('Good job');
  });

  it('should call Gemini API when configured and handle success for chat response', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'MOCK_KEY');
    
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'Keep moving forward.'
      }
    });

    const response = await geminiService.getChatResponse([{ sender: 'user', text: 'Hi' }], 'JEE');
    expect(response).toBe('Keep moving forward.');
  });

  it('should fall back to mock analysis if Gemini API throws error', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'MOCK_KEY');
    
    mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));
    
    const result = await geminiService.analyzeJournal(4, ['Anxious'], 'stressed');
    expect(result.stressors.length).toBeGreaterThan(0);
  });

  it('should fall back to mock chat if Gemini API throws error during chat', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'MOCK_KEY');
    
    mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));
    
    const response = await geminiService.getChatResponse([{ sender: 'user', text: 'panic' }], 'JEE');
    expect(response).toContain('breath');
  });
});
