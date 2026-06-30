import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, List, Columns, ChevronDown, ChevronRight, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface TimelineEntry {
  date: string;
  event: string;
  significance: string;
  people: string;
  causeEffect: string;
  era: string;
}

interface ParsedData {
  subject: string;
  entries: TimelineEntry[];
}

interface Props {
  dataString: string;
}

const COLOR_PALETTE = [
  'bg-indigo-400 border-indigo-300 text-indigo-400',
  'bg-emerald-400 border-emerald-300 text-emerald-400',
  'bg-pink-400 border-pink-300 text-pink-400',
  'bg-amber-400 border-amber-300 text-amber-400',
  'bg-cyan-400 border-cyan-300 text-cyan-400',
  'bg-purple-400 border-purple-300 text-purple-400',
  'bg-rose-400 border-rose-300 text-rose-400',
  'bg-teal-400 border-teal-300 text-teal-400',
];

export default function StudyModeTimeline({ dataString }: Props) {
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // View mode: horizontal scroll ("scroll") vs vertical list ("list")
  const [viewMode, setViewMode] = useState<'scroll' | 'list'>('scroll');
  // Record of unique eras with assigned colors
  const [eraColors, setEraColors] = useState<Record<string, string>>({});
  // Selected timeline entry index for inline expand
  const [selectedEntryIdx, setSelectedEntryIdx] = useState<number | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(dataString) as ParsedData;
      if (!parsed.entries || !Array.isArray(parsed.entries)) {
        throw new Error('Invalid format: Missing timeline entries.');
      }
      
      // Sort entries by date/chronologically or preserve order as loaded (usually pre-sorted)
      setData(parsed);
      setError(null);
      setSelectedEntryIdx(null);

      // Distribute era colors
      const uniqueEras = Array.from(new Set(parsed.entries.map(e => e.era).filter(Boolean)));
      const colorMap: Record<string, string> = {};
      uniqueEras.forEach((era, idx) => {
        colorMap[era] = COLOR_PALETTE[idx % COLOR_PALETTE.length];
      });
      setEraColors(colorMap);

    } catch (err: any) {
      setError(err.message || 'Failed to parse timeline builder data.');
    }
  }, [dataString]);

  if (error) {
    return (
      <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-300 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-rose-400" size={18} />
          <h3 className="font-bold font-display">Timeline Builder Parse Error</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-lg overflow-x-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 font-mono text-xs">
        <RefreshCw className="animate-spin mx-auto mb-2 text-indigo-400" size={20} />
        Structuring historical chronicles...
      </div>
    );
  }

  const getEraColorClass = (era: string) => {
    return eraColors[era] || 'bg-slate-400 border-slate-300 text-slate-400';
  };

  return (
    <div className="space-y-6" id="timeline-builder">
      {/* Top action bar */}
      <div className="flex items-center justify-between bg-slate-950/60 border border-slate-900 px-5 py-4 rounded-2xl flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg text-xs font-bold font-mono">
            Chronology Maps
          </span>
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays size={14} className="text-pink-400" />
            <span>Timeline Builder</span>
          </h3>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setViewMode('scroll'); setSelectedEntryIdx(null); }}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'scroll' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns size={12} />
            <span>Horizontal Scroll</span>
          </button>
          <button
            onClick={() => { setViewMode('list'); setSelectedEntryIdx(null); }}
            className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
              viewMode === 'list' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={12} />
            <span>Vertical List</span>
          </button>
        </div>
      </div>

      {/* Era Legend */}
      <div className="bg-slate-950/30 border border-slate-900/60 p-4 rounded-xl flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
          Era Legend:
        </span>
        {Object.entries(eraColors).map(([era, colorClass]) => {
          const cls = colorClass as string;
          return (
            <span
              key={era}
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${cls.split(' ')[2]} ${cls.split(' ')[1]} bg-slate-900/40`}
            >
              {era}
            </span>
          );
        })}
      </div>

      {/* Main View Display with AnimatePresence */}
      <AnimatePresence mode="wait">
        {viewMode === 'scroll' ? (
          /* Horizontal Scroll view */
          <motion.div
            key="scroll-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="overflow-x-auto py-8 px-4 bg-slate-950/80 border border-slate-900 rounded-3xl flex flex-row items-start gap-0 select-none custom-scrollbar min-h-[300px]"
          >
            {data.entries.map((entry, idx) => {
              const colorParts = getEraColorClass(entry.era).split(' ');
              const dotColor = colorParts[0];
              const borderCol = colorParts[1];
              const isSelected = selectedEntryIdx === idx;

              return (
                <div 
                  key={idx} 
                  className="flex flex-col relative shrink-0 w-64 items-stretch group"
                >
                  {/* Stem & timeline horizontal guide line connection */}
                  <div className="h-0.5 bg-slate-800 absolute top-[35px] left-0 right-0 -z-10 group-first:left-1/2 group-last:right-1/2" />

                  {/* Date above */}
                  <div className="text-center h-8 flex items-end justify-center mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide">
                      {entry.date}
                    </span>
                  </div>

                  {/* Interactive Dot & Connector stem */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setSelectedEntryIdx(isSelected ? null : idx)}
                      className={`w-6 h-6 rounded-full border-4 ${dotColor} ${borderCol} cursor-pointer transition-all hover:scale-125 z-10 flex items-center justify-center`}
                      title="Click to view details"
                    />
                    <div className="w-0.5 h-10 bg-slate-800" />
                  </div>

                  {/* Title card below */}
                  <div 
                    onClick={() => setSelectedEntryIdx(isSelected ? null : idx)}
                    className={`mt-2 mx-3 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 border-pink-500/40' 
                        : 'bg-slate-950 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-slate-100 font-display line-clamp-2 leading-relaxed">
                      {entry.event}
                    </h4>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-1 block">
                      {entry.era}
                    </span>
                  </div>

                  {/* Details inline popup panel inside scroll view */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-[180px] left-3 right-3 bg-slate-900 border border-slate-800 p-4 rounded-xl z-20 space-y-2.5 shadow-2xl overflow-y-auto max-h-56"
                      >
                        <div>
                          <span className="text-[8px] font-mono text-pink-400 uppercase tracking-widest block font-bold">Historical Significance</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{entry.significance}</p>
                        </div>
                        {entry.people && (
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">People Involved</span>
                            <p className="text-[11px] text-slate-400 font-sans">{entry.people}</p>
                          </div>
                        )}
                        {entry.causeEffect && (
                          <div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Causality & Links</span>
                            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">{entry.causeEffect}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </motion.div>
        ) : (
          /* Vertical list view */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {data.entries.map((entry, idx) => {
              const colorParts = getEraColorClass(entry.era).split(' ');
              const dotColor = colorParts[0];
              const borderCol = colorParts[1];
              const isSelected = selectedEntryIdx === idx;

              return (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isSelected
                      ? 'border-pink-500/30 bg-slate-950/70 shadow-lg shadow-pink-950/5'
                      : 'border-slate-800/80 bg-slate-950/50 hover:border-slate-800'
                  }`}
                >
                  <div
                    onClick={() => setSelectedEntryIdx(isSelected ? null : idx)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Timeline dot style left banner */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${dotColor} ${borderCol}`} />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-mono font-bold text-pink-400">
                          {entry.date}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 font-display truncate">
                          {entry.event}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[9px] uppercase tracking-wider hidden sm:inline">
                        {entry.era}
                      </span>
                      <div className="text-slate-500">
                        {isSelected ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 pt-1 border-t border-slate-900 bg-slate-950/20 space-y-3 text-xs"
                      >
                        <div>
                          <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest font-bold block mb-1">Historical Significance</span>
                          <p className="text-slate-300 leading-relaxed font-sans">{entry.significance}</p>
                        </div>
                        {entry.people && (
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-0.5">People Involved</span>
                            <p className="text-slate-400 font-sans">{entry.people}</p>
                          </div>
                        )}
                        {entry.causeEffect && (
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-0.5">Causality & Links</span>
                            <p className="text-slate-400 font-mono leading-relaxed">{entry.causeEffect}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
