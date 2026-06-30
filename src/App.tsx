import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Bookmark, 
  HelpCircle, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  Trash2, 
  RefreshCw, 
  FolderOpen, 
  AlertCircle, 
  Compass, 
  Key, 
  Award, 
  GraduationCap, 
  Flame, 
  Search, 
  ExternalLink,
  Printer,
  User,
  Lock,
  LogOut,
  Brain,
  Zap,
  Network,
  Calculator,
  PenTool,
  ClipboardList,
  ScanSearch,
  MessageSquare,
  CalendarDays,
  Swords
} from 'lucide-react';
import { CramSession } from './types';
import { SAMPLE_CRAM_SESSIONS } from './data';
import StudyModeCrammer from './components/StudyModeCrammer';
import StudyModeFlashcards from './components/StudyModeFlashcards';
import StudyModeQuiz from './components/StudyModeQuiz';
import StudyModeSimplifier from './components/StudyModeSimplifier';
import StudyModeMnemonicForge from './components/StudyModeMnemonicForge';
import StudyModeSpeedReview from './components/StudyModeSpeedReview';
import StudyModeConceptMap from './components/StudyModeConceptMap';
import StudyModeFormulaExtractor from './components/StudyModeFormulaExtractor';
import StudyModeEssayPredictor from './components/StudyModeEssayPredictor';
import StudyModePaperSimulator from './components/StudyModePaperSimulator';
import StudyModeGapFinder from './components/StudyModeGapFinder';
import StudyModeSocraticTutor from './components/StudyModeSocraticTutor';
import StudyModeTimeline from './components/StudyModeTimeline';
import StudyModeDebateSparring from './components/StudyModeDebateSparring';
import TopicChat from './components/TopicChat';
import CrammingLoader from './components/CrammingLoader';
import { exportSessionToPrintableHTML } from './utils/exportHelper';

