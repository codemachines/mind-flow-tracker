import { useState, useMemo } from 'react';
import { songsData, getSongLinks } from '../services/songsData';
import { Music, Filter, ExternalLink, Play, Disc, Heart } from 'lucide-react';

export default function Playlist({ logs }) {
  // Try to pre-detect current emotion based on latest log if available, fallback to 'anxious'
  const initialEmotion = useMemo(() => {
    if (logs.length > 0) {
      const latestFeelings = logs[0].feelings || [];
      if (latestFeelings.includes('Overwhelmed') || latestFeelings.includes('Anxious')) return 'anxious';
      if (latestFeelings.includes('Tired/Burned Out') || latestFeelings.includes('Unmotivated')) return 'exhausted';
      if (latestFeelings.includes('Sad')) return 'sad';
      if (latestFeelings.includes('Calm') || latestFeelings.includes('Confident')) return 'calm';
    }
    return 'anxious';
  }, [logs]);

  const [selectedEmotion, setSelectedEmotion] = useState(initialEmotion);
  const [langFilter, setLangFilter] = useState('All'); // All, Bollywood, English
  const [prevInitialEmotion, setPrevInitialEmotion] = useState(initialEmotion);

  if (initialEmotion !== prevInitialEmotion) {
    setSelectedEmotion(initialEmotion);
    setPrevInitialEmotion(initialEmotion);
  }

  const emotions = [
    { id: 'anxious', name: 'Anxious / Panic', color: 'border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10' },
    { id: 'stressed', name: 'Stressed / Worried', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' },
    { id: 'sad', name: 'Defeated / Sad', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10' },
    { id: 'exhausted', name: 'Exhausted / Tired', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10' },
    { id: 'calm', name: 'Calm / Focused', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' }
  ];

  const filteredSongs = useMemo(() => {
    const songs = songsData[selectedEmotion] || [];
    if (langFilter === 'All') return songs;
    return songs.filter(song => song.language === langFilter);
  }, [selectedEmotion, langFilter]);

  // Selected active track mockup state
  const [activePlayTrack, setActivePlayTrack] = useState(null);

  const handleMockPlay = (song) => {
    setActivePlayTrack(song);
    // Open YouTube link in new tab automatically on first click as helper
    const links = getSongLinks(song);
    window.open(links.youtube, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-serene-400 to-indigo-300 bg-clip-text text-transparent">
          Emotion-Based Playlists
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Acoustic, classical, and inspiring English and Bollywood tunes curated to match your specific stress levels.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Emotion selectors (Sidebar for play list) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-navy-800 pb-2">
              <Filter size={14} /> Select Your Emotion
            </h3>
            
            <div className="flex flex-col gap-2">
              {emotions.map((em) => {
                const isActive = selectedEmotion === em.id;
                return (
                  <button
                    key={em.id}
                    onClick={() => {
                      setSelectedEmotion(em.id);
                      setActivePlayTrack(null);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left text-xs md:text-sm font-semibold border transition-all ${
                      isActive
                        ? 'bg-serene-500 border-serene-500 text-navy-950 font-bold scale-102 shadow-md shadow-serene-500/10'
                        : em.color
                    }`}
                  >
                    {em.name}
                  </button>
                );
              })}
            </div>

            {/* Language filter toggles */}
            <div className="pt-2 border-t border-navy-900">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">Language Filter</span>
              <div className="flex bg-navy-900 border border-navy-800 p-0.5 rounded-xl">
                {['All', 'Bollywood', 'English'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLangFilter(lang)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      langFilter === lang
                        ? 'bg-navy-800 text-serene-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mini Player Mockup Widget */}
          {activePlayTrack ? (
            <div className="glass-panel rounded-2xl p-5 bg-gradient-to-br from-navy-900 to-indigo-950/40 border border-indigo-500/10 flex flex-col gap-4 animate-scaleUp">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-serene-500/10 border border-serene-500/20 text-serene-400 flex items-center justify-center shrink-0 animate-spin" style={{ animationDuration: '6s' }}>
                  <Disc size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-200 text-sm truncate">{activePlayTrack.title}</h4>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{activePlayTrack.artist}</p>
                </div>
              </div>
              
              <div className="text-[10px] bg-navy-950/50 border border-navy-800/80 rounded-lg p-2.5 text-slate-400 leading-normal italic">
                "{activePlayTrack.whyItHelps}"
              </div>

              <div className="flex justify-between items-center text-[10px] border-t border-navy-900 pt-3">
                <span className="text-serene-400 font-semibold flex items-center gap-1">
                  <Heart size={10} className="fill-serene-400 text-serene-400" /> Playing on YouTube
                </span>
                <a
                  href={getSongLinks(activePlayTrack).spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
                >
                  Switch to Spotify <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-5 border-dashed border border-navy-800 text-center text-slate-500 text-xs h-36 flex flex-col items-center justify-center gap-1.5">
              <Music size={24} />
              <span>Select any song to launch audio search and view details.</span>
            </div>
          )}
        </div>

        {/* Curated list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pl-1">
            <Music size={14} className="text-serene-400" /> Recommended Tracks ({filteredSongs.length})
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredSongs.length === 0 ? (
              <div className="h-48 glass-panel border-dashed border border-navy-800 rounded-xl flex items-center justify-center text-slate-500 text-xs italic">
                No songs match the language filter. Try switching filters.
              </div>
            ) : (
              filteredSongs.map((song) => {
                const songLinks = getSongLinks(song);
                const isActive = activePlayTrack?.title === song.title;

                return (
                  <div
                    key={song.title}
                    onClick={() => handleMockPlay(song)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between gap-4 ${
                      isActive 
                        ? 'bg-indigo-950/20 border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                        : 'glass-panel hover:bg-navy-900/60'
                    }`}
                  >
                    {/* Info */}
                    <div className="flex-1 space-y-1.5 min-w-0 pr-0 md:pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-navy-950 border border-navy-800 text-slate-300 px-2 py-0.5 rounded font-semibold shrink-0">
                          {song.language}
                        </span>
                        <h4 className="font-bold text-slate-200 text-xs md:text-sm truncate">{song.title}</h4>
                      </div>
                      
                      <p className="text-slate-400 text-xs truncate">{song.artist}</p>
                      
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {song.whyItHelps}
                      </p>
                    </div>

                    {/* Launch links */}
                    <div className="flex md:flex-col justify-end items-center gap-2 shrink-0 border-t border-navy-900 pt-3.5 md:border-t-0 md:pt-0 md:pl-4 md:border-l md:border-navy-900">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMockPlay(song);
                        }}
                        className="bg-serene-500/10 hover:bg-serene-500/20 border border-serene-500/20 text-serene-400 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Play size={10} /> YouTube Launch
                      </button>
                      
                      <a
                        href={songLinks.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-navy-900 hover:bg-navy-800 text-slate-300 border border-navy-800 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        Spotify Link <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
