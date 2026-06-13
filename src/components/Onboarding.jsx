import { useState } from 'react';
import { storage } from '../services/storage';
import { BrainCircuit, ArrowRight, ArrowLeft, Shield, CheckCircle, User, Calendar, Bell } from 'lucide-react';

export default function Onboarding({ onOnboardingComplete }) {
  const [step, setStep] = useState(1); // 1, 2, 3

  // Form State
  const [userName, setUserName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [targetExam, setTargetExam] = useState('JEE');
  const [otherExam, setOtherExam] = useState('');
  const [dailyReminder, setDailyReminder] = useState('21:00');

  const handleNextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!userName.trim()) {
        alert("Please enter your name.");
        return;
      }
      if (!age || age < 5 || age > 99) {
        alert("Please enter a valid age.");
        return;
      }
      if (!gender) {
        alert("Please select your gender.");
        return;
      }
      if (!birthDate) {
        alert("Please enter your birth date.");
        return;
      }
    }
    
    if (step === 2) {
      if (targetExam === 'Other' && !otherExam.trim()) {
        alert("Please specify the exam name.");
        return;
      }
    }

    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    const settingsData = {
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
    storage.saveSettings(settingsData);
    onOnboardingComplete(settingsData);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Calming abstract backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-serene-500/5 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-lg glass-panel rounded-3xl border border-navy-800 p-6 md:p-8 space-y-6 shadow-2xl relative z-10 animate-scaleUp">
        
        {/* Progress header */}
        <div className="flex items-center justify-between pb-4 border-b border-navy-900">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-serene-400" size={22} />
            <span className="font-bold text-sm text-slate-200">MindFlow Setup</span>
          </div>
          
          {/* Step indicator bubbles */}
          <div className="flex gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  step === num
                    ? 'bg-serene-500 text-navy-950 scale-110 shadow shadow-serene-500/20'
                    : step > num
                    ? 'bg-serene-500/20 text-serene-400 border border-serene-500/30'
                    : 'bg-navy-900 text-slate-500 border border-navy-800'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                <User size={18} className="text-serene-400" /> Let's personalize your sanctuary
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                To tailor Dr. Seraphina's advice, we need a few core identity details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="onboarding-name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  What should we call you? (Name)
                </label>
                <input
                  id="onboarding-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="onboarding-age" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Age
                  </label>
                  <input
                    id="onboarding-age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm"
                    placeholder="e.g. 18"
                    min="5"
                    max="99"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="onboarding-gender" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Gender
                  </label>
                  <select
                    id="onboarding-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm"
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
                <label htmlFor="onboarding-birthdate" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Birth Date
                </label>
                <input
                  id="onboarding-birthdate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm text-slate-200"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Academic Focus */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                <Calendar size={18} className="text-serene-400" /> Academic Preparation Focus
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Select your targeted milestones. This helps overlay upcoming mock tests on your mood charts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="onboarding-target-exam" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Exam
                </label>
                <select
                  id="onboarding-target-exam"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm"
                >
                  <option value="JEE">JEE (Joint Entrance Exam)</option>
                  <option value="NEET">NEET (Medical Entrance)</option>
                  <option value="UPSC">UPSC Civil Services</option>
                  <option value="CAT">CAT (Management Entrance)</option>
                  <option value="GATE">GATE (Engineering Graduate)</option>
                  <option value="CUET">CUET (University Admissions)</option>
                  <option value="Boards">Class 10th / 12th Board Exams</option>
                  <option value="Other">Other Competitive Exam</option>
                </select>
              </div>

              {targetExam === 'Other' && (
                <div className="animate-slideDown">
                  <label htmlFor="onboarding-other-exam" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Specify Exam Name
                  </label>
                  <input
                    id="onboarding-other-exam"
                    type="text"
                    value={otherExam}
                    onChange={(e) => setOtherExam(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm"
                    placeholder="e.g. SAT, GRE, GMAT"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Check-in Habit & Privacy */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                <Bell size={18} className="text-serene-400" /> Wellness Habit & Privacy Check
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                MindFlow operates on strict **client-side local data storage** principles.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="onboarding-reminder" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Daily Check-in Reminder Time
                </label>
                <input
                  id="onboarding-reminder"
                  type="time"
                  value={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm text-slate-200"
                />
              </div>

              {/* Privacy statement */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/10 flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed">
                <Shield className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-slate-200 block mb-0.5">100% Privacy Ensured</strong>
                  All names, ages, journals, and chat logs are stored strictly inside your browser cache. No remote databases are maintained.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-navy-900">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-navy-800 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div></div> // empty spacer
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="bg-serene-500 hover:bg-serene-600 text-navy-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-md shadow-serene-500/15"
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="bg-serene-500 hover:bg-serene-600 text-navy-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-serene-500/25 animate-pulse"
            >
              <CheckCircle size={15} /> Open Sanctuary
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
