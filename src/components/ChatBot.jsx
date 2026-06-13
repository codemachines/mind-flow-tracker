import { useState, useRef, useEffect } from 'react';
import { storage } from '../services/storage';
import { geminiService } from '../services/gemini';
import { Send, AlertCircle } from 'lucide-react';

const QUICK_PROMPTS = [
  "Help me calm down right now",
  "I got a bad score in my mock test",
  "I feel extremely tired but have to study",
  "How do I deal with exam day panic?"
];

export default function ChatBot({ settings }) {
  const [messages, setMessages] = useState(() => storage.getChatHistory());
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message to state and storage
    storage.addChatMessage('user', textToSend);
    setMessages(storage.getChatHistory());
    setInputText('');
    setIsTyping(true);

    try {
      // Get AI response
      const latestHistory = storage.getChatHistory();
      const botResponse = await geminiService.getChatResponse(latestHistory, settings.targetExam);
      
      // Save bot response to storage and update state
      storage.addChatMessage('bot', botResponse);
      setMessages(storage.getChatHistory());
    } catch (err) {
      console.error(err);
      storage.addChatMessage('bot', "I apologize, I am experiencing a small connection delay. Let's take a deep breath. Focus on your inhale for 4 seconds, and exhale for 4 seconds. What is currently causing you the most tension?");
      setMessages(storage.getChatHistory());
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your conversation history with Dr. Seraphina?")) {
      storage.clearChatHistory();
      setMessages(storage.getChatHistory());
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)] flex flex-col glass-panel rounded-2xl border border-navy-800 overflow-hidden animate-fadeIn">
      
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-navy-800 bg-navy-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
              DS
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-serene-500 rounded-full border-2 border-navy-950"></span>
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-sm md:text-md">Dr. Seraphina</h3>
            <span className="text-[10px] text-serene-400 font-medium">Empathetic Digital Psychologist</span>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="text-xs text-slate-500 hover:text-slate-300 hover:bg-navy-800/40 px-3 py-1.5 rounded-lg border border-navy-800 transition-colors"
        >
          Reset Chat
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/10 text-indigo-300 text-[11px] md:text-xs rounded-xl flex items-start gap-2.5 max-w-2xl mx-auto mb-2">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Dr. Seraphina is a digital wellness guide utilizing cognitive behavioral frameworks. If you are experiencing acute health symptoms, please contact your university health office or national support helplines.
          </p>
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for bot */}
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  DS
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-serene-500 text-navy-950 font-medium rounded-br-none shadow-md shadow-serene-500/5'
                    : 'bg-navy-900 border border-navy-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className={`block text-[9px] mt-1 text-right ${isUser ? 'text-navy-900/60' : 'text-slate-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing bubble */}
        {isTyping && (
          <div className="flex items-end gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
              DS
            </div>
            <div className="bg-navy-900 border border-navy-800 rounded-2xl rounded-bl-none px-4 py-3.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input panel */}
      <div className="p-4 border-t border-navy-800 bg-navy-900/20 space-y-3 shrink-0">
        
        {/* Quick Prompts */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-navy-800">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] text-slate-400 hover:text-slate-200 bg-navy-900 hover:bg-navy-800/80 border border-navy-800/80 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask Dr. Seraphina... (e.g. "I'm stressed about ${settings.targetExam}")`}
            className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs md:text-sm"
            disabled={isTyping}
            aria-label="Ask Dr. Seraphina"
            required
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="bg-serene-500 hover:bg-serene-600 disabled:bg-slate-700 disabled:text-slate-400 text-navy-950 font-bold p-2.5 rounded-xl transition-all duration-150 shrink-0"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
