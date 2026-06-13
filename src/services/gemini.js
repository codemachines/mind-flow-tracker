// Google Gemini API integration with local mock therapist fallback
import { GoogleGenerativeAI } from '@google/generative-ai';

// Retrieve the API Key from localStorage first, then import.meta.env
const getApiKey = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const localKey = localStorage.getItem('mindflow_api_key');
      if (localKey && localKey.trim().length > 0) {
        return localKey.trim();
      }
    }
  } catch (e) {
    console.error('Error reading API key from localStorage', e);
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// Check if Gemini is configured
export const isGeminiConfigured = () => {
  const key = getApiKey();
  return typeof key === 'string' && key.trim().length > 0 && !key.startsWith('YOUR_');
};

/**
 * Local Rule-Based Mock Therapist Fallback
 * Analyzes journal entries using basic sentiment analysis to return a formatted mock response
 */
const mockAnalyzeJournal = (rating, feelings, notes, targetExam) => {
  const notesLower = (notes || '').toLowerCase();
  
  // Rule-based stressors identification
  const stressors = [];
  if (notesLower.includes('mock') || notesLower.includes('test') || notesLower.includes('exam')) {
    stressors.push('Mock test performance pressure');
  }
  if (notesLower.includes('math') || notesLower.includes('physics') || notesLower.includes('chemistry') || notesLower.includes('bio') || notesLower.includes('syllabus')) {
    stressors.push('Academic subject load and syllabus coverage');
  }
  if (notesLower.includes('time') || notesLower.includes('schedule') || notesLower.includes('hours') || notesLower.includes('late')) {
    stressors.push('Time management and study routine tension');
  }
  if (notesLower.includes('sleep') || notesLower.includes('tired') || notesLower.includes('exhaust')) {
    stressors.push('Physical burnout and sleep deprivation');
  }
  if (feelings.includes('Overwhelmed') || feelings.includes('Anxious')) {
    stressors.push('Emotional fatigue from long study hours');
  }
  if (stressors.length === 0) {
    stressors.push('General exam preparation anxiety');
  }

  // Rule-based cognitive distortions
  const distortions = [];
  if (notesLower.includes('fail') || notesLower.includes('never') || notesLower.includes('ruin')) {
    distortions.push('Catastrophizing (imagining the worst-case scenario)');
  }
  if (notesLower.includes('always') || notesLower.includes('nothing') || notesLower.includes('every')) {
    distortions.push('Overgeneralization (assuming one setback defines everything)');
  }
  if (notesLower.includes('should') || notesLower.includes('must') || notesLower.includes('ought')) {
    distortions.push('"Should" statements (harsh self-expectations)');
  }
  if (distortions.length === 0) {
    distortions.push('Emotional Reasoning (interpreting stress as proof of inadequacy)');
  }

  // Sentiment-based wellness rating (10 = highest stress)
  let calculatedStress = Math.min(10, Math.max(1, 11 - Number(rating)));
  if (feelings.includes('Overwhelmed')) calculatedStress = Math.min(10, calculatedStress + 1);
  if (feelings.includes('Calm')) calculatedStress = Math.max(1, calculatedStress - 2);

  // Generate actionable plan items
  const actionPlan = [
    "Engage in a 5-minute Box Breathing exercise to reset your nervous system.",
    `Schedule a 20-minute restorative walk outside before resuming study for ${targetExam}.`,
    "Break your current study block into smaller 25-minute Pomodoro segments with active 5-minute stretch breaks.",
    "Write down exactly 3 topics you did well on in your last practice session to counter negative self-bias."
  ];

  // Tailored mock clinical guidance
  let recoveryAdvice = `I hear how hard you are pushing yourself for the ${targetExam} exam. It is entirely natural to feel this pressure when you care so deeply about the outcome. However, your brain requires rest to consolidate information. Remember that a mock test score is a diagnostic tool to help you learn, not a final verdict on your intelligence or your future. Please step away from the books for 15 minutes, hydrate, and take three deep breaths. You are on a journey, and you are doing your best.`;

  if (calculatedStress <= 3) {
    recoveryAdvice = "You are currently in a very healthy, balanced state. Your mind is calm and clear, which is the optimal state for retaining complex concepts. Keep doing what you are doing—remember to sustain this by maintaining consistent sleep cycles and treating mock tests as light practice runs.";
  } else if (calculatedStress >= 8) {
    recoveryAdvice = `Your stress levels are extremely high right now, indicating high risk of burnout. This level of tension inhibits active retrieval and memory formation. Please consider this an urgent signal from your body to rest. Pause studying for the rest of today, listen to a calming Bollywood track, and do the 5-4-3-2-1 grounding technique in our Mindful Exercises panel. You deserve to rest.`;
  }

  return {
    score: calculatedStress,
    summary: `Stress is elevated, heavily influenced by ${stressors[0] || 'exam workload'}. You are holding onto high standards.`,
    stressors,
    cognitiveDistortions: distortions,
    actionPlan,
    recoveryAdvice
  };
};

/**
 * Local Rule-Based Mock Therapist Chatbot
 */
const mockGetChatResponse = (messageHistory) => {
  const lastUserMessage = [...messageHistory].reverse().find(m => m.sender === 'user')?.text || '';
  const input = lastUserMessage.toLowerCase();

  const greetings = ['hello', 'hi', 'hey', 'greetings', 'dr', 'seraphina'];
  const breathingWords = ['breathe', 'breathing', 'panic', 'calm down', 'anxious', 'anxiety', 'scared', 'stressed'];
  const performanceWords = ['mock', 'test', 'fail', 'marks', 'score', 'rank', 'percentile', 'physics', 'chemistry', 'math'];
  const fatigueWords = ['tired', 'sleepy', 'exhausted', 'burnout', 'sleep', 'give up', 'lazy'];

  if (greetings.some(w => input.startsWith(w) && input.length < 15)) {
    return "Hello! I am Dr. Seraphina. I am here as your digital counselor to support you through the mental hurdles of exam preparation. How are you holding up today? Are you feeling the pressure of upcoming schedules?";
  }

  if (breathingWords.some(w => input.includes(w))) {
    return "I hear the urgency in your thoughts. Right now, your fight-or-flight system is active. Let's do a quick breathing exercise. Go to the 'Mindful Exercises' tab and start the Box Breathing timer. Focus on the bubble expanding: Inhale for 4 seconds, Hold for 4, Exhale for 4, and Hold for 4. I will wait here. Shall we do it together?";
  }

  if (performanceWords.some(w => input.includes(w))) {
    return `Mock tests are meant to expose gaps in knowledge, not to define your capability. When you get a low score, it is not a 'failure'—it is crucial data. Instead of focusing on the final number, list three specific concepts you got wrong and study them. Your value is not tied to a single score. How can we break down your next review session to feel less daunting?`;
  }

  if (fatigueWords.some(w => input.includes(w))) {
    return "Mental fatigue is a biological boundary, not a lack of motivation. When you feel this exhausted, studying is no longer effective because your brain's working memory is depleted. I strongly recommend taking a 20-minute power nap or doing a light physical stretch. What time did you sleep last night? Let's look at your sleep schedule.";
  }

  return "I understand. Preparing for competitive exams is a marathon, not a sprint, and these feelings of doubt are part of the process. Tell me more about what is currently occupying your mind. Is it a specific subject, a mock exam, or just overall fatigue?";
};

/**
 * Gemini GenAI Client Implementation
 */
export const geminiService = {
  // Analyze journal entry
  analyzeJournal: async (rating, feelings, notes, targetExam = 'JEE') => {
    if (!isGeminiConfigured()) {
      console.log('Gemini API not configured. Falling back to local mock analyzer.');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockAnalyzeJournal(rating, feelings, notes, targetExam));
        }, 1200); // Simulate API network latency
      });
    }

    try {
      const apiKey = getApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // We use the 2.5 flash model as requested by the user
      const modelName = 'gemini-2.5-flash';
      
      const prompt = `
        You are a world-class clinical psychologist specializing in student exam anxiety (specifically for highly competitive exams like JEE, NEET, UPSC, GATE, etc.).
        Analyze the following student daily journal log:
        - Self-reported Mood Rating: ${rating} / 10 (where 10 is happiest, 1 is most stressed/worst)
        - Selected Feelings: ${feelings.join(', ')}
        - Journal Notes: "${notes}"
        - Target Exam: ${targetExam}

        Provide a psychological assessment strictly formatted as a JSON object with the following fields:
        {
          "score": 1-10 integer representing the student's *burnout/stress score* (where 10 is maximum stress/panic/burnout, 1 is total calm/peace),
          "summary": "a concise, one-sentence summary of their emotional state",
          "stressors": ["list", "of", "core", "stressors", "identified", "in", "notes"],
          "cognitiveDistortions": ["list", "of", "cognitive", "distortions", "identified", "e.g., Catastrophizing, All-or-Nothing Thinking, Should Statements, Labeling", "if none, write 'None identified'"],
          "actionPlan": ["3-4 specific, actionable, physical/mindful steps they should do right now to feel better"],
          "recoveryAdvice": "A highly empathetic, clinical, warm paragraph speaking directly to them. Remind them that exams don't define their worth, and give them a soothing 'cure' or perspective shift based on Cognitive Behavioral Therapy (CBT)."
        }
        Do not output any markdown code blocks, backticks, or text before/after the JSON. Output raw JSON only.
      `;

      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini API error during journal assessment. Falling back to mock.', error);
      return mockAnalyzeJournal(rating, feelings, notes, targetExam);
    }
  },

  // Get conversational therapist chat response
  getChatResponse: async (messageHistory, targetExam = 'JEE') => {
    if (!isGeminiConfigured()) {
      console.log('Gemini API not configured. Falling back to local mock therapist.');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockGetChatResponse(messageHistory, targetExam));
        }, 1000);
      });
    }

    try {
      const apiKey = getApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = 'gemini-2.5-flash';

      const systemInstruction = `
        You are Dr. Seraphina, a world-class student clinical psychologist and academic performance anxiety expert. 
        Your goal is to provide compassionate, empathetic, CBT-grounded counseling to a student preparing for the ${targetExam} competitive entrance test.
        The student is under extreme stress, dealing with heavy study loads, test burnout, fear of failure, and parental expectations.
        
        Rules:
        1. Keep responses supportive, brief, and highly conversational (maximum 3-4 sentences per response).
        2. Never diagnose clinical conditions. Keep it focused on counseling, coping skills, and mindfulness.
        3. If the student shows signs of acute anxiety or panic, guide them directly to do a breathing exercise or grounding.
        4. Be warm, non-judgmental, and validate their feelings.
        5. Incorporate subtle student references (e.g., mock tests, study blocks, physical fatigue, revisions).
      `;

      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction
      });

      // Map local message format to Google Generative AI contents format
      const formattedContents = messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const result = await model.generateContent({
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250
        }
      });

      return result.response.text();
    } catch (error) {
      console.error('Gemini API error during chat. Falling back to mock.', error);
      return mockGetChatResponse(messageHistory);
    }
  }
};
