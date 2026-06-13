// Local Storage CRUD utilities for MindFlow

const KEYS = {
  SETTINGS: 'mindflow_settings',
  MOOD_LOGS: 'mindflow_mood_logs',
  EXAM_SCHEDULE: 'mindflow_exam_schedule',
  CHAT_HISTORY: 'mindflow_chat_history',
};

// Default settings if none exist
const DEFAULT_SETTINGS = {
  userName: '',
  age: '',
  birthDate: '',
  gender: '',
  targetExam: 'JEE', // Default to JEE
  otherExam: '',
  dailyReminder: '21:00',
  theme: 'dark',
  isOnboarded: false
};

export const storage = {
  // Reset All Data
  resetAll: () => {
    try {
      localStorage.removeItem(KEYS.SETTINGS);
      localStorage.removeItem(KEYS.MOOD_LOGS);
      localStorage.removeItem(KEYS.EXAM_SCHEDULE);
      localStorage.removeItem(KEYS.CHAT_HISTORY);
      localStorage.removeItem('mindflow_disclaimer_dismissed');
      return true;
    } catch (e) {
      console.error('Error resetting app data', e);
      return false;
    }
  },

  // Settings
  getSettings: () => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error reading settings', e);
      return DEFAULT_SETTINGS;
    }
  },
  
  saveSettings: (settings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Error saving settings', e);
      return false;
    }
  },

  // Mood Logs
  getMoodLogs: () => {
    try {
      const data = localStorage.getItem(KEYS.MOOD_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading mood logs', e);
      return [];
    }
  },

  saveMoodLogs: (logs) => {
    try {
      localStorage.setItem(KEYS.MOOD_LOGS, JSON.stringify(logs));
      return true;
    } catch (e) {
      console.error('Error saving mood logs', e);
      return false;
    }
  },

  addMoodLog: (rating, feelings, notes, analysis = null) => {
    try {
      const logs = storage.getMoodLogs();
      const newLog = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
        date: new Date().toISOString(), // Full timestamp
        rating: Number(rating),
        feelings: feelings || [],
        notes: notes || '',
        analysis: analysis
      };
      logs.unshift(newLog); // Put latest logs first
      storage.saveMoodLogs(logs);
      return newLog;
    } catch (e) {
      console.error('Error adding mood log', e);
      return null;
    }
  },

  // Exam Schedule
  getExamSchedule: () => {
    try {
      const data = localStorage.getItem(KEYS.EXAM_SCHEDULE);
      // Return default exams if empty to make it immediately interesting
      if (!data) {
        const defaults = [
          { id: '1', title: 'Grand Mock Test - Math & Physics', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], subject: 'JEE Prep' },
          { id: '2', title: 'Subject-wise Practice Test', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], subject: 'Chemistry' },
          { id: '3', title: 'National Level Mock Exam', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], subject: 'All Subjects' }
        ];
        localStorage.setItem(KEYS.EXAM_SCHEDULE, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading exam schedule', e);
      return [];
    }
  },

  saveExamSchedule: (schedule) => {
    try {
      localStorage.setItem(KEYS.EXAM_SCHEDULE, JSON.stringify(schedule));
      return true;
    } catch (e) {
      console.error('Error saving exam schedule', e);
      return false;
    }
  },

  addExam: (title, date, subject) => {
    try {
      const schedule = storage.getExamSchedule();
      const newExam = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 9),
        title,
        date,
        subject
      };
      schedule.push(newExam);
      // Sort chronologically
      schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
      storage.saveExamSchedule(schedule);
      return newExam;
    } catch (e) {
      console.error('Error adding exam', e);
      return null;
    }
  },

  deleteExam: (id) => {
    try {
      const schedule = storage.getExamSchedule();
      const updated = schedule.filter(exam => exam.id !== id);
      storage.saveExamSchedule(updated);
      return true;
    } catch (e) {
      console.error('Error deleting exam', e);
      return false;
    }
  },

  // Chat History
  getChatHistory: () => {
    try {
      const data = localStorage.getItem(KEYS.CHAT_HISTORY);
      if (!data) {
        const defaultChat = [
          { sender: 'bot', text: 'Hello! I am your digital psychologist and mindful guide. Preparing for competitive entrance tests can be stressful. How are you feeling today?', timestamp: new Date().toISOString() }
        ];
        localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(defaultChat));
        return defaultChat;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading chat history', e);
      return [];
    }
  },

  saveChatHistory: (history) => {
    try {
      localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(history));
      return true;
    } catch (e) {
      console.error('Error saving chat history', e);
      return false;
    }
  },

  addChatMessage: (sender, text) => {
    try {
      const history = storage.getChatHistory();
      const newMessage = {
        sender,
        text,
        timestamp: new Date().toISOString()
      };
      history.push(newMessage);
      storage.saveChatHistory(history);
      return newMessage;
    } catch (e) {
      console.error('Error adding chat message', e);
      return null;
    }
  },

  clearChatHistory: () => {
    try {
      localStorage.removeItem(KEYS.CHAT_HISTORY);
      return true;
    } catch (e) {
      console.error('Error clearing chat history', e);
      return false;
    }
  }
};
