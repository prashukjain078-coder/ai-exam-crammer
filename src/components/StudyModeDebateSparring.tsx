import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Send, RefreshCw, AlertTriangle, ChevronRight, ChevronDown, User, ShieldAlert } from 'lucide-react';

interface DebateRow {
  topic: string;
  mainstreamView: string;
  counterArgument: string;
  weakestPoint: string;
  mustDefend: string;
}

interface ParsedData {
  openingChallenge: string;
  debates: DebateRow[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  dataString: string;
  apiKeyOverride?: string;
}

export default function StudyModeDebateSparring({ dataString, apiKeyOverride }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDebateIdx, setExpandedDebateIdx] = useState<number | null>(null);

  // Chat message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.openingChallenge || !parsed.debates || !Array.isArray(parsed.debates)) {
        throw new Error('Invalid format: Missing debate elements or challenges.');
      }
      setData(parsed);
      setError(null);
      setExpandedDebateIdx(null);

      // Pre-seed the chat with the opening challenge from the AI Master Debater
      setMessages([
        {
          role: 'assistant',
          content: `${parsed.openingChallenge}`
        }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to parse debate sparring data.');
    }
  }, [dataString]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
          presetId: 'debateSparring',
          customApiKey: apiKeyOverride,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Server error speaking to Master Debater.');
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: resData.reply || 'Concede your stance, or present a valid logic.' }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `[DEBATER CONNECTION INTERRUPTED] I demand a stable link to hear your rebuttal! ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDebate = (row: DebateRow, idx: number) => {
    setExpandedDebateIdx(expandedDebateIdx === idx ? null : idx);
    setInputValue(`Regarding ${row.topic}: I would like to defend the mainstream stance against your counter-arguments!`);
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Debate Sparring Parse Error</h3>
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
        Awaiting debate challenge...
      </div>
    );
  }

  return (
    <div className="space-y-6" id="debate-sparring">
      {/* Header challenge block */}
      <div className="bg-gradient-to-r from-rose-950/40 to-slate-950/60 border border-rose-500/20 p-5 rounded-3xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 border-b border-rose-500/10 pb-2.5">
          <Swords size={16} className="text-rose-400 shrink-0" />
          <h4 className="text-[11px] font-black font-display uppercase text-rose-400 tracking-wider">
            Devil's Advocate Sparring Arena
          </h4>
        </div>
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
          <p className="text-xs font-serif text-rose-200 leading-relaxed font-semibold italic">
            "{data.openingChallenge}"
          </p>
        </div>
      </div>

      {/* Debates accordion checklist */}
      <div className="bg-slate-950/30 border border-slate-900 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 border-b border-slate-900 pb-2">
          Interactive Argumentation Matrix
        </h4>
        <div className="space-y-3">
          {data.debates.map((row, idx) => {
            const isExpanded = expandedDebateIdx === idx;
            return (
              <div
                key={idx}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? 'border-rose-500/30 bg-slate-950/70 shadow-lg shadow-rose-950/5'
                    : 'border-slate-900/80 bg-slate-950/55 hover:border-slate-800'
                }`}
              >
                <div
                  onClick={() => handleSelectDebate(row, idx)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono font-bold text-rose-400 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-slate-200 font-display">
                      {row.topic}
                    </h5>
                  </div>
                  <div className="text-slate-500">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-900/60 p-4 bg-slate-950/20 space-y-4 text-xs"
                    >
                      {/* 2-Column Mainstream vs Counter-Argument */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Mainstream */}
                        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-1">
                          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">Mainstream Position</span>
                          <p className="text-slate-300 leading-relaxed font-sans">{row.mainstreamView}</p>
                        </div>
                        {/* Counter-Argument (rose tint) */}
                        <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg space-y-1">
                          <span className="text-[8px] font-mono text-rose-400 uppercase tracking-widest font-bold">AI Counter-Argument</span>
                          <p className="text-slate-300 leading-relaxed font-sans">{row.counterArgument}</p>
                        </div>
                      </div>

                      {/* Boxes: Weakest Point & Must Defend */}
                      <div className="space-y-2">
                        {/* Weakest Point (rose box) */}
                        <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5">
                          <ShieldAlert size={14} className="text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[8px] font-mono text-rose-400 uppercase tracking-widest font-bold block mb-0.5">Weakest Point of mainstream view</span>
                            <p className="text-slate-300 font-sans leading-relaxed">{row.weakestPoint}</p>
                          </div>
                        </div>

                        {/* Must Defend (amber box) */}
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-2.5">
                          <ShieldAlert size={14} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest font-bold block mb-0.5">Your Defence Directives</span>
                            <p className="text-slate-300 font-sans leading-relaxed">{row.mustDefend}</p>
                          </div>
                        </div>
                      </div>

                      {/* Select alert label */}
                      <div className="text-[9px] text-rose-400 font-mono italic">
                        * Clicking this card filled your chat box below. Defend your case in the arena!
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Terminal Area */}
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
                {/* Avatar Icon */}
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border text-xs font-bold font-mono ${
                  isUser
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {isUser ? <User size={12} /> : <Swords size={12} />}
                </div>

                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 rounded-tl-none border border-rose-500/10 border-l-[3px] whitespace-pre-line'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-7 h-7 rounded-lg shrink-0 bg-slate-900 border border-slate-800 text-xs font-bold font-mono flex items-center justify-center text-rose-400">
                <Swords size={12} />
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-slate-900 text-slate-400 border border-slate-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
            placeholder="Type your rebuttal logic..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500/40 outline-none rounded-xl py-2 px-4 text-xs text-white placeholder-slate-500 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
