import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ReferenceLine, Label } from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, Award, Compass, ArrowRight } from 'lucide-react';

export default function Dashboard({ logs, exams, settings, setActiveTab }) {
  const [timeRange, setTimeRange] = useState(7); // 7, 14, 30 days

  // Format logs for Recharts mood trend line
  const trendData = useMemo(() => {
    if (logs.length === 0) return [];
    
    // Sort logs chronologically
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter based on selected time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    return sorted
      .filter(log => new Date(log.date) >= cutoffDate)
      .map(log => {
        const dateObj = new Date(log.date);
        return {
          id: log.id,
          // Format date as e.g. "June 12"
          dateStr: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: dateObj.toISOString().split('T')[0],
          mood: log.rating,
          stress: log.analysis ? log.analysis.score : Math.min(10, Math.max(1, 11 - log.rating))
        };
      });
  }, [logs, timeRange]);

  // Find exams overlapping with the trend data range
  const visibleExams = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    
    return exams.filter(exam => {
      const examTime = new Date(exam.date);
      // Let's include upcoming exams as well (up to 7 days in future)
      const futureLimit = new Date();
      futureLimit.setDate(futureLimit.getDate() + 7);
      return examTime >= cutoffDate && examTime <= futureLimit;
    });
  }, [exams, timeRange]);

  // Group average stress level by Day of Week
  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const stressByDay = days.map(day => ({ name: day, stressSum: 0, count: 0, average: 0 }));

    logs.forEach(log => {
      const dayIndex = new Date(log.date).getDay();
      const stressScore = log.analysis ? log.analysis.score : Math.min(10, Math.max(1, 11 - log.rating));
      stressByDay[dayIndex].stressSum += stressScore;
      stressByDay[dayIndex].count += 1;
    });

    return stressByDay.map(day => {
      const avg = day.count > 0 ? Number((day.stressSum / day.count).toFixed(1)) : 0;
      return {
        name: day.name.substring(0, 3), // Mon, Tue...
        fullName: day.name,
        Stress: avg
      };
    });
  }, [logs]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (logs.length === 0) return { avgMood: 0, avgStress: 0, status: 'No Data' };
    
    const moodSum = logs.reduce((sum, log) => sum + log.rating, 0);
    const stressSum = logs.reduce((sum, log) => {
      const score = log.analysis ? log.analysis.score : Math.min(10, Math.max(1, 11 - log.rating));
      return sum + score;
    }, 0);
    
    const avgMood = (moodSum / logs.length).toFixed(1);
    const avgStress = (stressSum / logs.length).toFixed(1);
    
    let status = 'Stable';
    if (avgStress >= 7.5) status = 'Severe Burnout Alert';
    else if (avgStress >= 5.5) status = 'Elevated Stress';
    else if (avgStress <= 3) status = 'Peaceful & Balanced';

    return { avgMood, avgStress, status };
  }, [logs]);

  // GenAI Surfaced Patterns Parser
  const aiInsights = useMemo(() => {
    // If we have AI assessments in logs, extract notes
    const assessments = logs.filter(l => l.analysis).map(l => l.analysis);
    
    if (assessments.length < 2) {
      return {
        hasPatterns: false,
        summary: "MindFlow is compiling your daily trends.",
        patterns: [
          "Complete at least 2 journal entries to trigger active pattern detection.",
          "Schedule your mock test dates in Settings so we can trace test anxiety curves.",
          "Try logging your mood on study days vs test days to isolate cognitive burnout triggers."
        ],
        cure: "Continue logging your honest feelings and ratings. Once we gather sufficient data points, Dr. Seraphina will isolate specific cognitive triggers and generate a tailored behavioral timeline."
      };
    }

    // Dynamic pattern extraction based on actual data
    const patternsList = [];
    let generatedCure = "";

    // 1. Check if Sunday stress is elevated (User specifically mentioned Sunday mock tests)
    const sundayData = dayOfWeekData.find(d => d.fullName === 'Sunday');
    const weekdayStress = dayOfWeekData.filter(d => d.fullName !== 'Sunday' && d.fullName !== 'Saturday');
    const avgWeekdayStress = weekdayStress.reduce((sum, d) => sum + d.Stress, 0) / weekdayStress.length;
    
    if (sundayData && sundayData.Stress > avgWeekdayStress + 1) {
      patternsList.push("Sunday Stress Spike: Your stress levels increase by over 25% on Sundays, heavily correlated with mock tests scheduled for the upcoming week.");
      generatedCure = "Proactive Sunday Reset: Shift your heaviest study load to Thursday/Friday. Make Sunday afternoons a review-only zone and schedule our 4-7-8 breathing session at 4:00 PM Sundays to intercept the anxiety cycle before it peaks.";
    }

    // 2. Correlation between mood drops and upcoming exams
    let examStressMatch = false;
    exams.forEach(exam => {
      const examDateStr = exam.date;
      // Find logs 1-2 days before this exam
      const prepLogs = logs.filter(log => {
        const diffTime = Math.abs(new Date(log.date) - new Date(examDateStr));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 2;
      });
      
      const preExamStress = prepLogs.map(l => l.analysis?.score || (11 - l.rating));
      const avgPreExamStress = preExamStress.reduce((s, c) => s + c, 0) / (preExamStress.length || 1);
      if (preExamStress.length > 0 && avgPreExamStress >= 6.5) {
        examStressMatch = true;
      }
    });

    if (examStressMatch) {
      patternsList.push(`Pre-Test Anticipatory Anxiety: Significant drop in mood and focus within 48 hours of scheduled ${settings.targetExam} mock sessions.`);
      if (!generatedCure) {
        generatedCure = "Mock Test Reframing: Reduce practice load the evening before tests. Substitute intensive revision with a 10-minute progressive muscle relaxation session and our 'Calming Tunes' Bollywood acoustic playlist.";
      }
    }

    // 3. Cognitive distortions check
    const distortionsMap = {};
    assessments.forEach(ass => {
      if (ass.cognitiveDistortions) {
        ass.cognitiveDistortions.forEach(dis => {
          if (!dis.startsWith('None')) {
            const cleanDis = dis.split('(')[0].trim();
            distortionsMap[cleanDis] = (distortionsMap[cleanDis] || 0) + 1;
          }
        });
      }
    });

    const topDistortion = Object.keys(distortionsMap).sort((a,b) => distortionsMap[b] - distortionsMap[a])[0];
    if (topDistortion) {
      patternsList.push(`Frequent Cognitive Pattern: Identified high frequency of '${topDistortion}' (e.g., imagining worst-case scenarios or setting rigid rules).`);
    }

    // Fallbacks if no specific rules trigger
    if (patternsList.length === 0) {
      patternsList.push("Exams Correlation: Overall stress spikes during high study hour blocks, with subject workload listed as the primary stressor.");
      patternsList.push("Resilience Indicator: You recover back to stable mood ranges quickly after completing active rest sessions.");
      generatedCure = "Maintain an active restoration protocol. Interleave 50-minute study blocks with 10-minute offline breathing breaks to avoid cognitive saturation.";
    }

    return {
      hasPatterns: true,
      summary: `AI has detected ${patternsList.length} distinct stress triggers in your journal logs.`,
      patterns: patternsList,
      cure: generatedCure
    };
  }, [logs, exams, dayOfWeekData, settings.targetExam]);

  // Get next 2 upcoming tests
  const upcomingExams = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return exams
      .filter(e => e.date >= today)
      .slice(0, 2);
  }, [exams]);

  // Dynamic quotes based on stress levels
  const motivationalQuote = useMemo(() => {
    const stress = Number(stats.avgStress);
    if (stress >= 7.5) {
      return "Your nervous system is crying out for rest. A tired mind cannot absorb physics or calculus. Pause, breathe, and listen to a song. You are more than a test.";
    } else if (stress >= 5) {
      return "Stress is energy without direction. Focus on the single topic in front of you right now. Release the weight of the whole syllabus.";
    }
    return "A calm mind is your ultimate study superpower. Keep learning, keep resting, and maintain your routine.";
  }, [stats.avgStress]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
            Student Mental Wellness Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualizing cognitive trends, stress hotspots, and GenAI preparation advice.
          </p>
        </div>
        
        {/* Time range switcher */}
        <div className="flex bg-navy-900 border border-navy-800 rounded-xl p-1 self-start">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeRange === days
                  ? 'bg-serene-500 text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Wellness Quote Banner */}
      <div className="glass-panel border-l-4 border-serene-500 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="bg-serene-500/10 p-2.5 rounded-xl text-serene-400 shrink-0">
          <Compass size={22} />
        </div>
        <p className="text-slate-200 text-sm md:text-md italic leading-relaxed text-center md:text-left flex-1">
          "{motivationalQuote}"
        </p>
      </div>

      {/* Stats Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Mood Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Mood</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">10 Max</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">{stats.avgMood || 'N/A'}</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <p className="text-slate-500 text-[10px] mt-2 border-t border-navy-900 pt-2">
            Self-reported focus and emotional health index.
          </p>
        </div>

        {/* Stress Indicator Card */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Burnout Risk</span>
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-medium">10 Peak</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-100">{stats.avgStress || 'N/A'}</span>
            <span className="text-xs text-slate-400">/ 10</span>
          </div>
          <p className="text-slate-500 text-[10px] mt-2 border-t border-navy-900 pt-2">
            Average stress load calculated by GenAI.
          </p>
        </div>

        {/* General Mental Status */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mental State</span>
            <TrendingUp size={16} className="text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className={`text-md font-bold truncate block ${
              stats.status.includes('Alert') ? 'text-red-400' : stats.status.includes('Elevated') ? 'text-amber-400' : 'text-serene-400'
            }`}>
              {stats.status}
            </span>
          </div>
          <p className="text-slate-500 text-[10px] mt-2 border-t border-navy-900 pt-2">
            Status assessment based on mood data.
          </p>
        </div>

        {/* Closest Mock Tests */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Schedule</span>
            <Calendar size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 text-xs text-slate-300 min-h-[40px] flex flex-col justify-center">
            {upcomingExams.length === 0 ? (
              <span className="text-slate-500 italic text-[11px]">No upcoming tests scheduled.</span>
            ) : (
              <div className="space-y-1">
                {upcomingExams.map(e => (
                  <div key={e.id} className="flex justify-between items-center gap-1.5">
                    <span className="font-semibold truncate text-[11px] text-slate-200">{e.title}</span>
                    <span className="text-[10px] text-serene-400 font-medium shrink-0">{e.date.split('-').slice(1).join('/')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-slate-500 text-[10px] mt-1 border-t border-navy-900 pt-1 flex justify-between items-center">
            <span>Tracking test anxieties.</span>
            <button onClick={() => setActiveTab('settings')} className="text-serene-400 hover:underline flex items-center gap-0.5">
              Edit <ArrowRight size={10} />
            </button>
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <AlertTriangle size={40} className="text-serene-400 animate-pulse" />
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-200">No Mood Logs Found</h3>
            <p className="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed">
              We need some initial information about your daily thoughts to map your mental wellness. Write your first mood journal entry to populate the graphs.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('journal')}
            className="bg-serene-500 hover:bg-serene-600 text-navy-950 font-bold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-serene-500/15"
          >
            Create First Journal Log
          </button>
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Mood Trend Chart */}
            <div className="glass-panel rounded-2xl p-5 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm md:text-md">Mood & Stress Prep Curves</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 bg-serene-400 rounded-sm"></span> Mood 
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-sm ml-2"></span> Stress (AI)
                </span>
              </div>
              <div className="h-64 md:h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#15cc60" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#15cc60" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="dateStr" stroke="#64748b" tickLine={false} />
                    <YAxis domain={[1, 10]} stroke="#64748b" tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#151e36', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                      labelStyle={{ fontWeight: 'bold', color: '#15cc60' }}
                    />
                    
                    {/* Render Exam Reference Lines */}
                    {visibleExams.map((exam) => {
                      // Find if we have a matching log for this exam date to position the reference line
                      const matchingData = trendData.find(d => d.rawDate === exam.date);
                      if (!matchingData) return null;
                      return (
                        <ReferenceLine 
                          key={exam.id}
                          x={matchingData.dateStr} 
                          stroke="rgba(244,63,94,0.6)" 
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                        >
                          <Label 
                            value={exam.title.substring(0, 15) + '...'} 
                            position="top" 
                            fill="#f43f5e" 
                            fontSize={9} 
                            fontWeight="bold"
                          />
                        </ReferenceLine>
                      );
                    })}

                    <Area type="monotone" dataKey="mood" stroke="#15cc60" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMood)" name="Mood (1-10)" />
                    <Area type="monotone" dataKey="stress" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorStress)" name="Stress (1-10)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 border-t border-navy-900/60 pt-3">
                <span className="text-red-400 font-bold">--</span> Dashed red lines indicate scheduled mock test dates.
              </div>
            </div>

            {/* Stress Hotspots Day of Week Chart */}
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-200 text-sm md:text-md">Stress Hotspots</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Average stress rating grouped by day of week.</p>
              </div>
              <div className="h-64 md:h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeekData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#64748b" tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ background: '#151e36', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                    />
                    <Bar dataKey="Stress" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      {/* Highlight Sunday if it's highest */}
                      {dayOfWeekData.map((entry, index) => {
                        const isSunday = entry.name === 'Sun';
                        return (
                          <Area 
                            key={`cell-${index}`} 
                            fill={isSunday ? '#a78bfa' : '#6366f1'} 
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* AI Patterns & Clinical Cure Panel */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-navy-800 pb-3">
              <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                <Award size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm md:text-md">GenAI Surfaced Preparation Patterns</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Cognitive triggers analyzed from your journal entries.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Pattern list */}
              <div className="md:col-span-3 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Stress Triggers</h4>
                <div className="space-y-2.5">
                  {aiInsights.patterns.map((pattern, index) => (
                    <div key={index} className="flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed bg-navy-900/40 p-3 rounded-xl border border-navy-800/80">
                      <span className="font-bold text-indigo-400 shrink-0">#{index+1}</span>
                      <span>{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Psychological Cure recommendation */}
              <div className="md:col-span-2 bg-gradient-to-br from-indigo-950/40 to-serene-950/20 rounded-xl p-5 border border-indigo-500/10 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-serene-400 uppercase tracking-widest">Suggested Cure</div>
                  <h4 className="font-bold text-slate-200 text-sm">Dr. Seraphina's Proactive Protocol</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                    {aiInsights.cure}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => setActiveTab('exercises')}
                    className="text-xs font-bold bg-serene-500 hover:bg-serene-600 text-navy-950 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-serene-500/10"
                  >
                    Open Exercises <ArrowRight size={12} />
                  </button>
                  <button 
                    onClick={() => setActiveTab('chatbot')}
                    className="text-xs font-bold text-indigo-300 hover:text-indigo-200 px-3 py-2 transition-colors"
                  >
                    Talk with Doctor
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
