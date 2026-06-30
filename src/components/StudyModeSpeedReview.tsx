import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Timer, Check, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SpeedCard {
  topic: string;
  oneLiner: string;
  criticalFact: string;
  commonMistake: string;
}

interface ParsedData {
  speedCards: SpeedCard[];
}

interface Props {
  dataString: string;
}

export default function StudyModeSpeedReview({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 0 means not running
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [checkedCards, setCheckedCards] = useState<Record<number, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.speedCards || !Array.isArray(parsed.speedCards)) {
        throw new Error('Invalid format: Missing speedCards list.');
      }
      setData(parsed);
      setError(null);
      setCheckedCards({});
    } catch (err: any) {
      setError(err.message || 'Failed to parse speed review data.');
    }
  }, [dataString]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const startTimer = () => {
    setTimeLeft(30 * 60); // 30 minutes in seconds
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const toggleCheck = (idx: number) => {
    setCheckedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const formatTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Speed Review Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || data.speedCards.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Loading speed cards...
      </div>
    );
  }

  const totalCards = data.speedCards.length;
  const checkedCount = Object.values(checkedCards).filter(Boolean).length;
  const progressPercent = totalCards > 0 ? (checkedCount / totalCards) * 100 : 0;

  return (
    <div className="space-y-6" id="speed-review">
      {/* Timer Banner - Fixed/Floating at the top container context or top absolute */}
      <AnimatePresence>
        {timeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-4 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 animate-pulse">
                <Timer size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200 font-display">CRAM COUNTDOWN</h4>
                <p className="text-[10px] text-slate-400">Lock in your last-minute facts before the bell rings.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <button
                onClick={timerActive ? stopTimer : () => setTimerActive(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  timerActive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                } cursor-pointer`}
              >
                {timerActive ? 'Pause' : 'Resume'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress & Setup Header */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
              30-Min Speed Panic Review
            </h3>
            <p className="text-xs text-slate-400">Review absolute highest-yield points. Check them off as you go.</p>
          </div>
          {timeLeft === 0 && (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-950/30 font-display"
            >
              <Timer size={14} />
              <span>Start 30-Min Countdown</span>
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Review Progress</span>
            <span className="text-slate-200 font-bold">{checkedCount} / {totalCards} cards</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* List of Speed Cards */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {data.speedCards.map((card, idx) => {
            const isChecked = !!checkedCards[idx];
            return (
              <motion.div
                key={`${card.topic}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isChecked ? 0.4 : 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 26, delay: idx * 0.04 }}
                className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isChecked
                    ? 'border-slate-900 bg-slate-950/20'
                    : 'border-slate-800/80 bg-slate-950/50 hover:bg-slate-950/70 hover:border-amber-500/20'
                }`}
              >
                {/* Main Card row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch justify-between gap-4">
                  {/* Left: Topic */}
                  <div className="sm:w-1/4 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-900 pb-3 sm:pb-0 pr-3">
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest block mb-0.5">Topic Target</span>
                    <h4 className="text-xs font-black text-slate-200 font-display">
                      {card.topic}
                    </h4>
                  </div>

                  {/* Center: Core one-liner fact */}
                  <div className="flex-1 flex flex-col justify-center px-0 sm:px-4">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Key One-Liner</span>
                    <p className={`text-sm font-semibold leading-relaxed ${
                      isChecked ? 'text-slate-500 line-through' : 'text-slate-100'
                    }`}>
                      {card.oneLiner}
                    </p>
                  </div>

                  {/* Right: Critical fact and Checkbox */}
                  <div className="sm:w-1/4 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-900">
                    <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl max-w-[150px] text-right">
                      <span className="text-[8px] font-mono text-amber-400/80 uppercase tracking-widest block">CRITICAL FACT</span>
                      <span className="text-[10px] font-mono font-bold text-amber-300 truncate block">
                        {card.criticalFact}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleCheck(idx)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-500 border-amber-500 text-slate-950'
                          : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Check size={14} className={isChecked ? 'stroke-[3]' : ''} />
                    </button>
                  </div>
                </div>

                {/* Bottom: Warning strip */}
                <div className="bg-rose-500/5 border-t border-rose-500/10 px-4 py-2.5 flex items-center gap-2">
                  <ShieldAlert size={12} className="text-rose-400 shrink-0" />
                  <p className="text-[10px] text-rose-300 font-mono leading-relaxed">
                    <strong className="uppercase font-semibold tracking-wider mr-1 text-rose-400">Common Mark Loss Trap:</strong>
                    {card.commonMistake}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
