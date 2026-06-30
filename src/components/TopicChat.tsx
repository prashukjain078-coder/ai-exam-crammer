import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, RefreshCw, BookOpen } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TopicChatProps {
  cheatSheet: string;
  sessionTitle: string;
  apiKeyOverride: string;
}

export default function TopicChat({ cheatSheet, sessionTitle, apiKeyOverride }: TopicChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset chat when session changes
  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [cheatSheet]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/topic-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          cheatSheet,
          customApiKey: apiKeyOverride.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get response.');

      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: data.reply || 'I could not generate a response.' },
      ]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: `Connection issue: ${err.message}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <>
      {/* Floating bubble trigger */}
      <motion.button
        id="topic-chat-bubble"
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-2xl shadow-indigo-950/60 flex items-center justify-center border border-indigo-400/20 cursor-pointer"
        title="Ask about your study material"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={22} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread pulse when chat is closed and has messages */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-[#06070b] text-[8px] font-bold flex items-center justify-center text-white">
            {messages.filter((m) => m.role === 'assistant').length}
          </span>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="topic-chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                  <BookOpen size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-widest font-mono text-indigo-400 uppercase">
                    Topic Assistant
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                    {sessionTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                    title="Clear chat"
                  >
                    <RefreshCw size={12} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-3">
                  <div className="p-3 rounded-full bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
                    <MessageSquare size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      Ask anything about this topic
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-[220px] mx-auto">
                      I only know what's in your study material — off-topic questions will be declined.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                    {['Summarise key concepts', 'What are the main formulas?', 'What should I focus on?'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-all cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                            isUser
                              ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {isUser ? <User size={11} /> : <Bot size={11} />}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[78%] px-3 py-2.5 rounded-xl text-xs leading-relaxed ${
                            isUser
                              ? 'bg-indigo-600 text-white rounded-tr-sm'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Loading indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
                        <Bot size={11} />
                      </div>
                      <div className="px-3 py-3 rounded-xl rounded-tl-sm bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div className="px-3 py-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-indigo-500/40 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your study material..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none disabled:opacity-50 min-w-0"
                />
                <button
                  id="topic-chat-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="shrink-0 w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-slate-600 text-center mt-1.5 font-mono">
                Only answers questions from your uploaded material
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
