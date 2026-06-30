import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Brain, AlertTriangle, RefreshCw, Sparkles, User } from 'lucide-react';

interface SocraticBranch {
  answerType: string; // "correct", "partial", or "wrong"
  followUp: string;
  guidance: string;
}

interface SocraticSeed {
  topic: string;
  question: string;
}

interface ParsedData {
  openingQuestion: string;
  branches: SocraticBranch[];
  seedQuestions: SocraticSeed[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  dataString: string;
  apiKeyOverride?: string;
}

export default function StudyModeSocraticTutor({ dataString, apiKeyOverride }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive branch selection state
  const [selectedBranch, setSelectedBranch] = useState<SocraticBranch | null>(null);

  // Chat message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.openingQuestion || !parsed.branches || !parsed.seedQuestions) {
        throw new Error('Invalid format: Missing Socratic elements.');
      }
      setData(parsed);
      setError(null);
      setSelectedBranch(null);
      
      // Initialize chat with the tutor's greeting and opening question
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I am your Socratic Study Tutor. I guide you with analytical questions to uncover truth together rather than giving direct answers.\n\nHere is our opening challenge:\n\n"${parsed.openingQuestion}"`
        }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to parse Socratic tutor data.');
    }
  }, [dataString]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleBranchClick = (branch: SocraticBranch) => {
    setSelectedBranch(branch);
    
    // Add user response simulated action & AI Socratic follow-up
    const simUserResponse = `I would like to test my understanding of this option: ${branch.answerType.toUpperCase()}`;
    const tutorReply = `[${branch.answerType.toUpperCase()} ATTRIBUTE ASSESSED]\n\n${branch.guidance}\n\n${branch.followUp}`;
    
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: simUserResponse },
      { role: 'assistant', content: tutorReply }
    ]);
  };

  const handleSeedClick = (seed: SocraticSeed) => {
    setInputValue(`Regarding ${seed.topic}: ${seed.question}`);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: inputValue };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          presetId: 'socraticTutor',
          customApiKey: apiKeyOverride,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server error speaking to Socratic Tutor.');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: resData.reply || 'Let us ponder this further.' }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `[TUTOR CONNECTION FAILURE] My apologies. I had trouble connecting. ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Socratic Tutor Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Summoning Socratic dialogue specialist...
      </div>
    );
  }

  return (
    <div className="space-y-6" id="socratic-tutor">
      {/* Socratic opening block */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-900 pb-2.5">
          <Brain size={15} className="text-teal-400" />
          <h4 className="text-[11px] font-bold font-display uppercase text-slate-300 tracking-wider">
            Socratic Diagnostic Dialogues
          </h4>
        </div>

        {/* Speech Bubble */}
        <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl relative">
          <div className="absolute top-4 -left-2.5 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-teal-500/20 border-b-8 border-b-transparent"></div>
          <p className="text-xs text-slate-200 leading-relaxed font-semibold">
            {data.openingQuestion}
          </p>
        </div>

        {/* Branch Buttons */}
        <div className="grid gap-2 sm:grid-cols-3">
          {data.branches.map((branch, bIdx) => (
            <button
              key={bIdx}
              onClick={() => handleBranchClick(branch)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-900 bg-slate-950 text-left text-[11px] hover:border-teal-500/40 text-slate-300 hover:text-white transition-all cursor-pointer font-medium space-y-0.5"
            >
              <span className="text-[8px] font-mono font-bold text-teal-400 uppercase tracking-widest block">
                Answer type: {branch.answerType}
              </span>
              <span className="line-clamp-2 leading-tight">
                {branch.followUp.substring(0, 70)}...
              </span>
            </button>
          ))}
        </div>

        {/* Detailed branch follow-up visual response */}
        <AnimatePresence>
          {selectedBranch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5"
            >
              <h5 className="text-[9px] font-mono font-black text-teal-400 uppercase tracking-widest">
                Tutor Guidance on option: {selectedBranch.answerType}
              </h5>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {selectedBranch.guidance}
              </p>
              <p className="text-xs text-teal-300 italic font-mono pt-1">
                " {selectedBranch.followUp} "
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Seed Questions Grid */}
      <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2">
          Socratic Seed Topics
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 max-h-36 overflow-y-auto pr-1">
          {data.seedQuestions.map((seed, sIdx) => (
            <button
              key={sIdx}
              onClick={() => handleSeedClick(seed)}
              className="p-3 rounded-xl border border-slate-900 bg-slate-950/80 text-left hover:border-slate-800 hover:bg-slate-900/10 cursor-pointer transition-all space-y-1"
            >
              <span className="text-[8px] font-mono font-semibold text-slate-500 uppercase tracking-widest block">
                {seed.topic}
              </span>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {seed.question}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat terminal interface */}
      <div className="bg-slate-950/90 border border-slate-900 rounded-2xl overflow-hidden flex flex-col h-[350px]">
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((msg, mIdx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={mIdx}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar icon */}
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-xs font-bold font-mono ${
                  isUser 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  {isUser ? <User size={12} /> : 'AI'}
                </div>

                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800/40 whitespace-pre-line'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-lg shrink-0 bg-slate-900 border border-slate-800 text-xs font-bold font-mono flex items-center justify-center text-slate-400">
                AI
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-900 text-slate-400 border border-slate-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-900 bg-slate-950 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your explanation or question..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500/40 outline-none rounded-xl py-2 px-4 text-xs text-white placeholder-slate-500 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
