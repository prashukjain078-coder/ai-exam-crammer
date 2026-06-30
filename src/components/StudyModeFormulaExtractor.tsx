import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ChevronUp, Copy, Check, AlertTriangle, HelpCircle, RefreshCw, Layers } from 'lucide-react';

interface Variable {
  symbol: string;
  meaning: string;
  unit: string;
}

interface Formula {
  name: string;
  expression: string;
  variables: Variable[];
  workedExample: string;
  conditions: string;
  examTrap: string;
}

interface ParsedData {
  formulas: Formula[];
}

interface Props {
  dataString: string;
}

export default function StudyModeFormulaExtractor({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.formulas || !Array.isArray(parsed.formulas)) {
        throw new Error('Invalid format: Missing formulas list.');
      }
      setData(parsed);
      setError(null);
      setExpandedRows({});
    } catch (err: any) {
      setError(err.message || 'Failed to parse formula extractor data.');
    }
  }, [dataString]);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCopy = (expression: string, index: number) => {
    navigator.clipboard.writeText(expression).then(() => {
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    });
  };

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Formula Extractor Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || data.formulas.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Loading equations and theorems...
      </div>
    );
  }

  const filteredFormulas = data.formulas.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="formula-extractor">
      {/* Search Bar Block */}
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
            Theorem & Formula Extractor
          </h3>
          <p className="text-xs text-slate-400">Search and break down variables, derivations, and worked samples.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equations by formula name..."
            className="w-full bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-900 border border-slate-800/80 focus:border-indigo-500/40 rounded-xl py-2 px-10 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Accordion Rows */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {filteredFormulas.map((formula, idx) => {
            const isExpanded = !!expandedRows[idx];
            const isCopied = copiedIndex === idx;

            return (
              <motion.div
                key={`${formula.name}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26, delay: idx * 0.04 }}
                className="border border-slate-900 bg-slate-950/50 rounded-2xl overflow-hidden transition-colors hover:bg-slate-950/75"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleRow(idx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 font-display truncate md:max-w-xs">
                      {formula.name}
                    </h4>
                    
                    {/* Expression */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-lg px-3 py-1 font-mono text-[11px] text-indigo-400 font-semibold truncate max-w-sm">
                      {formula.expression}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <AlertTriangle size={13} className="text-rose-400/80 shrink-0" title="Exam trap inside!" />
                    <div className="p-1.5 rounded-lg bg-slate-900 text-slate-500">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="p-4 sm:p-5 border-t border-slate-900 bg-slate-950/30 space-y-4">
                        
                        {/* Copy button & Actions */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                            Equation Syntax Breakdown
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(formula.expression, idx);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white transition-all cursor-pointer font-mono"
                          >
                            {isCopied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            <span>{isCopied ? 'Copied' : 'Copy Formula'}</span>
                          </button>
                        </div>

                        {/* Variables table */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Variables & Parameters</span>
                          <div className="border border-slate-900 rounded-xl overflow-hidden text-[11px] font-mono">
                            {/* Table Header */}
                            <div className="grid grid-cols-3 bg-slate-900/60 p-2.5 font-bold text-slate-400 border-b border-slate-900">
                              <span>Symbol</span>
                              <span>Meaning</span>
                              <span>SI Unit</span>
                            </div>
                            {/* Table Rows */}
                            {formula.variables.map((v, vIdx) => (
                              <div 
                                key={vIdx} 
                                className={`grid grid-cols-3 p-2.5 ${vIdx % 2 === 0 ? 'bg-slate-950/20' : 'bg-slate-900/20'}`}
                              >
                                <span className="font-bold text-indigo-400">{v.symbol}</span>
                                <span className="text-slate-300">{v.meaning}</span>
                                <span className="text-slate-500">{v.unit || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Worked Numeric Example */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">Worked Calculation Example</span>
                          <div className="bg-slate-900/90 border border-slate-800/60 rounded-xl p-3.5 font-mono text-[10px] text-slate-300 space-y-1 overflow-x-auto leading-relaxed">
                            {formula.workedExample.split('\n').map((line, lIdx) => (
                              <div key={lIdx} className="flex gap-4">
                                <span className="text-slate-600 w-3 text-right select-none">{lIdx + 1}</span>
                                <span className="whitespace-pre">{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Two Columns: Conditions & Exam Trap */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* Conditions (blue tint block) */}
                          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
                            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold block">Conditions of Applicability</span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {formula.conditions}
                            </p>
                          </div>

                          {/* Exam Trap (rose tint block) */}
                          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-1">
                            <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest font-bold block">Common Exam Trap</span>
                            <p className="text-xs text-rose-300 leading-relaxed">
                              {formula.examTrap}
                            </p>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
