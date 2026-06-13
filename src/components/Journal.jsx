import { useState } from 'react';
import { storage } from '../services/storage';
import { geminiService } from '../services/gemini';
import { BookOpen, Smile, Sparkles, RefreshCw, Calendar, Trash2, ShieldAlert, Award, ChevronDown, ChevronUp } from 'lucide-react';

const JOURNAL_PROMPTS = [
  "What is the single biggest concept or problem that stressed you out today?",
  "Describe how your mock test or study block went. What went well, and what went poorly?",
  "What thoughts are keeping you awake or making you doubt your preparation?",
  "If you could step away from the syllabus for a day, what would your body and mind want to do?",
  "How did you handle a mistake or a difficult question today?",
  "What expectations do you feel others (parents, teachers) have of you right now?",
  "Describe a moment today when you felt completely focused and at peace."
];

const EMOTION_TAGS = [
  { label: "Anxious", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { label: "Overwhelmed", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { label: "Tired/Burned Out", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  { label: "Calm", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { label: "Focused", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { label: "Confident", color: "bg-serene-500/10 text-serene-400 border-serene-500/20" },
  { label: "Sad", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  { label: "Unmotivated", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" }
];

export default function Journal({ logs, onLogsChange, settings }) {
  const [rating, setRating] = useState(5); // 1-10 (1 = highly stressed, 10 = calm)
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const [notes, setNotes] = useState('');
  
  // Prompt index
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * JOURNAL_PROMPTS.length));
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const handleToggleFeeling = (feeling) => {
    if (selectedFeelings.includes(feeling)) {
      setSelectedFeelings(selectedFeelings.filter(f => f !== feeling));
    } else {
      setSelectedFeelings([...selectedFeelings, feeling]);
    }
  };

  const handleNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % JOURNAL_PROMPTS.length);
  };

  const handleSubmitJournal = async (e) => {
    e.preventDefault();
    if (!notes.trim() || notes.trim().length < 15) {
      alert("Please write a slightly longer journal entry (minimum 15 characters) so the AI therapist can analyze your thoughts.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Call Gemini Service
      const result = await geminiService.analyzeJournal(rating, selectedFeelings, notes, settings.targetExam);
      
      // Save entry to LocalStorage
      storage.addMoodLog(rating, selectedFeelings, notes, result);
      onLogsChange(storage.getMoodLogs());
      
      setAnalysisResult(result);
      // Reset form fields
      setNotes('');
      setSelectedFeelings([]);
      setRating(5);
    } catch (err) {
      console.error(err);
      alert("Something went wrong during analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = (id, e) => {
    e.stopPropagation(); // Prevent toggling expansion
    if (confirm("Are you sure you want to delete this journal entry?")) {
      const updated = logs.filter(log => log.id !== id);
      storage.saveMoodLogs(updated);
      onLogsChange(updated);
      if (expandedLogId === id) setExpandedLogId(null);
    }
  };

  const toggleLogExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
          Mindful Mood Journal
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Express your academic worries, log your feelings, and let GenAI uncover stress points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Journal Form */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
            <BookOpen size={18} className="text-serene-400" />
            <h3 className="font-semibold text-slate-200">New Journal Log</h3>
          </div>

          <form onSubmit={handleSubmitJournal} className="space-y-6">
            {/* Mood Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span>Current State Rating</span>
                <span className="text-serene-400 text-sm font-bold">{rating} / 10</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Overwhelmed</span>
                <input
                  id="mood-rating"
                  aria-label="Current State Rating"
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-navy-900 rounded-lg appearance-none cursor-pointer accent-serene-500"
                />
                <span className="text-xs text-slate-500">Peaceful</span>
              </div>
            </div>

            {/* Feelings Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                How do you feel today? (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {EMOTION_TAGS.map((tag) => {
                  const isSelected = selectedFeelings.includes(tag.label);
                  return (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleToggleFeeling(tag.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 ${
                        isSelected
                          ? 'bg-serene-500 border-serene-500 text-navy-950 font-bold scale-105'
                          : `${tag.color} hover:bg-navy-800/40`
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt Card */}
            <div className="bg-navy-900/60 border border-navy-800/80 rounded-xl p-4 space-y-1.5 flex items-start gap-3">
              <div className="flex-1">
                <span className="text-[10px] text-serene-400 uppercase tracking-widest font-bold">Suggested Prompt</span>
                <p className="text-slate-200 text-xs md:text-sm leading-relaxed mt-1 font-medium">
                  {JOURNAL_PROMPTS[promptIndex]}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNextPrompt}
                className="p-1.5 hover:bg-navy-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                title="Next prompt"
                aria-label="Load next prompt"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Notebook textarea */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Your Thoughts (Notes)
              </label>
              <textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type your honest thoughts here... Write about syllabus stress, mock tests, feelings, sleep quality, physics/chemistry/math struggles, or whatever is on your mind."
                className="w-full px-4 py-3 rounded-xl glass-input text-xs md:text-sm leading-relaxed"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-serene-500 hover:bg-serene-600 disabled:bg-slate-700 disabled:text-slate-400 text-navy-950 font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-serene-500/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Dr. Seraphina is analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze with GenAI
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Analysis Result / Coping bubble */}
        <div className="lg:col-span-2 flex flex-col justify-start">
          {analysisResult ? (
            <div className="glass-panel border border-serene-500/20 rounded-2xl p-6 space-y-5 animate-slideUp">
              <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
                <Sparkles size={18} className="text-serene-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">AI Stress Report</h3>
                  <span className="text-[10px] text-slate-400">Analysis completed successfully</span>
                </div>
              </div>

              {/* Stress rating gauge */}
              <div className="flex items-center justify-between p-3.5 bg-navy-900/40 rounded-xl border border-navy-800/80">
                <span className="text-xs text-slate-400">Stress Load Rating:</span>
                <span className={`text-md font-bold px-3 py-1 rounded-lg ${
                  analysisResult.score >= 8 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  analysisResult.score >= 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {analysisResult.score} / 10
                </span>
              </div>

              {/* Identified Stressors */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Stressors Detected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.stressors.map((st, i) => (
                    <span key={`stressor-${st}-${i}`} className="text-xs bg-navy-900 border border-navy-800 text-slate-300 px-2.5 py-1 rounded-lg">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cognitive Distortions */}
              {analysisResult.cognitiveDistortions && analysisResult.cognitiveDistortions.length > 0 && !analysisResult.cognitiveDistortions[0].startsWith('None') && (
                <div className="space-y-1.5 p-3 bg-red-950/20 border border-red-500/10 rounded-xl">
                  <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <ShieldAlert size={12} /> Mind Trap (Distortion):
                  </span>
                  <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                    {analysisResult.cognitiveDistortions.map((dis, i) => (
                      <li key={`distortion-${dis}-${i}`}>{dis}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Therapist Advice */}
              <div className="space-y-1.5 relative bg-indigo-950/20 border border-indigo-500/10 rounded-xl p-4">
                <span className="text-[10px] text-serene-400 uppercase tracking-widest font-bold flex items-center gap-1">
                  <Award size={12} /> Seraphina's Guidance
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic mt-1.5">
                  "{analysisResult.recoveryAdvice}"
                </p>
              </div>

              {/* Immediate steps */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Suggested Action Steps:</span>
                <div className="space-y-1.5">
                  {analysisResult.actionPlan.map((act, i) => (
                    <div key={`act-${act}-${i}`} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                      <input 
                        type="checkbox" 
                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-navy-900 text-serene-500 focus:ring-serene-500/20 cursor-pointer" 
                        aria-label={act}
                      />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel border-dashed border-2 border-navy-800 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center space-y-3">
              <Smile size={32} className="text-slate-500" />
              <div className="text-xs md:text-sm text-slate-400 max-w-xs leading-relaxed">
                Log your notes and click **Analyze** to generate clinical stress indexes, identify cognitive distortions, and load therapeutic tips.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Journal History */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
          <Calendar size={18} className="text-serene-400" />
          <h3 className="font-semibold text-slate-200">Journal History ({logs.length} entries)</h3>
        </div>

        {logs.length === 0 ? (
          <div className="h-28 flex items-center justify-center text-slate-500 text-xs italic">
            No past logs. Your dashboard and history will fill up once you create your first entry.
          </div>
        ) : (
          <div className="space-y-3.5">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const dateStr = new Date(log.date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              
              const calculatedStress = log.analysis ? log.analysis.score : Math.min(10, Math.max(1, 11 - log.rating));

              return (
                <div
                  key={log.id}
                  onClick={() => toggleLogExpand(log.id)}
                  className="bg-navy-900/40 rounded-2xl border border-navy-800 hover:border-navy-700/80 transition-all duration-200 p-4 cursor-pointer space-y-3.5 select-none"
                >
                  {/* Summary row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-slate-500 font-bold block md:inline md:mr-3">{dateStr}</span>
                      <p className="text-slate-300 font-medium text-xs md:text-sm truncate mt-0.5 md:mt-0 md:inline">
                        {log.notes.substring(0, 75)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        calculatedStress >= 8 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        calculatedStress >= 5 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        Stress: {calculatedStress}
                      </span>
                      
                      <button
                        onClick={(e) => handleDeleteLog(log.id, e)}
                        className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Delete journal entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>

                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-navy-950/80 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn cursor-default" onClick={e => e.stopPropagation()}>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Your Entry:</span>
                          <p className="text-slate-200 text-xs md:text-sm leading-relaxed mt-1 whitespace-pre-wrap">
                            {log.notes}
                          </p>
                        </div>
                        
                        {log.feelings && log.feelings.length > 0 && (
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Feelings:</span>
                            <div className="flex flex-wrap gap-1">
                              {log.feelings.map((f, i) => (
                                <span key={`feeling-${f}-${i}`} className="text-[10px] bg-navy-950 border border-navy-800 text-slate-300 px-2 py-0.5 rounded-md">
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {log.analysis && (
                        <div className="bg-navy-950/40 border border-navy-800 rounded-xl p-4 space-y-4 text-xs">
                          {/* Summary text */}
                          <div>
                            <span className="text-[9px] text-serene-400 uppercase tracking-widest font-bold">Cognitive Assessment:</span>
                            <p className="text-slate-300 font-semibold mt-0.5">{log.analysis.summary}</p>
                          </div>

                          {/* Distortions */}
                          {log.analysis.cognitiveDistortions && log.analysis.cognitiveDistortions.length > 0 && !log.analysis.cognitiveDistortions[0].startsWith('None') && (
                            <div className="p-2.5 bg-red-950/20 border border-red-500/10 rounded-lg text-slate-300">
                              <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block mb-0.5">Mind distortion:</span>
                              <ul className="list-disc pl-3.5 space-y-0.5 text-[11px]">
                                {log.analysis.cognitiveDistortions.map((dis, idx) => (
                                  <li key={`hist-dist-${dis}-${idx}`}>{dis}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Advice */}
                          <div className="border-l-2 border-serene-500 pl-3">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Clinical Cure:</span>
                            <p className="text-slate-300 italic mt-0.5 leading-relaxed">"{log.analysis.recoveryAdvice}"</p>
                          </div>

                          {/* Action Items */}
                          {log.analysis.actionPlan && (
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Coping Steps:</span>
                              <ul className="list-disc pl-3.5 space-y-1 text-slate-300 text-[11px]">
                                {log.analysis.actionPlan.map((act, idx) => (
                                  <li key={`hist-act-${act}-${idx}`}>{act}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
