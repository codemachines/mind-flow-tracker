import { LayoutDashboard, BookOpen, MessageSquare, Flame, Music, Settings, BrainCircuit } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, settings }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal', name: 'Mood Journal', icon: BookOpen },
    { id: 'chatbot', name: 'Dr. Seraphina (AI)', icon: MessageSquare },
    { id: 'exercises', name: 'Mindful Exercises', icon: Flame },
    { id: 'playlist', name: 'Calming Tunes', icon: Music },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-navy-800 h-screen sticky top-0 left-0 p-6 text-slate-300">
        {/* App Logo/Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-serene-500 p-2 rounded-xl text-navy-950 shadow-lg shadow-serene-500/20">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-wide bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
              MindFlow
            </h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Wellness Partner
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-3.5 mb-8 flex flex-col gap-1">
          <div className="text-xs text-slate-400">Welcome back,</div>
          <div className="font-semibold text-slate-200 truncate">{settings.userName}</div>
          <div className="text-[10px] bg-serene-500/10 text-serene-400 border border-serene-500/20 px-2 py-0.5 rounded-md self-start font-medium mt-1">
            Target: {settings.targetExam === 'Other' ? settings.otherExam || 'Competitive' : settings.targetExam}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-serene-500 text-navy-950 shadow-md shadow-serene-500/15 font-semibold'
                    : 'hover:bg-navy-800/50 hover:text-slate-100 text-slate-400'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-navy-950' : 'text-slate-400 group-hover:text-slate-200 transition-colors'} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Bottom copyright/indicator */}
        <div className="pt-4 border-t border-navy-900/80 text-[10px] text-slate-500 text-center">
          MindFlow v1.0 • Client-side Privacy
        </div>
      </aside>

      {/* Mobile Header and Navigation Bar */}
      <div className="md:hidden glass-panel border-b border-navy-800 fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-serene-500 p-1.5 rounded-lg text-navy-950">
            <BrainCircuit size={18} />
          </div>
          <span className="font-bold text-md text-slate-100 bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
            MindFlow
          </span>
        </div>
        <div className="text-xs bg-navy-900 px-2.5 py-1 rounded-md border border-navy-800 text-slate-300 font-medium">
          {settings.userName} ({settings.targetExam === 'Other' ? settings.otherExam || 'Custom' : settings.targetExam})
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden glass-panel border-t border-navy-800 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-40 pb-safe">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-serene-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-serene-400 scale-110' : 'text-slate-400'} />
              <span className="text-[9px] mt-1 truncate max-w-full">{item.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
