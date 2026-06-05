import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Moon, Settings, X, ChevronRight } from 'lucide-react';

const DANGEROUS_WARNINGS = [
  "Neurodegeneration active. You are trading cognitive IQ points for pixels.",
  "Your ambition is a lie. If you cannot control your thumb, you cannot control your life.",
  "Tomorrow's potential is bleeding out. You will be a ghost in your own meetings.",
  "The competition is sleeping. They will outpace you while you suffer from sleep inertia.",
  "Permanent Dopamine Baseline Shift detected. Life will feel dull tomorrow because of tonight.",
  "You are burning your future self's health to keep your present self bored.",
  "Every minute now is 10 minutes of brain fog tomorrow. The math is against you.",
  "Your resilience is eroding. This is how mediocrity becomes permanent."
];

export default function App() {
  const [curfew, setCurfew] = useState<string>(() => {
    return localStorage.getItem('nightwatch_curfew') || '22:30';
  });
  const [isActive, setIsActive] = useState<boolean>(() => {
    return localStorage.getItem('nightwatch_active') === 'true';
  });
  const [violations, setViolations] = useState<number>(() => {
    return Number(localStorage.getItem('nightwatch_violations')) || 0;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [isEnforcing, setIsEnforcing] = useState(false);
  const [isTemporarilyDismissed, setIsTemporarilyDismissed] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [currentWarning, setCurrentWarning] = useState(DANGEROUS_WARNINGS[0]);
  const [showGoodnight, setShowGoodnight] = useState(false);

  const checkCurfew = useCallback(() => {
    if (!isActive) return false;
    const [curfewH, curfewM] = curfew.split(':').map(Number);
    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const curfewInMinutes = curfewH * 60 + curfewM;
    const nowInMinutes = nowH * 60 + nowM;
    const morningEnd = 5 * 60;
    let enforcing = false;
    if (curfewInMinutes > morningEnd) {
      enforcing = nowInMinutes >= curfewInMinutes || nowInMinutes < morningEnd;
    } else {
      enforcing = nowInMinutes >= curfewInMinutes && nowInMinutes < morningEnd;
    }
    return enforcing && !isTemporarilyDismissed && !emergencyMode;
  }, [curfew, isActive, currentTime, isTemporarilyDismissed, emergencyMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsEnforcing(checkCurfew());
  }, [currentTime, checkCurfew]);

  useEffect(() => {
    localStorage.setItem('nightwatch_curfew', curfew);
    localStorage.setItem('nightwatch_active', String(isActive));
    localStorage.setItem('nightwatch_violations', String(violations));
  }, [curfew, isActive, violations]);

  useEffect(() => {
    if (isTemporarilyDismissed) {
      const timeout = setTimeout(() => setIsTemporarilyDismissed(false), 15000);
      return () => clearTimeout(timeout);
    }
  }, [isTemporarilyDismissed]);

  useEffect(() => {
    if (emergencyMode) {
      const timeout = setTimeout(() => setEmergencyMode(false), 30000);
      return () => clearTimeout(timeout);
    }
  }, [emergencyMode]);

  useEffect(() => {
    if (isEnforcing) {
      const idx = Math.floor(Math.random() * DANGEROUS_WARNINGS.length);
      setCurrentWarning(DANGEROUS_WARNINGS[idx]);
    }
  }, [isEnforcing]);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  const reportDismissal = (isEmergency = false) => {
    if (!isEmergency) setViolations((v) => v + 1);
    setIsTemporarilyDismissed(true);
    if (isEmergency) setEmergencyMode(true);
  };

  return (
    <div className="min-h-screen bg-[#18181b] text-[#e4e4e7] font-sans selection:bg-red-900/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#27272a]/40 to-transparent opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-900/40 to-transparent opacity-30 pointer-events-none"></div>

      <main className="relative z-10 max-w-4xl mx-auto px-8 py-16 min-h-screen flex flex-col">
        <header className="flex justify-between items-start mb-24">
          <div>
            <h1 className="text-3xl font-serif tracking-[0.2em] uppercase text-[#d4d4d8]">NightWatch</h1>
            <p className="text-[10px] tracking-[0.4em] uppercase mt-2 text-[#a1a1aa]">Systemic sleep enforcement</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-[10px] tracking-widest text-[#71717a] uppercase mb-1">Status</div>
              <div className="flex items-center justify-end gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-[#3f3f46]'}`}></span>
                <span className="text-xs font-medium tracking-tight uppercase text-[#d4d4d8]">{isActive ? 'Armed' : 'Standby'}</span>
              </div>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2.5 hover:bg-white/5 border border-white/10 rounded-full transition-colors bg-[#27272a]/50">
              <Settings className="w-4 h-4 text-[#a1a1aa]" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {emergencyMode && (
              <motion.div key="emergency-active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-8 px-6 py-2 border border-blue-500/30 bg-blue-500/5 flex items-center gap-2 text-blue-300 font-medium uppercase tracking-[0.2em] text-[10px]">
                <ShieldAlert className="w-3 h-3 animate-pulse" />
                <span>Emergency Access active (30s remain)</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#a1a1aa] mb-6 block">Current Time</span>
            <div className="text-[140px] md:text-[180px] leading-none font-serif font-light text-white flex items-baseline justify-center tabular-nums drop-shadow-2xl">
              <span>{formattedTime.split(':')[0]}</span>
              <span className="text-4xl mx-4 text-red-500 font-sans font-bold">:</span>
              <span>{formattedTime.split(':')[1]}</span>
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2">Protocol</div>
              <div className="px-8 py-4 border border-[#3f3f46] bg-[#27272a]/40 text-xs uppercase tracking-widest text-[#d4d4d8]">Digital Denial</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#71717a] mb-2">Threshold</div>
              <div className="px-8 py-4 border border-[#3f3f46] bg-[#27272a]/40 text-xs uppercase tracking-widest text-white font-mono">{curfew}</div>
            </div>
          </div>
        </div>

        <footer className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end z-10 border-t border-[#27272a] pt-12 mt-24">
          <div className="space-y-5">
            <div className="text-[10px] uppercase tracking-widest text-[#a1a1aa]">Active Sessions</div>
            <ul className="text-xs space-y-3 font-light">
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span className="text-[#a1a1aa]">Override Count</span>
                <span className="text-red-400 font-mono font-bold">{violations}</span>
              </li>
              <li className="flex justify-between border-b border-[#27272a] pb-2">
                <span className="text-[#a1a1aa]">System Integrity</span>
                <span className="text-emerald-500/80 uppercase tracking-tighter text-[10px]">Active</span>
              </li>
            </ul>
          </div>
          <div className="text-center hidden md:block">
            <div className="inline-block p-6 border border-red-500/10 bg-red-500/5 rounded-full">
              <div className="w-12 h-12 flex items-center justify-center border-2 border-red-500 rounded-full text-red-500 text-xl font-serif italic animate-pulse">!</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-4 italic">Physiological Warning</div>
            <p className="text-lg font-serif italic leading-snug text-[#d4d4d8]">"The blue light you consume now is the cognitive clarity you lose forever."</p>
          </div>
        </footer>

        <AnimatePresence>
          {showSettings && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
              <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#1c1c1f] border-l border-[#27272a] p-8 z-50 shadow-2xl flex flex-col">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-serif tracking-widest uppercase text-[#fafafa]">Registry</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/5 border border-white/10 rounded-full text-[#a1a1aa]"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-12">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-[#71717a]">Protocol Curfew</label>
                    <input type="time" value={curfew} onChange={(e) => setCurfew(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] p-5 text-3xl font-serif text-white focus:border-red-500 outline-none transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 border border-[#3f3f46] bg-[#27272a]/20 rounded-lg">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-widest text-[#d4d4d8]">Armed State</span>
                        <span className="block text-[10px] text-[#71717a] mt-1">Enable systemic enforcement</span>
                      </div>
                      <button onClick={() => setIsActive(!isActive)} className={`w-12 h-6 rounded-full transition-colors relative border ${isActive ? 'bg-red-900/30 border-red-500/50' : 'bg-[#3f3f46] border-[#52525b]'}`}>
                        <motion.div animate={{ x: isActive ? 26 : 4 }} className={`absolute top-1 left-0 w-3 h-3 rounded-full ${isActive ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-[#a1a1aa]'}`} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-8 border-t border-[#27272a]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#52525b] text-center">Biometric Session Verified</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isEnforcing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#18181b]/95 backdrop-blur-xl flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40 animate-pulse" style={{background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)'}}></div>
            <motion.div initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl w-full text-center relative z-10">
              <div className="mb-12">
                <div className="inline-block px-5 py-2 border border-red-500/30 bg-red-500/5 text-red-500 text-[10px] uppercase tracking-[0.4em] mb-10 font-bold italic rounded-sm">Critical Violation Detected</div>
                <h2 className="text-6xl md:text-8xl font-serif font-light tracking-tighter text-white leading-none mb-6">Absolute <br /><span className="text-red-500 italic opacity-90">Denial</span></h2>
                <div className="h-0.5 w-32 bg-red-600 mx-auto mb-10"></div>
                <p className="text-red-400/90 text-xl font-serif italic max-w-lg mx-auto leading-relaxed animate-pulse">"{currentWarning}"</p>
                <div className="mt-8 text-[#a1a1aa] text-[10px] uppercase tracking-widest font-mono p-3 border border-white/5 inline-block">
                  Override Count: <span className="text-white font-bold">{violations > 10 ? 'CRITICAL' : violations > 5 ? 'SEVERE' : 'MODERATE'}</span> | {violations} Violations
                </div>
              </div>
              <div className="space-y-6 max-w-md mx-auto">
                <button onClick={() => setShowGoodnight(true)} className="w-full bg-white text-black font-extrabold py-7 uppercase tracking-[0.2em] text-xs border border-white hover:bg-transparent hover:text-white transition-all flex items-center justify-center gap-3 group shadow-[0_0_60px_rgba(255,255,255,0.15)]">
                  SAVE MY FUTURE (CLOSE NOW)
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
                <div className="grid grid-cols-2 gap-5">
                  <button onClick={() => reportDismissal(true)} className="border border-[#3f3f46] bg-[#27272a]/60 text-[#d4d4d8] py-4 uppercase tracking-[0.3em] text-[10px] font-semibold hover:bg-[#3f3f46] transition-colors">Emergency</button>
                  <button onClick={() => reportDismissal(false)} className="border border-red-500/40 bg-red-500/10 text-red-100 py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-red-600 transition-colors">SELF-SABOTAGE</button>
                </div>
              </div>
              <div className="mt-16 text-[10px] uppercase tracking-[0.3em] text-[#71717a] space-y-3">
                <p>System Intrusion Recurrence: 15 seconds</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoodnight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[200] bg-black flex items-center justify-center flex-col gap-6">
            <Moon className="w-16 h-16 text-blue-300 animate-pulse" />
            <h2 className="text-4xl font-serif text-white">Put the phone down.</h2>
            <p className="text-[#a1a1aa] tracking-widest uppercase text-xs">Good night.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-6 inset-x-0 text-center pointer-events-none z-0 opacity-20">
        <p className="text-[10px] font-mono tracking-[0.5em] uppercase text-[#71717a]">Curfew Management System v1.0.5</p>
      </footer>
    </div>
  );
}
