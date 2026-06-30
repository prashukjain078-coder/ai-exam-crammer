import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Printer, Check, AlertTriangle, RefreshCw, HelpCircle, Eye } from 'lucide-react';

interface SimulatorQuestion {
  question: string;
  modelAnswer: string;
  topic: string;
  marks: number;
}

interface ParsedData {
  easy: SimulatorQuestion[];
  medium: SimulatorQuestion[];
  hard: SimulatorQuestion[];
}

interface Props {
  dataString: string;
}

export default function StudyModePaperSimulator({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flippedQuestions, setFlippedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.easy || !parsed.medium || !parsed.hard) {
        throw new Error('Invalid format: Missing easy, medium, or hard quiz blocks.');
      }
      setData(parsed);
      setError(null);
      setFlippedQuestions({});
    } catch (err: any) {
      setError(err.message || 'Failed to parse paper simulator data.');
    }
  }, [dataString]);

  const toggleFlip = (tier: string, idx: number) => {
    const key = `${tier}-${idx}`;
    setFlippedQuestions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getFlippedTotalMarks = () => {
    if (!data) return 0;
    let total = 0;
    const tiers = ['easy', 'medium', 'hard'] as const;
    tiers.forEach((tier) => {
      data[tier].forEach((q, idx) => {
        if (flippedQuestions[`${tier}-${idx}`]) {
          total += q.marks;
        }
      });
    });
    return total;
  };

  const handlePrintPaper = () => {
    if (!data) return;

    let questionHtml = '';
    let globalIndex = 1;

    const buildTierHtml = (title: string, questions: SimulatorQuestion[]) => {
      if (questions.length === 0) return '';
      let html = `<h2 style="font-family: 'Space Grotesk', sans-serif; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px;">${title} Section</h2>`;
      questions.forEach((q) => {
        html += `
          <div style="margin-bottom: 24px; padding: 16px; border-left: 4px solid #6366f1; background-color: #f8fafc; font-family: 'Inter', sans-serif;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; color: #475569; margin-bottom: 8px;">
              <span>Question ${globalIndex++} (${q.topic})</span>
              <span>[${q.marks} Marks]</span>
            </div>
            <p style="font-size: 15px; color: #0f172a; margin: 0; line-height: 1.6;">${q.question}</p>
          </div>
        `;
      });
      return html;
    };

    questionHtml += buildTierHtml('Section A: Easy Recall Questions', data.easy);
    questionHtml += buildTierHtml('Section B: Medium Application Questions', data.medium);
    questionHtml += buildTierHtml('Section C: Hard Synthesis Questions', data.hard);

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simulated Exam Paper</title>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #334155; line-height: 1.5; }
            h1 { font-family: 'Space Grotesk', sans-serif; text-align: center; color: #0f172a; margin-bottom: 4px; }
            p.subtitle { text-align: center; color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 30px; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Print Exam Sheet</button>
          </div>
          <h1>SIMULATED TRIAL EXAMINATION</h1>
          <p class="subtitle">AI Generated Past Paper • Total Predicted Marks Included</p>
          ${questionHtml}
          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 20px;">
            End of Simulated Examination Paper. Do not distribute answers without master key access.
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(fullHtml);
      printWindow.document.close();
    } else {
      alert('Popup blocked! Please allow popups to open the printable exam sheet.');
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Paper Simulator Parse Error</h3>
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
        Compiling simulated exam papers...
      </div>
    );
  }

  const renderTierSection = (title: string, color: string, tier: 'easy' | 'medium' | 'hard', borderClass: string, textClass: string) => {
    const list = data[tier];
    if (list.length === 0) return null;

    return (
      <div className="space-y-4">
        {/* Tier Header */}
        <div className={`border-b ${borderClass} pb-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <h4 className="text-xs font-black font-display uppercase tracking-widest text-slate-200">
              {title} Section
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {list.length} Questions
          </span>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((q, idx) => {
            const isFlipped = !!flippedQuestions[`${tier}-${idx}`];
            return (
              <div
                key={`${tier}-${idx}`}
                onClick={() => toggleFlip(tier, idx)}
                className="perspective-1500 h-48 w-full cursor-pointer relative"
              >
                <motion.div
                  className="w-full h-full relative preserve-3d transition-transform duration-500"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between backface-hidden shadow-xl">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded-md border font-semibold ${textClass} ${borderClass}`}>
                          {tier.toUpperCase()} #{idx + 1}
                        </span>
                        <span className="text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                          {q.marks} Marks
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans leading-relaxed line-clamp-3">
                        {q.question}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono border-t border-slate-900/80 pt-2 text-slate-500">
                      <span>Topic: {q.topic}</span>
                      <span className="text-indigo-400">Click to reveal answer</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full bg-slate-950 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-between backface-hidden shadow-2xl [transform:rotateY(180deg)] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      <h5 className="text-[9px] font-black font-display text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1.5">
                        Answer Key & Model Structure
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {q.modelAnswer}
                      </p>
                    </div>

                    <div className="text-center text-[9px] text-indigo-400/60 font-mono mt-3 pt-2 border-t border-slate-900">
                      Click to flip back to question
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="paper-simulator">
      {/* Sticky Header Bar for Running Total Marks */}
      <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ClipboardList size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 font-display">SIMULATED EXAM STATS</h4>
            <p className="text-[10px] text-slate-400">Flip questions to score marks and view details.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">RUNNING SCORE</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {getFlippedTotalMarks()} Marks Evaluated
            </span>
          </div>

          <button
            onClick={handlePrintPaper}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-950/30 font-display"
          >
            <Printer size={12} />
            <span>Print Trial Paper</span>
          </button>
        </div>
      </div>

      {/* Main vertical stacks of tiers */}
      <div className="space-y-8">
        {renderTierSection('Section A: Knowledge Recall', 'bg-emerald-400', 'easy', 'border-emerald-500/20', 'text-emerald-400 bg-emerald-500/5')}
        {renderTierSection('Section B: Case Application', 'bg-amber-400', 'medium', 'border-amber-500/20', 'text-amber-400 bg-amber-500/5')}
        {renderTierSection('Section C: Synthesis & Essay', 'bg-rose-400', 'hard', 'border-rose-500/20', 'text-rose-400 bg-rose-500/5')}
      </div>
    </div>
  );
}
