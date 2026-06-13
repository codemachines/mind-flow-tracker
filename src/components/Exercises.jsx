import { useState, useEffect } from 'react';
import { Wind, ShieldAlert, Sparkles, Tv, HelpCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

const YOUTUBE_RESOURCES = [
  {
    title: "10-Min Meditation for Exam Anxiety & Stress",
    channel: "Headspace / Calm Vibes",
    embedId: "tEmt1Znux58",
    description: "A gentle guided mindfulness meditation to settle racing thoughts and center your focus."
  },
  {
    title: "Box Breathing Technique - 4-4-4-4 Visualizer",
    channel: "Mindful Breathing",
    embedId: "FJJazKtH_9I",
    description: "Follow the visual shape to calibrate your respiration, reducing cortisol and somatic tension."
  },
  {
    title: "10-Minute Study Break Yoga & Neck Stretch",
    channel: "Yoga With Adriene",
    embedId: "7KGzTOL1_uY",
    description: "Release physical fatigue in your neck, back, and shoulders caused by long hours of study."
  },
  {
    title: "Progressive Muscle Relaxation (PMR) Guide",
    channel: "Wellness Institute",
    embedId: "1nZEdqcWqys",
    description: "Sequentially tense and release muscle groups to trigger your body's deep relaxation response."
  }
];

export default function Exercises() {
  const [activeSubTab, setActiveSubTab] = useState('breathing'); // breathing, grounding, dissolver, videos

  // --- Box Breathing States ---
  const [seconds, setSeconds] = useState(0); // 0 to 15
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  const phases = ['Inhale', 'Hold In', 'Exhale', 'Hold Out'];
  const phaseIndex = Math.floor(seconds / 4);
  const breathPhase = phases[phaseIndex];
  const breathTimer = 4 - (seconds % 4);

  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setSeconds((prev) => (prev + 1) % 16);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const handleToggleBreathing = () => {
    setIsBreathingActive(!isBreathingActive);
  };

  const handleResetBreathing = () => {
    setIsBreathingActive(false);
    setSeconds(0);
  };

  // --- Thought Dissolver States ---
  const [thoughtText, setThoughtText] = useState('');
  const [dissolvingThoughts, setDissolvingThoughts] = useState([]); // array of { id, text, active }

  const handleReleaseThought = (e) => {
    e.preventDefault();
    if (!thoughtText.trim()) return;

    const newThought = {
      id: Date.now().toString(),
      text: thoughtText,
      active: true
    };

    setDissolvingThoughts([...dissolvingThoughts, newThought]);
    setThoughtText('');

    // Remove thought from state after animation completes (4s)
    setTimeout(() => {
      setDissolvingThoughts((prev) => prev.map(t => t.id === newThought.id ? { ...t, active: false } : t));
    }, 4000);
  };

  // --- Grounding States ---
  const [groundingStep, setGroundingStep] = useState(0); // 0 to 5
  const groundingPrompts = [
    { count: 5, prompt: "Identify 5 things you can SEE around you right now.", placeholder: "1. Laptop, 2. Book, 3. Light..." },
    { count: 4, prompt: "Acknowledge 4 things you can physically TOUCH (feel).", placeholder: "1. Chair supporting me, 2. Pen in hand..." },
    { count: 3, prompt: "Identify 3 things you can HEAR in your environment.", placeholder: "1. Fan humming, 2. Traffic outside..." },
    { count: 2, prompt: "Acknowledge 2 things you can SMELL.", placeholder: "1. Fresh pages, 2. Coffee..." },
    { count: 1, prompt: "Acknowledge 1 thing you can TASTE.", placeholder: "1. Toothpaste, 2. Sips of water..." }
  ];
  const [groundingInputs, setGroundingInputs] = useState(Array(5).fill(''));

  const handleNextGrounding = () => {
    if (groundingStep < 5) {
      setGroundingStep(groundingStep + 1);
    }
  };

  const handleResetGrounding = () => {
    setGroundingStep(0);
    setGroundingInputs(Array(5).fill(''));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
          Mindful Stress-Relief Exercises
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Interactive widgets and guided YouTube videos to reset your nervous system during study blocks.
        </p>
      </div>

      {/* Sub tabs */}
      <div className="flex bg-navy-900 border border-navy-800 rounded-2xl p-1 w-full md:w-max">
        <button
          onClick={() => setActiveSubTab('breathing')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'breathing' ? 'bg-serene-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wind size={16} /> Box Breathing
        </button>
        <button
          onClick={() => setActiveSubTab('grounding')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'grounding' ? 'bg-serene-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert size={16} /> 5-4-3-2-1 Grounding
        </button>
        <button
          onClick={() => setActiveSubTab('dissolver')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'dissolver' ? 'bg-serene-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={16} /> Thought Dissolver
        </button>
        <button
          onClick={() => setActiveSubTab('videos')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'videos' ? 'bg-serene-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv size={16} /> Videos
        </button>
      </div>

      {/* Exercise Content Panels */}
      
      {/* 1. Box Breathing */}
      {activeSubTab === 'breathing' && (
        <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 min-h-[400px]">
          {/* Animated Circle side */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Outer boundary circle */}
              <div className="absolute inset-0 rounded-full border-2 border-navy-800"></div>
              
              {/* Pulsing Breathing Circle */}
              <div 
                className={`absolute rounded-full transition-all duration-1000 ease-in-out flex flex-col items-center justify-center shadow-2xl z-20 ${
                  breathPhase === 'Inhale' ? 'w-52 h-52 bg-serene-500/20 border-2 border-serene-400 shadow-serene-500/10' :
                  breathPhase === 'Hold In' ? 'w-52 h-52 bg-indigo-500/20 border-2 border-indigo-400 shadow-indigo-500/10' :
                  breathPhase === 'Exhale' ? 'w-36 h-36 bg-navy-800 border-2 border-navy-700' :
                  'w-36 h-36 bg-navy-900 border-2 border-navy-800' // Hold Out
                }`}
              >
                <span className={`text-lg font-bold tracking-wide ${
                  breathPhase === 'Inhale' ? 'text-serene-400' :
                  breathPhase === 'Hold In' ? 'text-indigo-300' : 'text-slate-300'
                }`}>
                  {breathPhase}
                </span>
                <span className="text-3xl font-black mt-1 text-slate-100">{breathTimer}s</span>
              </div>
            </div>
          </div>

          {/* Guide Instruction side */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <span className="text-[10px] text-serene-400 uppercase tracking-widest font-bold">Parasympathetic Reset</span>
              <h3 className="text-xl font-bold text-slate-200">Box Breathing (Sama Vritti)</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Used by elite athletes and military personnel, Box Breathing regulates autonomic arousal. It calms anxiety, stabilizes heart rates, and re-oxygenates brain tissues for study focus.
              </p>
            </div>

            {/* Steps explanations */}
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                breathPhase === 'Inhale' 
                  ? 'bg-serene-500/10 border-serene-500 text-serene-400 font-bold scale-102 shadow-lg shadow-serene-500/5' 
                  : 'bg-navy-900/40 border-navy-800/80 text-slate-400'
              }`}>
                1. Inhale (4s)
              </div>
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                breathPhase === 'Hold In' 
                  ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300 font-bold scale-102 shadow-lg shadow-indigo-500/5' 
                  : 'bg-navy-900/40 border-navy-800/80 text-slate-400'
              }`}>
                2. Hold Breath (4s)
              </div>
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                breathPhase === 'Exhale' 
                  ? 'bg-serene-500/10 border-serene-500 text-serene-400 font-bold scale-102 shadow-lg shadow-serene-500/5' 
                  : 'bg-navy-900/40 border-navy-800/80 text-slate-400'
              }`}>
                3. Exhale (4s)
              </div>
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                breathPhase === 'Hold Out' 
                  ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300 font-bold scale-102 shadow-lg shadow-indigo-500/5' 
                  : 'bg-navy-900/40 border-navy-800/80 text-slate-400'
              }`}>
                4. Hold Empty (4s)
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center md:justify-start gap-3.5 pt-2">
              <button
                onClick={handleToggleBreathing}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg transition-colors ${
                  isBreathingActive 
                    ? 'bg-amber-500 hover:bg-amber-600 text-navy-950 shadow-amber-500/10'
                    : 'bg-serene-500 hover:bg-serene-600 text-navy-950 shadow-serene-500/10'
                }`}
              >
                {isBreathingActive ? <Pause size={16} /> : <Play size={16} />}
                {isBreathingActive ? 'Pause Session' : 'Start Session'}
              </button>
              
              <button
                onClick={handleResetBreathing}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 border border-navy-800 hover:bg-navy-900 transition-colors"
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 5-4-3-2-1 Grounding */}
      {activeSubTab === 'grounding' && (
        <div className="glass-panel rounded-2xl p-6 md:p-8 min-h-[400px] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-navy-800 pb-3">
              <HelpCircle size={18} className="text-serene-400" />
              <h3 className="font-semibold text-slate-200">5-4-3-2-1 Grounding Technique</h3>
            </div>
            
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              When student anxiety causes sensory overload or a panic attack, grounding redirects cognitive awareness to your physical environment, short-circuiting recursive worries.
            </p>

            {groundingStep < 5 ? (
              <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-5 md:p-6 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-serene-500/10 text-serene-400 border border-serene-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Step {groundingStep + 1} of 5
                  </span>
                  <span className="text-xs text-slate-400">{5 - groundingStep} items requested</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm md:text-md font-bold text-slate-100">{groundingPrompts[groundingStep].prompt}</h4>
                  <p className="text-[11px] text-slate-500">Look around and type your observations or say them out loud.</p>
                </div>

                <textarea
                  value={groundingInputs[groundingStep] || ''}
                  onChange={(e) => {
                    const updated = [...groundingInputs];
                    updated[groundingStep] = e.target.value;
                    setGroundingInputs(updated);
                  }}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  rows={2}
                  placeholder={groundingPrompts[groundingStep].placeholder}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-950/20 to-serene-950/20 border border-serene-500/15 rounded-xl p-6 text-center space-y-4 animate-scaleUp">
                <Sparkles size={32} className="text-serene-400 mx-auto animate-pulse" />
                <div className="max-w-md mx-auto">
                  <h4 className="font-bold text-slate-200 text-sm md:text-md">Sensory Grounding Complete</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                    Your focus has successfully shifted from internal abstract anxieties to the tangible, physical reality. Take one deep breath. Your body is safe, and your mind is back in the present moment.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-900/80">
            {groundingStep > 0 && (
              <button
                onClick={handleResetGrounding}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 border border-navy-800 transition-colors"
              >
                Reset
              </button>
            )}
            
            {groundingStep < 5 && (
              <button
                onClick={handleNextGrounding}
                className="bg-serene-500 hover:bg-serene-600 text-navy-950 font-bold px-5 py-2 rounded-xl text-xs transition-colors"
              >
                {groundingStep === 4 ? 'Complete Guide' : 'Next Step'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Thought Dissolver */}
      {activeSubTab === 'dissolver' && (
        <div className="glass-panel rounded-2xl p-6 md:p-8 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Form and info */}
          <div className="space-y-4 z-10">
            <div className="flex items-center gap-2.5 border-b border-navy-800 pb-3">
              <Sparkles size={18} className="text-serene-400" />
              <h3 className="font-semibold text-slate-200">Interactive Thought Dissolver</h3>
            </div>
            
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Cognitive defusion involves recognizing thoughts as mere letters on a screen, not absolute facts. Type a stressful exam thought (e.g. *"I will ruin my mock test"*), click **Release**, and watch it fade away into empty space.
            </p>

            <form onSubmit={handleReleaseThought} className="flex gap-2 max-w-xl">
              <input
                type="text"
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value)}
                placeholder="e.g. I am not ready for the mock physics exam..."
                className="flex-1 px-4 py-2 rounded-xl glass-input text-xs md:text-sm"
                maxLength={80}
                aria-label="Stressful exam thought"
              />
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-650 text-slate-100 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
              >
                Release Thought
              </button>
            </form>
          </div>

          {/* Floating Canvas Area */}
          <div className="flex-1 w-full min-h-[200px] relative border border-dashed border-navy-800/80 rounded-xl mt-4 bg-navy-950/40 overflow-hidden flex items-center justify-center">
            {dissolvingThoughts.length === 0 && (
              <span className="text-[11px] text-slate-500 italic">Released thoughts will float and dissolve here.</span>
            )}

            {dissolvingThoughts.map((thought) => {
              if (!thought.active) return null;
              return (
                <div
                  key={thought.id}
                  className="absolute thought-bubble dissolve-anim bg-navy-900 border border-navy-700/60 text-slate-200 text-xs px-3.5 py-2.5 rounded-full shadow-lg shadow-black/30 text-center font-medium"
                  style={{
                    // Random left position
                    left: `${Math.max(10, Math.min(70, (Number(thought.id) % 65)))}%`,
                    bottom: '20px'
                  }}
                >
                  {thought.text}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. YouTube Guided Videos */}
      {activeSubTab === 'videos' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-4 rounded-xl text-xs md:text-sm text-slate-400 flex items-start gap-3">
            <AlertCircle className="text-serene-400 shrink-0 mt-0.5" size={16} />
            <p>
              We've gathered professional student wellness tutorials. These external resources focus on muscle relaxation, visual breathing pacing, study stretching, and cortisol reduction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {YOUTUBE_RESOURCES.map((res, index) => (
              <div key={index} className="glass-panel rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="video-container">
                    <iframe
                      src={`https://www.youtube.com/embed/${res.embedId}`}
                      title={res.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs md:text-sm leading-snug pt-1">{res.title}</h4>
                  <span className="text-[10px] text-serene-400 font-semibold">{res.channel}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{res.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
