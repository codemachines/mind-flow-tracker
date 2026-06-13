/* eslint-disable no-undef */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './storage';

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

describe('storage.js Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should retrieve default settings if storage is empty', () => {
    const settings = storage.getSettings();
    expect(settings.userName).toBe('');
    expect(settings.targetExam).toBe('JEE');
    expect(settings.isOnboarded).toBe(false);
  });

  it('should save and retrieve custom settings', () => {
    const custom = {
      userName: 'Aarav',
      age: 18,
      birthDate: '2008-05-12',
      gender: 'Male',
      targetExam: 'NEET',
      otherExam: '',
      dailyReminder: '22:00',
      theme: 'dark',
      isOnboarded: true
    };
    
    storage.saveSettings(custom);
    const retrieved = storage.getSettings();
    expect(retrieved.userName).toBe('Aarav');
    expect(retrieved.age).toBe(18);
    expect(retrieved.gender).toBe('Male');
    expect(retrieved.isOnboarded).toBe(true);
  });

  it('should append and retrieve daily mood logs', () => {
    storage.addMoodLog(8, ['Calm', 'Focused'], 'Studied kinematics today. Clear mind.', { score: 2 });
    const logs = storage.getMoodLogs();
    
    expect(logs.length).toBe(1);
    expect(logs[0].rating).toBe(8);
    expect(logs[0].feelings).toContain('Calm');
    expect(logs[0].notes).toBe('Studied kinematics today. Clear mind.');
    expect(logs[0].analysis.score).toBe(2);
  });

  it('should add and delete mock test exams', () => {
    // Isolate by clearing defaults
    localStorage.setItem('mindflow_exam_schedule', JSON.stringify([]));

    const exam1 = storage.addExam('Mock Test 1', '2026-06-15', 'Physics');
    storage.addExam('Practice Quiz', '2026-06-20', 'Chemistry');
    
    let schedule = storage.getExamSchedule();
    expect(schedule.length).toBe(2);
    expect(schedule[0].title).toBe('Mock Test 1');

    storage.deleteExam(exam1.id);
    schedule = storage.getExamSchedule();
    expect(schedule.length).toBe(1);
    expect(schedule[0].title).toBe('Practice Quiz');
  });

  it('should support chat history messages', () => {
    // Isolate by clearing greeting default
    localStorage.setItem('mindflow_chat_history', JSON.stringify([]));

    storage.addChatMessage('user', 'I feel stressed');
    storage.addChatMessage('bot', 'Let us do box breathing.');
    
    const chat = storage.getChatHistory();
    expect(chat.length).toBe(2);
    expect(chat[0].sender).toBe('user');
    expect(chat[1].sender).toBe('bot');

    storage.clearChatHistory();
    const cleared = storage.getChatHistory();
    expect(cleared.length).toBe(1); // Restores greeting message
    expect(cleared[0].sender).toBe('bot');
  });

  it('should execute a full storage resetAll', () => {
    storage.saveSettings({ userName: 'Alice', isOnboarded: true });
    storage.addMoodLog(5, [], 'Notes');
    storage.addExam('Exam', '2026-06-10', 'Subject');
    
    storage.resetAll();
    
    // Check that custom keys are cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('mindflow_settings');
    expect(localStorage.removeItem).toHaveBeenCalledWith('mindflow_mood_logs');
    expect(localStorage.removeItem).toHaveBeenCalledWith('mindflow_exam_schedule');
    expect(localStorage.removeItem).toHaveBeenCalledWith('mindflow_chat_history');
    expect(localStorage.removeItem).toHaveBeenCalledWith('mindflow_disclaimer_dismissed');
  });
});
