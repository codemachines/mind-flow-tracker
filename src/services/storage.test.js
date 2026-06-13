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

  it('should handle missing feelings and notes with default values in addMoodLog', () => {
    const log = storage.addMoodLog(5);
    expect(log.feelings).toEqual([]);
    expect(log.notes).toBe('');
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

  it('should handle errors gracefully in localStorage catch blocks', () => {
    const originalSetItem = localStorage.setItem;
    const originalGetItem = localStorage.getItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalGetMoodLogs = storage.getMoodLogs;
    const originalGetExamSchedule = storage.getExamSchedule;
    const originalGetChatHistory = storage.getChatHistory;

    // Force localStorage methods to throw error
    localStorage.setItem = vi.fn().mockImplementation(() => { throw new Error('Mock write error'); });
    localStorage.getItem = vi.fn().mockImplementation(() => { throw new Error('Mock read error'); });
    localStorage.removeItem = vi.fn().mockImplementation(() => { throw new Error('Mock remove error'); });

    // Test catch blocks of read/write operations
    expect(storage.getSettings()).toEqual({
      userName: '',
      age: '',
      birthDate: '',
      gender: '',
      targetExam: 'JEE',
      otherExam: '',
      dailyReminder: '21:00',
      theme: 'dark',
      isOnboarded: false
    });
    expect(storage.saveSettings({})).toBe(false);
    expect(storage.getMoodLogs()).toEqual([]);
    expect(storage.saveMoodLogs([])).toBe(false);
    expect(storage.getExamSchedule()).toEqual([]);
    expect(storage.saveExamSchedule([])).toBe(false);
    expect(storage.deleteExam('1')).toBe(true); // Returns true because it filters successfully even if write fails
    expect(storage.getChatHistory()).toEqual([]);
    expect(storage.saveChatHistory([])).toBe(false);
    expect(storage.clearChatHistory()).toBe(false);
    expect(storage.resetAll()).toBe(false);

    // Force getters to return undefined so add/delete operations throw TypeError internally and trigger their catch blocks
    storage.getMoodLogs = vi.fn().mockReturnValue(undefined);
    storage.getExamSchedule = vi.fn().mockReturnValue(undefined);
    storage.getChatHistory = vi.fn().mockReturnValue(undefined);

    expect(storage.addMoodLog(5, [], 'Notes')).toBeNull();
    expect(storage.addExam('Exam', '2026-06-15', 'Math')).toBeNull();
    expect(storage.deleteExam('1')).toBe(false); // Throws TypeError because it tries to call filter on undefined
    expect(storage.addChatMessage('user', 'msg')).toBeNull();

    // Restore
    localStorage.setItem = originalSetItem;
    localStorage.getItem = originalGetItem;
    localStorage.removeItem = originalRemoveItem;
    storage.getMoodLogs = originalGetMoodLogs;
    storage.getExamSchedule = originalGetExamSchedule;
    storage.getChatHistory = originalGetChatHistory;
  });
});
