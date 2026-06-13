import { useState } from 'react';
import { storage } from '../services/storage';
import { Calendar, Trash2, Plus, User, Award, Bell, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { isGeminiConfigured } from '../services/gemini';

export default function Settings({ settings, onSettingsChange, exams, onExamsChange, onResetComplete }) {
  const [userName, setUserName] = useState(settings.userName);
  const [age, setAge] = useState(settings.age || '');
  const [gender, setGender] = useState(settings.gender || '');
  const [birthDate, setBirthDate] = useState(settings.birthDate || '');
  const [targetExam, setTargetExam] = useState(settings.targetExam);
  const [otherExam, setOtherExam] = useState(settings.otherExam || '');
  const [dailyReminder, setDailyReminder] = useState(settings.dailyReminder);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mindflow_api_key') || '');

  // New Exam Form
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examSubject, setExamSubject] = useState('');

  const [message, setMessage] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!userName.trim() || !age || !gender || !birthDate) {
      alert("Please fill out all required profile details.");
      return;
    }
    const updated = {
      userName: userName.trim(),
      age: Number(age),
      gender,
      birthDate,
      targetExam,
      otherExam: targetExam === 'Other' ? otherExam.trim() : '',
      dailyReminder,
      theme: 'dark',
      isOnboarded: true
    };
    localStorage.setItem('mindflow_api_key', apiKey.trim());
    storage.saveSettings(updated);
    onSettingsChange(updated);
    setMessage('Profile settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!examTitle || !examDate) return;
    
    storage.addExam(examTitle, examDate, examSubject);
    onExamsChange(storage.getExamSchedule());
    
    setExamTitle('');
    setExamDate('');
    setExamSubject('');
  };

  const handleDeleteExam = (id) => {
    storage.deleteExam(id);
    onExamsChange(storage.getExamSchedule());
  };

  const handleResetData = () => {
    const firstConfirm = confirm("Are you sure you want to permanently delete all your data? This will clear your settings, journals, test schedules, and chat history. This action cannot be undone.");
    if (firstConfirm) {
      const finalConfirm = confirm("Confirm final deletion. Are you absolutely sure?");
      if (finalConfirm) {
        storage.resetAll();
        onResetComplete(); // Force parent App.jsx to reload
      }
    }
  };

  const isConfigured = isGeminiConfigured();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
          Settings & Exam Schedule
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Customize your profile and manage mock tests to analyze exam-stress patterns.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-serene-500/10 border border-serene-500/20 text-serene-400 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Settings */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
            <User size={18} className="text-serene-400" />
            <h3 className="font-semibold text-slate-200">Student Profile</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  min="5"
                  max="99"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Birth Date
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Target Exam / Board Exam
              </label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="JEE">JEE (Joint Entrance Exam)</option>
                <option value="NEET">NEET (National Eligibility cum Entrance Test)</option>
                <option value="UPSC">UPSC Civil Services</option>
                <option value="CAT">CAT (Common Admission Test)</option>
                <option value="GATE">GATE (Graduate Aptitude Test in Engineering)</option>
                <option value="CUET">CUET (Common University Entrance Test)</option>
                <option value="Boards">Class 10th / 12th Board Exams</option>
                <option value="Other">Other Competitive Exam</option>
              </select>
            </div>

            {targetExam === 'Other' && (
              <div className="animate-slideDown">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Specify Exam Name
                </label>
                <input
                  type="text"
                  value={otherExam}
                  onChange={(e) => setOtherExam(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  placeholder="e.g. GRE, GMAT, Olympiads"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Daily Wellness Reminder Time
              </label>
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-400" />
                <input
                  type="time"
                  value={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.value)}
                  className="px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Gemini API Key (Optional)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200"
                placeholder="Enter Gemini API key to enable AI Therapist"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Your key is stored locally in your browser and is never sent to any server except directly to Google Gemini.
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-serene-500 hover:bg-serene-600 text-navy-950 font-bold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-serene-500/10"
            >
              Save Profile Settings
            </button>
          </form>
        </div>

        {/* Security & System Info & DANGER ZONE */}
        <div className="flex flex-col gap-6">
          {/* Security details */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
              <Shield size={18} className="text-serene-400" />
              <h3 className="font-semibold text-slate-200">Security & Privacy</h3>
            </div>
            
            <div className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed">
              <p>
                MindFlow uses a **local-first privacy architecture**. All journals, moods, and schedule items are saved exclusively in your browser storage.
              </p>
              <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 flex flex-col gap-2">
                <span className="font-semibold text-slate-200">Gemini 2.5 Flash API Connection:</span>
                {isConfigured ? (
                  <span className="text-serene-400 font-medium flex items-center gap-1.5">
                    ● Connected & Configured.
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1.5">
                    ● Offline simulated AI active.
                  </span>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your API key in the profile settings form to connect to Gemini 2.5 Flash.
                </p>
              </div>
            </div>
            
            <div className="border-t border-navy-800/80 pt-4 mt-2 flex items-center gap-2 text-xs text-slate-400">
              <Award size={14} className="text-indigo-400 shrink-0" />
              <span>AI responses are optimized using Google Gemini 2.5 Flash for rapid cognitive advice.</span>
            </div>
          </div>

          {/* DANGER ZONE (Reset App Data) */}
          <div className="glass-panel rounded-2xl p-6 border border-red-500/20 bg-red-950/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
              <AlertTriangle size={18} className="text-red-400" />
              <h3 className="font-semibold text-slate-200">Danger Zone</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Resetting the app will permanently wipe all local settings, daily mood journal history, scheduled mock exams, and psychologist chat logs from your browser cache.
              </p>
              <button
                onClick={handleResetData}
                className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-100 font-bold py-2.5 rounded-xl text-xs transition-all duration-200 border border-red-500/30 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Reset Profile & App Data
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Exam Scheduler */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
          <Calendar size={18} className="text-serene-400" />
          <h3 className="font-semibold text-slate-200">Mock Tests & Exam Dates Scheduler</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add Exam Form */}
          <form onSubmit={handleAddExam} className="space-y-4 md:col-span-1 border-r border-navy-800 pr-0 md:pr-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Test Event</h4>
            
            <div>
              <input
                type="text"
                placeholder="Test/Exam Name (e.g. Mock Test 4)"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                required
              />
            </div>

            <div>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                required
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Subject/Topics (e.g. Physics - Kinematics)"
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-navy-800 hover:bg-navy-700 text-slate-200 font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-navy-700"
            >
              <Plus size={14} /> Add Event
            </button>
          </form>

          {/* Exam List */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Events</h4>
            
            {exams.length === 0 ? (
              <div className="h-36 border border-dashed border-navy-800 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                No mock tests or exam dates scheduled. Add one to correlate anxiety charts.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                {exams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="flex items-center justify-between p-3.5 bg-navy-900/60 rounded-xl border border-navy-800/80 hover:border-navy-700 transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="font-semibold text-slate-200 text-sm truncate">{exam.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="text-serene-400 font-medium">{exam.date}</span>
                        {exam.subject && (
                          <span className="truncate max-w-[150px] border-l border-navy-800 pl-3">
                            {exam.subject}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete test date"
                      aria-label={`Delete ${exam.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