const PRESETS = [
  { id: 'crammer', label: 'Stellar Cheat Sheet', description: 'Core topics, formulas, exam predictions, and memory tricks.', icon: BookOpen, color: 'border-violet-500/20 text-violet-400 bg-violet-500/5' },
  { id: 'flashcards', label: 'Active Recall Deck', description: 'Interactive flashcards with smart study clues to self-test.', icon: Bookmark, color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5' },
  { id: 'quiz', label: 'Practice Quiz', description: 'Simulated practice questions with instant tutor grading.', icon: HelpCircle, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
  { id: 'simplifier', label: 'Feynman Simplifier', description: 'Converts heavy jargon into plain everyday analogies.', icon: Sparkles, color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
  { id: 'mnemonicForge', label: 'Mnemonic Forge', icon: Brain, color: 'border-purple-500/20 text-purple-400 bg-purple-500/5', description: 'Acronyms, rhymes, memory palace rooms and visual story hooks.' },
  { id: 'speedReview', label: 'Speed Review', icon: Zap, color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5', description: '30-min panic mode: one-liners + the single most critical fact each.' },
  { id: 'conceptMap', label: 'Concept Map', icon: Network, color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5', description: 'Interactive node-link diagram of every topic and how they connect.' },
  { id: 'formulaExtractor', label: 'Formula Extractor', icon: Calculator, color: 'border-green-500/20 text-green-400 bg-green-500/5', description: 'Every equation with variables, worked examples and exam traps.' },
  { id: 'essayPredictor', label: 'Essay Predictor', icon: PenTool, color: 'border-rose-500/20 text-rose-400 bg-rose-500/5', description: '5 likely long-answer questions with model skeletons and marking criteria.' },
  { id: 'paperSimulator', label: 'Past Paper Simulator', icon: ClipboardList, color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5', description: 'Full simulated exam paper in Easy / Medium / Hard tiers.' },
  { id: 'gapFinder', label: 'Topic Gap Finder', icon: ScanSearch, color: 'border-orange-500/20 text-orange-400 bg-orange-500/5', description: 'Pinpoints your likely weak spots with 3-step micro-study fixes.' },
  { id: 'socraticTutor', label: 'Socratic Tutor', icon: MessageSquare, color: 'border-teal-500/20 text-teal-400 bg-teal-500/5', description: 'Generates Socratic questions then live chat with your AI tutor.' },
  { id: 'timelineBuilder', label: 'Timeline Builder', icon: CalendarDays, color: 'border-pink-500/20 text-pink-400 bg-pink-500/5', description: 'Visual chronological map of every event, discovery and milestone.' },
  { id: 'debateSparring', label: 'Debate Sparring', icon: Swords, color: 'border-slate-500/20 text-slate-400 bg-slate-500/5', description: 'AI argues the opposite side forces you to defend your knowledge.' }
];

export default function App() {
  // Persistence state
  const [sessions, setSessions] = useState<CramSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  
  // UI Configuration state
  const [presetId, setPresetId] = useState<string>('crammer');
  const [subject, setSubject] = useState<string>('');
  const [apiKeyOverride, setApiKeyOverride] = useState<string>('');
  const [showKeyPanel, setShowKeyPanel] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [hasServerApiKey, setHasServerApiKey] = useState<boolean>(false);
  const [depthLevel, setDepthLevel] = useState<'standard' | 'thorough' | 'mega'>('thorough');
  const [activeMainTab, setActiveMainTab] = useState<'study' | 'history'>('study');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState<boolean>(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  // Active upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Immersive 3D book intro sequence states
  const [introState, setIntroState] = useState<'idle' | 'opening' | 'entering' | 'dismissed'>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('crammer_intro_shown');
      return saved === 'true' ? 'dismissed' : 'idle';
    }
    return 'idle';
  });

  const startBookSequence = () => {
    if (introState !== 'idle') return;
    
    // Start unfolding the book cover
    setIntroState('opening');
    
    // Scale up and zoom through the pages
    setTimeout(() => {
      setIntroState('entering');
      
      // Fully unlock and show the main app layout
      setTimeout(() => {
        setIntroState('dismissed');
        sessionStorage.setItem('crammer_intro_shown', 'true');
      }, 1200);
    }, 1500);
  };

  // Authentication states
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_exam_crammer_user');
    }
    return null;
  });
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authIsRegistering, setAuthIsRegistering] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Helper function to load user's private sessions from backend
  const fetchUserSessions = async (user: string) => {
    try {
      const response = await fetch('/api/sessions', {
        headers: {
          'x-user-id': user,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.sessions && data.sessions.length > 0) {
          setSessions(data.sessions);
          setActiveSessionId(data.sessions[0].id);
        } else {
          // New user! Seed their account with the sample Astrophysics guides
          setSessions(SAMPLE_CRAM_SESSIONS);
          setActiveSessionId(SAMPLE_CRAM_SESSIONS[0].id);
          
          // Save them to server side under their user account
          for (const s of SAMPLE_CRAM_SESSIONS) {
            await fetch('/api/sessions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': user,
              },
              body: JSON.stringify({ session: s }),
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user-specific sessions from server:', err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Please fill out both fields.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const endpoint = authIsRegistering ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: authUsername.trim(),
          password: authPassword.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication gate failed.');
      }

      const loggedUser = data.username;
      localStorage.setItem('ai_exam_crammer_user', loggedUser);
      setCurrentUser(loggedUser);
      setAuthUsername('');
      setAuthPassword('');
      setAuthError('');
      
      // Load their sessions from the backend
      await fetchUserSessions(loggedUser);
    } catch (err: any) {
      console.error('Auth submit error:', err);
      setAuthError(err.message || 'Connection lost. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Initialize and load sessions from localStorage or server on mount
  useEffect(() => {
    // Check server key configuration
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasApiKey === 'boolean') {
          setHasServerApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.error('Failed to check server API key status:', err));

    if (currentUser) {
      fetchUserSessions(currentUser);
    } else {
      // Fallback local storage for guests/first visit
      const saved = localStorage.getItem('ai_exam_crammer_sessions');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) {
            setSessions(parsed);
            setActiveSessionId(parsed[0].id);
            return;
          }
        } catch (e) {
          console.error('Failed to load local sessions', e);
        }
      }
      setSessions(SAMPLE_CRAM_SESSIONS);
      setActiveSessionId(SAMPLE_CRAM_SESSIONS[0].id);
    }
  }, [currentUser]);

  // Save sessions to state and appropriate store
  const saveSessions = async (updated: CramSession[]) => {
    setSessions(updated);
    if (currentUser) {
      if (updated.length === 0) {
        // Clear all on server
        for (const s of sessions) {
          await fetch(`/api/sessions/${s.id}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': currentUser,
            },
          });
        }
      }
    } else {
      localStorage.setItem('ai_exam_crammer_sessions', JSON.stringify(updated));
    }
  };

  // Convert uploaded file to base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read binary PDF content.'));
      reader.readAsDataURL(file);
    });
  };

  // Core generation fetch action
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setError('Please upload a class notes or syllabus PDF file to start cramming.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLoadingStep('Converting course PDF to base64...');

    try {
      const base64Data = await readFileAsBase64(uploadedFile);
      setLoadingStep('Analyzing document with Gemini 3.5 Flash... (ETA 3-8s)');

      const response = await fetch('/api/cram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: base64Data,
          presetId,
          subject,
          customApiKey: apiKeyOverride.trim() || undefined,
          depth: depthLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'The Gemini server encountered an error parsing your document.');
      }

      const responseData = await response.json();
      setLoadingStep('Styling cram material layout...');

      // Synthesize a new session
      const newSession: CramSession = {
        id: `session-${Date.now()}`,
        title: `${subject ? `${subject}: ` : ''}${uploadedFile.name.replace('.pdf', '')} Guide`,
        createdAt: new Date().toLocaleString(),
        fileName: uploadedFile.name,
        fileSize: `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        presetId,
        cheatSheet: JSON.stringify(responseData.result),
      };

      const updated = [newSession, ...sessions];
      setSessions(updated);
      setActiveSessionId(newSession.id);
      setActiveMainTab('study');

      if (currentUser) {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser,
          },
          body: JSON.stringify({ session: newSession }),
        });
      } else {
        localStorage.setItem('ai_exam_crammer_sessions', JSON.stringify(updated));
      }

      setUploadedFile(null); // Reset upload
      setPresetId('crammer'); // Reset study format back to stellar cheat sheet
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during synthesis. Verify your API key or connection.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Delete a study session
  const handleDeleteSession = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (activeSessionId === id && updated.length > 0) {
      setActiveSessionId(updated[0].id);
    } else if (updated.length === 0) {
      setActiveSessionId('');
    }

    if (currentUser) {
      try {
        await fetch(`/api/sessions/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': currentUser,
          },
        });
      } catch (err) {
        console.error('Failed to delete session from server:', err);
      }
    } else {
      localStorage.setItem('ai_exam_crammer_sessions', JSON.stringify(updated));
    }
  };

  // Restore the pre-analyzed Astrophysics sample data
  const handleLoadDemo = async () => {
    setSessions(SAMPLE_CRAM_SESSIONS);
    setActiveSessionId(SAMPLE_CRAM_SESSIONS[0].id);
    setError('');
    setUploadedFile(null);

    if (currentUser) {
      try {
        for (const s of SAMPLE_CRAM_SESSIONS) {
          await fetch('/api/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': currentUser,
            },
            body: JSON.stringify({ session: s }),
          });
        }
      } catch (err) {
        console.error('Failed to seed demo sessions:', err);
      }
    } else {
      localStorage.setItem('ai_exam_crammer_sessions', JSON.stringify(SAMPLE_CRAM_SESSIONS));
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    const oldSessions = [...sessions];
    setSessions([]);
    setActiveSessionId('');

    if (currentUser) {
      try {
        for (const s of oldSessions) {
          await fetch(`/api/sessions/${s.id}`, {
            method: 'DELETE',
            headers: {
              'x-user-id': currentUser,
            },
          });
        }
      } catch (err) {
        console.error('Failed to clear sessions on server:', err);
      }
    } else {
      localStorage.setItem('ai_exam_crammer_sessions', JSON.stringify([]));
    }
  };

  // Export study material as a printable PDF-optimized HTML document
  const handlePrint = () => {
    if (!activeSession) return;
    const htmlContent = exportSessionToPrintableHTML(activeSession);
    if (!htmlContent) {
      alert('Could not export empty or corrupted study session data.');
      return;
    }
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Clean filename
    const safeTitle = activeSession.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    link.download = `${safeTitle}_Printable_StudyGuide.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Find active session
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  if (introState !== 'dismissed') {
    return (
      <div className="fixed inset-0 z-50 bg-[#040508] text-white flex flex-col items-center justify-between py-12 px-4 select-none overflow-hidden font-sans">
        {/* Background stars & glowing nebulae */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-[35vw] h-[35vw] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[20%] right-[15%] w-[35vw] h-[35vw] bg-rose-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-grid-animated" />
        </div>

        {/* Top Header info */}
        <div className="text-center space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Study Portal Initialized
          </div>
          <h2 className="text-sm font-bold font-mono text-slate-500 tracking-widest uppercase">
            Interactive AI Study Deck
          </h2>
        </div>

        {/* 3D BOOK PORT CONTAINER */}
        <div className="relative w-full max-w-md h-[400px] flex items-center justify-center perspective-1500 z-10">
          <div 
            className={`w-[260px] h-[360px] preserve-3d transition-all duration-1000 ${
              introState === 'idle' 
                ? 'animate-float-book' 
                : introState === 'opening'
                  ? 'rotate-0 scale-105'
                  : 'scale-[20] rotate-x-[45deg] rotate-y-[30deg] blur-md opacity-0 duration-1000 pointer-events-none'
            }`}
          >
            {/* BOOK spine block */}
            <div className="absolute left-0 top-0 w-[24px] h-[360px] bg-indigo-950 border border-indigo-800/40 rounded-l-md origin-left transform -rotate-y-90 translate-x-[12px] z-20 preserve-3d">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent" />
            </div>

            {/* FRONT COVER (hinges on the left side) */}
            <motion.div 
              animate={{ rotateY: introState === 'idle' ? 0 : -145 }}
              transition={{ type: "spring", stiffness: 45, damping: 15 }}
              className="absolute inset-0 rounded-r-2xl border border-indigo-500/20 shadow-2xl preserve-3d transform-origin-left z-30"
              style={{
                background: 'linear-gradient(135deg, #0d0f19 0%, #151829 100%)',
                boxShadow: 'inset 0 0 20px rgba(99, 102, 241, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Outer Front Cover design */}
              <div className="absolute inset-1 rounded-r-xl border border-slate-800 bg-slate-950/60 p-6 flex flex-col justify-between overflow-hidden backface-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.05),transparent_60%)]" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full" />
                
                <div className="w-full h-[1px] bg-gradient-to-r from-slate-800 via-indigo-500/30 to-slate-800" />

                <div className="space-y-4 my-auto relative">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-md shadow-indigo-950/50">
                    <GraduationCap size={24} className="animate-pulse" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-xl font-bold font-display text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                      AI EXAM
                    </h3>
                    <h4 className="text-2xl font-black font-display text-indigo-400 tracking-wider">
                      CRAMMER
                    </h4>
                  </div>
                  <p className="text-[10px] text-center text-slate-400 font-mono tracking-wide max-w-[180px] mx-auto">
                    FROM ZERO TO NIGHT-BEFORE READY
                  </p>
                </div>

                <div className="space-y-2 relative">
                  <div className="w-full h-[1px] bg-gradient-to-r from-slate-800 via-indigo-500/30 to-slate-800" />
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 tracking-widest">
                    <span>GENAI ENGINE v3.5</span>
                    <span>100% COMPLETE</span>
                  </div>
                </div>
              </div>

              {/* Inside of front cover (shows when flipped) */}
              <div className="absolute inset-0 rounded-r-xl bg-[#090a12] border border-slate-900 rotate-y-180 backface-hidden p-6 flex flex-col justify-between">
                <div className="text-[8px] font-mono text-indigo-400/60 leading-relaxed space-y-1.5">
                  <p className="border-b border-indigo-500/10 pb-1">AI_CRAM_SYSTEM_INITIALIZED</p>
                  <p>› BOOT_SEQUENCE: OK</p>
                  <p>› PARSING_ALGORITHMS: READY</p>
                  <p>› PERSISTENT_MEMORY: ACTIVE</p>
                  <p>› STUDY_FORMATS: 4 MODULES</p>
                </div>
                <div className="text-[8px] font-mono text-slate-500 text-right">
                  CRAMMER v3.5-FLASH
                </div>
              </div>
            </motion.div>

            {/* REAL INSIDE PAGES (Multiple stacks for realistic paper book thickness effect) */}
            <div className="absolute inset-y-1 right-1 left-2 bg-slate-900 border border-slate-800 rounded-r shadow-lg z-10" />
            <div className="absolute inset-y-2 right-2 left-3 bg-slate-950 border border-slate-900 rounded-r shadow-lg z-10" />

            {/* REVEALED INSIDE PAGE CONTENTS (visible when book opens) */}
            <div 
              className={`absolute inset-y-1.5 right-1.5 left-2.5 rounded-r bg-[#121320] border-y border-r border-indigo-500/10 p-5 flex flex-col justify-between z-20 transition-opacity duration-700 ${
                introState === 'idle' ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {/* Glowing portal overlay */}
              <div className="absolute inset-0 bg-radial-gradient-portal mix-blend-screen opacity-80 pointer-events-none" />

              {/* Page Content: Math formulas, notes, mock data schematic layout */}
              <div className="space-y-3 relative z-10 font-mono text-[7px] text-indigo-200/80">
                <div className="flex justify-between border-b border-indigo-500/10 pb-1 text-indigo-400 font-bold">
                  <span>CHAPTER 01: THE SINGULARITY</span>
                  <span>PAGE 42</span>
                </div>
                
                <div className="space-y-1.5 leading-relaxed">
                  <p className="text-rose-400 font-bold"># LAWS OF CRUNCH-TIME STUDY:</p>
                  <p>1. T-minus 12 hours: Condense extensive material into a Stellar Cheat Sheet.</p>
                  <p>2. Active Recall: Test your cognitive triggers using interactive Flashcards.</p>
                  <p>3. Feynman Simplifier: Demystify complex concepts into simple playground analogies.</p>
                </div>

                <div className="pt-2 border-t border-dashed border-indigo-500/10 space-y-2">
                  <p className="text-cyan-400 font-bold">// FORMULA REFERENCE</p>
                  <div className="bg-slate-950/70 p-2 rounded border border-indigo-500/20 text-[9px] text-center text-white font-bold tracking-wider">
                    E = mc² • ΔS ≥ 0 • HΨ = EΨ
                  </div>
                </div>
              </div>

              {/* Glowing light beam expanding out of the book page */}
              <div className={`absolute inset-0 bg-gradient-to-t from-indigo-500/0 via-indigo-400/20 to-white/40 blur-md pointer-events-none transition-transform duration-1000 ${
                introState === 'opening' ? 'scale-105 opacity-100' : 'scale-0 opacity-0'
              }`} />

              <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 relative z-10 border-t border-indigo-500/10 pt-1">
                <span>PRESET: CRAMMER_v3</span>
                <span>ENGAGE_PORTAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION - THE GLOWING START BUTTON */}
        <div className="flex flex-col items-center gap-4 z-10 w-full max-w-sm text-center mx-auto">
          <AnimatePresence mode="wait">
            {introState === 'idle' ? (
              <motion.div
                key="idle-controls"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col items-center space-y-4"
              >
                <button
                  onClick={startBookSequence}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-500 text-sm font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-xl shadow-indigo-950/60 border border-indigo-400/30 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center justify-center gap-2.5 mx-auto"
                >
                  <BookOpen size={18} className="animate-pulse" />
                  <span>Open Study Portal</span>
                </button>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Press to open your custom course material book and dive inside the AI synthesis.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="opening-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full space-y-2 h-[80px] flex flex-col justify-center items-center"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-300">
                    {introState === 'opening' ? 'Unfolding Quantum Book...' : 'Entering Book Core...'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Assembling cognitive study space...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SKIP LINK FOR SPEED */}
          <button
            onClick={() => {
              setIntroState('dismissed');
              sessionStorage.setItem('crammer_intro_shown', 'true');
            }}
            className="text-[10px] font-mono text-slate-600 hover:text-indigo-400 tracking-wider uppercase transition-colors pt-2 cursor-pointer mx-auto"
          >
            Skip Intro Animation
          </button>
        </div>
      </div>
    );
  }

  // Secure User Auth Gateway (Cognitive Study Portal Entrance)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#040508] text-white flex flex-col items-center justify-center p-4 relative font-sans overflow-hidden select-none">
        {/* Background stars & glowing nebulae */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-indigo-500/10 blur-[130px] rounded-full animate-pulse" />
          <div className="absolute bottom-[30%] right-[20%] w-[40vw] h-[40vw] bg-rose-500/10 blur-[130px] rounded-full" />
          <div className="absolute inset-0 bg-grid-animated" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative"
        >
          {/* Subtle top indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Gateway Authorized
            </span>
          </div>

          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-md">
              <Lock size={26} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 font-display">
                STUDY DECK PORTAL
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Enter your unique User ID and Password to isolate your study sessions and prevent any data clashes.
              </p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800/80 mb-6">
            <button
              onClick={() => {
                setAuthIsRegistering(false);
                setAuthError('');
              }}
              className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                !authIsRegistering
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthIsRegistering(true);
                setAuthError('');
              }}
              className={`py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                authIsRegistering
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: [-6, 6, -4, 4, -2, 2, 0], opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs text-center font-medium"
              >
                {authError}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                User ID / Username
              </label>
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
                className="relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Enter unique ID (e.g. alex2026)"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 text-white placeholder-slate-600 transition-all"
                />
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block">
                Security Password
              </label>
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.995 }}
                className="relative"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Key size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 text-white placeholder-slate-600 transition-all"
                />
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-xl border border-indigo-400/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Unlocking Study Portal...</span>
                </>
              ) : (
                <span>{authIsRegistering ? 'Register & Open Portal' : 'Unlock Portal'}</span>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-900/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>DATABASE: SECURE JSON</span>
            <span>SHIELD: SSL ACTIVE</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070b] text-gray-100 selection:bg-indigo-500 selection:text-white font-sans antialiased pb-12">
      
      {/* Background gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/5 blur-[150px] rounded-full" />
      </div>

      {/* Main Header / Top Bar */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl shadow-lg shadow-indigo-950/40 text-white flex items-center justify-center">
              <GraduationCap className="animate-pulse" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-indigo-200">
                  AI Exam Crammer
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-sans hidden sm:block">From Zero to Night-Before Ready — Secure Private Sessions</p>
            </div>
          </div>

          {/* Connection status, User Account info, and manual override panel */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="flex items-center gap-1.5 mr-2">
                <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-300">
                  <User size={13} className="text-indigo-400" />
                  {currentUser}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Logout safely"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            {(hasServerApiKey || apiKeyOverride.trim() !== '') ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-xs font-mono font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                API Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/5 border border-rose-500/15 text-xs font-mono font-bold text-rose-400" title="Please enter an API Key using the override panel or set GEMINI_API_KEY">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                API Disconnected
              </span>
            )}
            <button
              onClick={() => setShowKeyPanel(!showKeyPanel)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                showKeyPanel 
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20'
              }`}
              title="Custom API Key Override"
            >
              <Key size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Optional Custom API Key Slide-down panel */}
      <AnimatePresence>
        {showKeyPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-950 border-b border-slate-900 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto px-4 py-5 space-y-3">
              <h4 className="text-xs font-bold tracking-widest font-mono text-indigo-400 uppercase">
                Custom Gemini API Key Override (Optional)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                By default, this applet uses the system-injected pre-configured key securely. However, if you would like to run or demo it using your own custom key, paste it below.
              </p>
              <div className="flex gap-2 max-w-lg">
                <input
                  type="password"
                  value={apiKeyOverride}
                  onChange={(e) => setApiKeyOverride(e.target.value)}
                  placeholder="Paste your Gemini API Key here (AIzaSy...)"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3.5 py-2 text-sm text-gray-200 outline-none font-mono"
                />
                {apiKeyOverride && (
                  <button
                    onClick={() => setApiKeyOverride('')}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 hover:text-red-400 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Sidebars, Upload, Controls */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Main Upload Zone */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-5">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <UploadCloud size={18} className="text-indigo-400" />
              Generate Study Material
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Show prominent custom API key input if server key is missing */}
              {!hasServerApiKey && (
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Key size={14} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Gemini API Key Required</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    This app requires a Gemini API Key to process custom PDFs. Paste your key below to activate:
                  </p>
                  <input
                    type="password"
                    value={apiKeyOverride}
                    onChange={(e) => setApiKeyOverride(e.target.value)}
                    placeholder="Paste Gemini API Key here (AIzaSy...)"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs text-gray-200 outline-none font-mono"
                  />
                </div>
              )}

              {/* Optional Subject context input */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase mb-1.5">
                  Subject Context (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Astrophysics 101, AP Chemistry, Law"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-3.5 py-2.5 text-sm text-gray-200 outline-none font-sans transition-colors"
                />
              </div>

              {/* Output Detail Level option */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase mb-1 flex justify-between items-center">
                  <span>Output Detail Level</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                    depthLevel === 'mega' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : depthLevel === 'thorough' 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {depthLevel === 'mega' ? 'Hyper Book (Double Length)' : depthLevel === 'thorough' ? 'Deep Exhaustive' : 'Standard Focus'}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900/40 p-1 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setDepthLevel('standard')}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      depthLevel === 'standard'
                        ? 'bg-slate-800 text-gray-200 border border-slate-700/50 shadow'
                        : 'text-slate-400 hover:text-slate-200 bg-transparent border border-transparent'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepthLevel('thorough')}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      depthLevel === 'thorough'
                        ? 'bg-indigo-600 text-white shadow shadow-indigo-950/50'
                        : 'text-slate-400 hover:text-indigo-400 bg-transparent border border-transparent'
                    }`}
                  >
                    Exhaustive
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepthLevel('mega')}
                    className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      depthLevel === 'mega'
                        ? 'bg-rose-600 text-white shadow shadow-rose-950/50'
                        : 'text-slate-400 hover:text-rose-400 bg-transparent border border-transparent'
                    }`}
                  >
                    <Sparkles size={9} className={depthLevel === 'mega' ? "animate-pulse text-rose-200" : ""} />
                    Hyper Book
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-1 px-1">
                  {depthLevel === 'mega' 
                    ? "Generates an extremely detailed textbook-length study guide with twice the explanations, extensive side topics, deep derivations, and exhaustive examples."
                    : depthLevel === 'thorough'
                      ? "Generates multi-paragraph study guides, comprehensive examples, detailed explanations, and complete textbook context."
                      : "Generates high-density, concise bullet points optimal for rapid, last-minute cram sessions."
                  }
                </p>
              </div>

              {/* Study Presets */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase mb-1.5">
                  Select Study Format
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = presetId === preset.id;
                    return (
                      <motion.button
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        key={preset.id}
                        onClick={() => setPresetId(preset.id)}
                        className={`text-left p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-indigo-500/50 shadow-md shadow-indigo-950/20'
                            : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-900/30'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border ${preset.color} shrink-0`}>
                          <Icon size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-gray-200 font-display">{preset.label}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{preset.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const files = e.dataTransfer.files;
                  if (files && files[0] && (files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf'))) {
                    setUploadedFile(files[0]);
                    setError('');
                  } else {
                    setError('Only PDF course notes files are supported.');
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-500/5 animate-glow'
                    : uploadedFile
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/20'
                }`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      setUploadedFile(target.files[0]);
                      setError('');
                    }
                  };
                  input.click();
                }}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className={`p-3 rounded-full ${uploadedFile ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-400'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <AnimatePresence mode="wait">
                      {uploadedFile ? (
                        <motion.div
                          key="uploaded"
                          initial={{ opacity: 0, scale: 0.9, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-1"
                        >
                          <p className="text-xs font-semibold text-gray-200 max-w-[200px] truncate mx-auto">
                            {uploadedFile.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB • Click to replace
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-1"
                        >
                          <p className="text-xs font-semibold text-gray-300">
                            Drag & drop notes PDF, or click
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Course files or lecture slides up to 20MB
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  isLoading
                    ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed shadow-none'
                    : uploadedFile
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 hover:scale-[1.01] text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Cramming Material...
                  </>
                ) : (
                  <>
                    <Flame size={14} className="animate-pulse" />
                    Generate Cram Deck
                  </>
                )}
              </button>
            </form>

            {/* Premium Loading Experience */}
            <AnimatePresence>
              {isLoading && (
                <CrammingLoader loadingStep={loadingStep} />
              )}
            </AnimatePresence>

            {/* Error alerts */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: [-10, 2, -1, 0] }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-300 rounded-xl flex items-start gap-2.5"
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-rose-200 font-display">Generation Failed</h5>
                    <p className="text-[11px] leading-relaxed opacity-90">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Past Sessions Sidebar */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <FolderOpen size={16} className="text-slate-400" />
                Study Library
              </h3>
              {sessions.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {sessions.map((sess) => {
                    const isActive = sess.id === activeSessionId;
                    const formatDetails = PRESETS.find((p) => p.id === sess.presetId);
                    const FormatIcon = formatDetails?.icon || FileText;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        key={sess.id}
                        onClick={() => {
                          setActiveSessionId(sess.id);
                          setError('');
                          setUploadedFile(null);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-slate-900 border-indigo-500/30'
                            : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg border shrink-0 ${
                            isActive
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}>
                            <FormatIcon size={13} />
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                              {sess.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {sess.fileName}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteSession(sess.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 hover:text-red-400 transition-all text-slate-500 cursor-pointer"
                          title="Delete cram guide"
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-500">Your study library is empty.</p>
                <button
                  onClick={handleLoadDemo}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                >
                  Reload Astrophysics Demo Data
                </button>
              </div>
            )}
            
            {/* Quick backup button */}
            {sessions.length > 0 && sessions.length !== SAMPLE_CRAM_SESSIONS.length && (
              <div className="pt-2 border-t border-slate-900 flex justify-center">
                <button
                  onClick={handleLoadDemo}
                  className="text-[10px] font-mono text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Reset Library to Demo Sessions
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Displaying Generated content / Interactive Study Modes */}
        <section className="lg:col-span-8 flex flex-col">
          
          {/* Workspace Tabs Header */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-900 pb-3">
            <div className="flex gap-2 p-1 bg-slate-950/40 rounded-2xl border border-slate-900 relative">
              <button
                onClick={() => setActiveMainTab('study')}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 z-10 ${
                  activeMainTab === 'study' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeMainTab === 'study' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/30 rounded-xl -z-10 shadow shadow-indigo-950/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <BookOpen size={13} />
                <span>Study Lab</span>
              </button>
              <button
                onClick={() => setActiveMainTab('history')}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 z-10 ${
                  activeMainTab === 'history' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {activeMainTab === 'history' && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/30 rounded-xl -z-10 shadow shadow-indigo-950/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <FolderOpen size={13} />
                <span>Cram History</span>
                {sessions.length > 0 && (
                  <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold">
                    {sessions.length}
                  </span>
                )}
              </button>
            </div>
            {sessions.length > 0 && activeMainTab === 'history' && (
              <button
                onClick={() => setShowClearHistoryConfirm(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                Clear All History
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeMainTab === 'study' ? (
              <motion.div
                key="study-tab"
                initial={{ opacity: 0, scale: 0.98, x: 12 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -12 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-6"
              >
                {activeSession ? (
                  <div className="space-y-6">
                    {/* Active session top bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl px-5 py-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold tracking-widest text-indigo-400 font-mono uppercase">
                          Active Study Deck
                        </span>
                        <h2 className="text-lg font-bold text-white font-display">
                          {activeSession.title}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span>File: {activeSession.fileName}</span>
                          <span className="text-slate-700">•</span>
                          <span>Created: {activeSession.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-indigo-950/40 border border-indigo-500/10"
                          title="Export study deck as high-density printable PDF guide"
                        >
                          <Printer size={13} />
                          <span>Export PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic render block based on format preset of active session */}
                    <div className="bg-slate-950/30 border border-slate-900/60 rounded-2xl p-1 md:p-2 min-h-[400px]">
                      {activeSession.presetId === 'crammer' && (
                        <StudyModeCrammer dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'flashcards' && (
                        <StudyModeFlashcards dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'quiz' && (
                        <StudyModeQuiz dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'simplifier' && (
                        <StudyModeSimplifier dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'mnemonicForge' && (
                        <StudyModeMnemonicForge dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'speedReview' && (
                        <StudyModeSpeedReview dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'conceptMap' && (
                        <StudyModeConceptMap dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'formulaExtractor' && (
                        <StudyModeFormulaExtractor dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'essayPredictor' && (
                        <StudyModeEssayPredictor dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'paperSimulator' && (
                        <StudyModePaperSimulator dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'gapFinder' && (
                        <StudyModeGapFinder dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'socraticTutor' && (
                        <StudyModeSocraticTutor dataString={activeSession.cheatSheet} apiKeyOverride={apiKeyOverride} />
                      )}
                      {activeSession.presetId === 'timelineBuilder' && (
                        <StudyModeTimeline dataString={activeSession.cheatSheet} />
                      )}
                      {activeSession.presetId === 'debateSparring' && (
                        <StudyModeDebateSparring dataString={activeSession.cheatSheet} apiKeyOverride={apiKeyOverride} />
                      )}
                    </div>
                  </div>
                ) : (
                  /* EMPTY VIEW: Guide new users */
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-950/30 border border-dashed border-slate-900 rounded-3xl space-y-5">
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-full text-indigo-400 animate-pulse">
                      <Compass size={32} />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-lg font-bold text-white font-display">No Study Guides Active</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Start by dragging and dropping a course notes PDF in the left panel, or click <strong className="text-indigo-400">"Reload Astrophysics Demo Data"</strong> to play with fully pre-analyzed guides instantly!
                      </p>
                    </div>
                    <button
                      onClick={handleLoadDemo}
                      className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-xs font-bold uppercase tracking-wider text-white rounded-xl cursor-pointer"
                    >
                      Load Interactive Demos
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, scale: 0.98, x: 12 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -12 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-6"
              >
                {sessions.length > 0 ? (
                  <div className="space-y-6">
                    {/* Quick stats board */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl space-y-1 shadow-md">
                        <span className="text-[9px] font-bold tracking-wider text-slate-500 font-mono uppercase block">Total Decks</span>
                        <div className="text-lg font-black font-display text-white">{sessions.length} Decks</div>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl space-y-1 shadow-md">
                        <span className="text-[9px] font-bold tracking-wider text-slate-500 font-mono uppercase block">Logged Account</span>
                        <div className="text-lg font-black font-display text-indigo-400 truncate flex items-center gap-1">
                          <User size={13} />
                          <span className="truncate">{currentUser || "Local Guest"}</span>
                        </div>
                      </div>
                      <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-2xl col-span-2 sm:col-span-1 space-y-1 shadow-md">
                        <span className="text-[9px] font-bold tracking-wider text-slate-500 font-mono uppercase block">Vault Integrity</span>
                        <div className="text-lg font-black font-display text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Isolated DB
                        </div>
                      </div>
                    </div>

                    {/* Grid list of all sessions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessions.map((sess) => {
                        const formatDetails = PRESETS.find((p) => p.id === sess.presetId);
                        const FormatIcon = formatDetails?.icon || FileText;
                        const formatLabel = formatDetails?.label || "Study Guide";
                        const isSessActive = sess.id === activeSessionId;

                        return (
                          <div
                            key={sess.id}
                            className={`group relative bg-slate-950/80 border rounded-2xl p-5 hover:bg-slate-900/30 transition-all flex flex-col justify-between space-y-4 ${
                              isSessActive ? 'border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-lg' : 'border-slate-800'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                                  sess.presetId === 'crammer' ? 'bg-violet-500/10 text-violet-300 border border-violet-500/15' :
                                  sess.presetId === 'flashcards' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/15' :
                                  sess.presetId === 'quiz' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/15' :
                                  'bg-amber-500/10 text-amber-300 border border-amber-500/15'
                                }`}>
                                  {formatLabel}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">{sess.fileSize}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white font-display leading-snug line-clamp-2">
                                {sess.title}
                              </h4>
                              <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                                <p className="truncate">Source file: {sess.fileName}</p>
                                <p>Created: {sess.createdAt}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-900/80 gap-2">
                              <button
                                onClick={() => {
                                  setActiveSessionId(sess.id);
                                  setActiveMainTab('study');
                                  setError('');
                                  setUploadedFile(null);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isSessActive
                                    ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-300'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                }`}
                              >
                                <BookOpen size={12} />
                                {isSessActive ? 'Currently Active' : 'Load and Study'}
                              </button>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setActiveSessionId(sess.id);
                                    setTimeout(() => handlePrint(), 100);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20 transition-all cursor-pointer"
                                  title="Export Printable Study Guide"
                                >
                                  <Printer size={13} />
                                </button>
                                <button
                                  onClick={() => setSessionToDelete(sess.id)}
                                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
                                  title="Delete permanently"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-4 bg-slate-950/20 border border-dashed border-slate-900 rounded-3xl p-8">
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mx-auto border border-slate-800">
                      <FolderOpen size={28} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-bold text-white font-display">Your Study Library is Empty</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        You haven't generated any custom cram materials yet. Drop a PDF course notes or study file in the left panel to generate your first study deck!
                      </p>
                    </div>
                    <button
                      onClick={handleLoadDemo}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                    >
                      Load Astrophysics Demo Decks
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* Floating Topic Chat — only visible when a study session is active */}
      {activeSession && (
        <TopicChat
          cheatSheet={activeSession.cheatSheet}
          sessionTitle={activeSession.title}
          apiKeyOverride={apiKeyOverride}
        />
      )}

      {/* Footer credit */}
      <footer className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-600 mt-16 font-mono">
        Built with Google Gemini 3.5 Flash • Zero-Cold-Start Bundled CJS Architecture • Vibe2Ship Track 1
      </footer>

      {/* --- REUSABLE SECURITY & CONFIRMATION MODALS (Iframe-Compatible) --- */}
      <AnimatePresence>
        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[8px]" 
              onClick={() => setShowLogoutConfirm(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
                <LogOut size={20} className="animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white font-display uppercase tracking-wide">Secure Log Out</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to log out of your current study session? Your custom study guides will remain stored securely on the database.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:text-white hover:bg-slate-900/60 hover:border-slate-700 transition-all cursor-pointer text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('ai_exam_crammer_user');
                    setCurrentUser(null);
                    setSessions([]);
                    setActiveSessionId('');
                    setShowLogoutConfirm(false);
                  }}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-90 text-xs font-bold text-white transition-all cursor-pointer border border-indigo-500/10 shadow-lg shadow-indigo-950/40"
                >
                  Log Out Safely
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* CLEAR HISTORY CONFIRMATION MODAL */}
        {showClearHistoryConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[8px]" 
              onClick={() => setShowClearHistoryConfirm(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-md">
                <Trash2 size={20} className="animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white font-display uppercase tracking-wide">Clear Study Library</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently erase your entire cram study history? This action cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:text-white hover:bg-slate-900/60 hover:border-slate-700 transition-all cursor-pointer text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleClearHistory();
                    setShowClearHistoryConfirm(false);
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer border border-rose-500/10 shadow-lg"
                >
                  Clear Library
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DELETE SINGLE DECK CONFIRMATION MODAL */}
        {sessionToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[8px]" 
              onClick={() => setSessionToDelete(null)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-md">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white font-display uppercase tracking-wide">Delete Study Deck</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete this custom study deck? All summaries, cards, and quizzes will be deleted.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:text-white hover:bg-slate-900/60 hover:border-slate-700 transition-all cursor-pointer text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteSession(sessionToDelete);
                    setSessionToDelete(null);
                  }}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer border border-rose-500/10 shadow-lg"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
