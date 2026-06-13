import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Disclaimer from './components/Disclaimer';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import ChatBot from './components/ChatBot';
import Exercises from './components/Exercises';
import Playlist from './components/Playlist';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import { storage } from './services/storage';

// Generate realistic mock history logs for a JEE/NEET student to make dashboard immediately rich and descriptive
const SEED_MOCK_LOGS = () => {
  const journalEntries = [
    {
      notes: "Completed a full syllabus chemistry mock test today. I got a very low score in Organic Chemistry. Feel like all my preparation is going to waste. What if I can't clear JEE?",
      rating: 3,
      feelings: ['Anxious', 'Overwhelmed', 'Sad'],
      analysis: {
        score: 8,
        summary: "Anxiety is highly elevated, triggered by Organic Chemistry mock test scores.",
        stressors: ["Mock test chemistry score", "Organic syllabus retention", "Fear of failing entrance exam"],
        cognitiveDistortions: ["Catastrophizing (extrapolating one test to overall JEE failure)", "All-or-Nothing Thinking"],
        actionPlan: [
          "Do a 5-minute progressive muscle relaxation session before studying.",
          "Identify exactly 3 questions you got wrong and study their explanation steps.",
          "Set a hard boundary to stop studying by 10:30 PM tonight."
        ],
        recoveryAdvice: "A single mock test score is a compass for where to revise, not a prediction of your JEE result. Organic Chemistry is complex, and your frustration is normal. Be gentle with yourself; mock tests are designed to be difficult to expose gaps. You are putting in the work, and that is what matters."
      }
    },
    {
      notes: "Woke up early at 5:00 AM to study Physics kinematics. Felt very clear and focused. Solved 15 complex numericals. Felt good about myself.",
      rating: 8,
      feelings: ['Focused', 'Calm', 'Confident'],
      analysis: {
        score: 2,
        summary: "Mind is calm, balanced, and showing high academic self-efficacy.",
        stressors: ["None identified"],
        cognitiveDistortions: ["None identified"],
        actionPlan: [
          "Keep this morning study routine active.",
          "Maintain a light evening revision without taking on new heavy subjects.",
          "Drink at least 3 liters of water today."
        ],
        recoveryAdvice: "You are in a highly productive, clear state of mind. Consistently resting and waking up with a structured topic block is paying off. Celebrate these small wins—they build your final confidence."
      }
    },
    {
      notes: "Slept only 4 hours last night trying to complete the math integration exercises. Today I can't concentrate on anything in class. I feel extremely lazy, fatigued, and unmotivated.",
      rating: 2,
      feelings: ['Tired/Burned Out', 'Unmotivated'],
      analysis: {
        score: 9,
        summary: "Physical and cognitive burnout due to sleep deprivation.",
        stressors: ["Math syllabus backlog", "Sleep deprivation (4 hours)", "Inability to concentrate"],
        cognitiveDistortions: ["Should statements (believing you 'must' stay up late to be a good student)"],
        actionPlan: [
          "Stop studying immediately and take a 20-minute restorative nap.",
          "Engage in our Box Breathing visualizer for 4 minutes to restore calm.",
          "Commit to a minimum of 7 hours of sleep tonight."
        ],
        recoveryAdvice: "Your brain is exhausted, and your lack of focus is a biological defense mechanism, not laziness. Sacrificing sleep for study is counterproductive because the brain cannot consolidate memories without REM cycles. Please prioritize rest today; your mental health is the absolute foundation of your academic marks."
      }
    },
    {
      notes: "Had a long counseling talk with parents. They said they are supportive no matter what rank I get, but I still feel the silent pressure of their expectations. I need to get into an IIT.",
      rating: 4,
      feelings: ['Anxious', 'Overwhelmed'],
      analysis: {
        score: 7,
        summary: "Elevated anxiety related to external expectations and self-imposed pressure.",
        stressors: ["Silent parental expectations", "Urgency to enter IIT", "Self-imposed perfectionism"],
        cognitiveDistortions: ["Personalization (assuming your parents' happiness depends entirely on your exam rank)"],
        actionPlan: [
          "Write a list of three aspects of your life that you enjoy that are completely unrelated to IIT.",
          "Listen to Kun Faya Kun in our Calming Tunes section to unwind.",
          "Talk honestly with a friend or our AI psychologist about expectation weight."
        ],
        recoveryAdvice: "It is beautiful that your parents expressed their unconditional support—try to take them at their word. The pressure you feel is largely self-imposed because you want to succeed. Remember, your career is a long path, and IIT is only one door. You are valuable regardless of which college name is on your degree."
      }
    },
    {
      notes: "Today was a balanced day. Completed 4 study blocks, did a light revision, and went out for a walk in the evening. Didn't solve mock tests today.",
      rating: 7,
      feelings: ['Calm', 'Focused'],
      analysis: {
        score: 3,
        summary: "Stable emotional state, supported by active breaks and study boundaries.",
        stressors: ["General workload"],
        cognitiveDistortions: ["None identified"],
        actionPlan: [
          "Maintain this pace; interleaving study blocks with active walking resets stress levels.",
          "Read a light book or sleep on time."
        ],
        recoveryAdvice: "This is a wonderful template for a sustainable study routine. Recharging your mind with physical activity and breaks ensures that you don't burn out before the actual exam day. Consistent, moderate effort beats exhaustive bursts every time."
      }
    }
  ];

  // Distribute these 5 logs over the past 12 days to create a realistic time series
  const logsList = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const logDate = new Date(today);
    // Spread them: 11 days ago, 8 days ago, 5 days ago, 2 days ago, and today
    logDate.setDate(today.getDate() - (11 - i * 3));
    
    logsList.push({
      id: `mock-id-${i}`,
      date: logDate.toISOString(),
      rating: journalEntries[i].rating,
      feelings: journalEntries[i].feelings,
      notes: journalEntries[i].notes,
      analysis: journalEntries[i].analysis
    });
  }

  return logsList.reverse();
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [exams, setExams] = useState(() => {
    const activeSettings = storage.getSettings();
    return activeSettings.isOnboarded ? storage.getExamSchedule() : [];
  });
  const [logs, setLogs] = useState(() => {
    const activeSettings = storage.getSettings();
    if (activeSettings.isOnboarded) {
      const storedLogs = storage.getMoodLogs();
      if (storedLogs.length === 0) {
        const seeded = SEED_MOCK_LOGS();
        storage.saveMoodLogs(seeded);
        return seeded;
      }
      return storedLogs;
    }
    return [];
  });



  const handleOnboardingComplete = (newSettings) => {
    setSettings(newSettings);
    // Now trigger seeding and data loading since they are onboarded
    const seeded = SEED_MOCK_LOGS();
    storage.saveMoodLogs(seeded);
    setLogs(seeded);
    setExams(storage.getExamSchedule());
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleExamsChange = (newExams) => {
    setExams(newExams);
  };

  const handleLogsChange = (newLogs) => {
    setLogs(newLogs);
  };

  const handleResetComplete = () => {
    // Clear all react states
    setSettings(storage.getSettings());
    setLogs([]);
    setExams([]);
    setActiveTab('dashboard');
  };

  // If the user has not onboarded, redirect them to the onboarding wizard
  if (!settings.isOnboarded) {
    return (
      <Onboarding 
        onOnboardingComplete={handleOnboardingComplete} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-navy-950 text-slate-100">
      {/* 1. Global Safety Banner */}
      <div className="w-full fixed top-0 left-0 right-0 z-50">
        <Disclaimer />
      </div>

      {/* Main Layout container */}
      <div className="flex-1 flex flex-col md:flex-row pt-12 md:pt-0 pb-16 md:pb-0">
        {/* 2. Navigation Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          settings={settings} 
        />

        {/* 3. Primary Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 mt-4 md:mt-0 pb-20 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                logs={logs} 
                exams={exams} 
                settings={settings} 
                setActiveTab={setActiveTab} 
              />
            )}
            
            {activeTab === 'journal' && (
              <Journal 
                logs={logs} 
                onLogsChange={handleLogsChange} 
                settings={settings} 
              />
            )}

            {activeTab === 'chatbot' && (
              <ChatBot 
                settings={settings} 
              />
            )}

            {activeTab === 'exercises' && (
              <Exercises />
            )}

            {activeTab === 'playlist' && (
              <Playlist 
                logs={logs} 
              />
            )}

            {activeTab === 'settings' && (
              <Settings 
                settings={settings} 
                onSettingsChange={handleSettingsChange} 
                exams={exams} 
                onExamsChange={handleExamsChange} 
                onResetComplete={handleResetComplete}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
