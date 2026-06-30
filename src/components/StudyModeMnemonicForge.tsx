import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Shuffle, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';

interface MnemonicEntry {
  concept: string;
  acronym: string;
  memoryStory: string;
  rhyme: string;
  visualScene: string;
}

interface ParsedData {
  mnemonics: MnemonicEntry[];
}

interface Props {
  dataString: string;
}

export default function StudyModeMnemonicForge({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shuffledMnemonics, setShuffledMnemonics] = useState<MnemonicEntry[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.mnemonics || !Array.isArray(parsed.mnemonics)) {
        throw new Error('Invalid format: Missing mnemonics list.');
      }
      setData(parsed);
      setShuffledMnemonics(parsed.mnemonics);
      setFlippedCards({});
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to parse mnemonic forge data.');
    }
  }, [dataString]);

  const handleShuffle = () => {
    if (!data) return;
    const shuffled = [...data.mnemonics].sort(() => Math.random() - 0.5);
    setShuffledMnemonics(shuffled);
    setFlippedCards({});
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Mnemonic Forge Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || shuffledMnemonics.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Loading mnemonics...
      </div>
    );
  }

  return (
    <div className="space-y-6" id="mnemonic-forge">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-5 py-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-xs font-bold font-mono">
            {shuffledMnemonics.length} Tools
          </span>
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
            Mnemonic Forge
          </h3>
        </div>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Shuffle size={12} />
          <span>Shuffle Order</span>
        </button>
      </div>

      {/* Grid of 3D Flip Cards */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.06 }
            }
          }}
        >
          {shuffledMnemonics.map((item, idx) => {
            const isFlipped = !!flippedCards[idx];
            return (
              <motion.div
                key={`${item.concept}-${idx}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } }
                }}
                className="perspective-1500 h-64 w-full cursor-pointer relative"
                onClick={() => toggleFlip(idx)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d transition-transform duration-500"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800/80 hover:border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between backface-hidden shadow-xl">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[9px] font-semibold uppercase tracking-wider">
                          Mnemonic Badge
                        </span>
                        <HelpCircle size={14} className="text-slate-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 font-display line-clamp-2 leading-relaxed">
                        {item.concept}
                      </h4>
                    </div>
                    
                    <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-purple-300 font-mono uppercase tracking-widest mb-1 font-semibold">
                        Acronym / Acrostic
                      </p>
                      <p className="text-base font-black font-display text-white tracking-wide">
                        {item.acronym}
                      </p>
                    </div>

                    <div className="text-center text-[10px] text-slate-500 font-mono">
                      Click to Flip Card
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full bg-slate-950 border border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between backface-hidden shadow-2xl [transform:rotateY(180deg)] overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-purple-400 font-display uppercase tracking-wider border-b border-slate-900 pb-1.5">
                        {item.concept}
                      </h4>
                      
                      {/* Story */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Memory Palace Story</span>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{item.memoryStory}"
                        </p>
                      </div>

                      {/* Rhyme */}
                      <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-3 relative">
                        <Music size={11} className="absolute right-3 top-3 text-purple-400/50" />
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Rhyme / Rhythm</span>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line">
                          {item.rhyme}
                        </p>
                      </div>

                      {/* Visual Scene */}
                      <div className="bg-slate-900/40 border border-slate-800/20 rounded-xl p-3">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Visual Story Hook</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.visualScene}
                        </p>
                      </div>
                    </div>

                    <div className="text-center text-[9px] text-purple-400/60 font-mono mt-3 pt-2 border-t border-slate-900">
                      Click to Flip Back
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
