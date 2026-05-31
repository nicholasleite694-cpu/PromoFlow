import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Music, Send, ShieldAlert, Radio, UserCheck, Layers, Mail, Lock } from 'lucide-react';
import WaveformAnimation from './WaveformAnimation.js';
import Logo from './Logo.js';

interface LandingViewProps {
  onSignIn: () => void;
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailSignUp: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

export default function LandingView({ onSignIn, onEmailSignIn, onEmailSignUp, isLoading }: LandingViewProps) {
  const [authMethod, setAuthMethod] = useState<'google' | 'credentials'>('google');
  const [credMode, setCredMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (credMode === 'signin') {
        await onEmailSignIn(email.trim(), password.trim());
      } else {
        await onEmailSignUp(email.trim(), password.trim());
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Authentication transaction failed. Please confirm constraints.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-neutral-950 text-stone-100 overflow-hidden" id="landing_view">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-zinc-900/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 space-y-12">
        {/* Header/Logo */}
        <div className="flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="w-36 h-22 md:w-48 md:h-28 text-white filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            <Logo className="text-white" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-3 bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800"
            id="brand_banner"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs tracking-widest text-neutral-400 font-medium uppercase">
              NOW IN PRIVATE BETA
            </span>
          </motion.div>
        </div>

        {/* Hero Title & Pitch */}
        <div className="space-y-6 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-medium tracking-tight text-white leading-none font-mono uppercase"
            id="main_headline"
          >
            PROMO <span className="text-zinc-500 font-light font-sans border-b border-zinc-800 pb-1">FLOW</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-neutral-400 text-sm md:text-base leading-relaxed tracking-normal font-light"
            id="sub_headline"
          >
            Sleek AI-assisted music demo outreach for serious producers. Directly compose and queue highly customized submission pitches using Gemini, and create raw drafts for actual reviewers, with 100% manual control.
          </motion.p>
        </div>

        {/* Visual Waveform Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-full max-w-md bg-stone-900/40 p-6 rounded-2xl border border-neutral-900 shadow-3xl text-left space-y-6 backdrop-blur-md"
          id="waveform_visual_card"
        >
          <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center border border-neutral-800">
                <Music className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                <h4 className="font-display font-medium text-xs text-white">PROXIMITY_DEMO_94.wav</h4>
                <p className="font-mono text-[9px] text-zinc-500 uppercase">Atmospheric Techno • Analog Moog</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-950 border border-neutral-900 font-mono text-[9px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ACTIVE WAVE
            </div>
          </div>

          <WaveformAnimation active={true} speed={1.1} heightClass="h-14" />

          <div className="grid grid-cols-3 gap-2 text-center pt-2">
            <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-900">
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Limit</p>
              <p className="font-display text-xs text-stone-200 mt-0.5">1 Pitch / Day</p>
            </div>
            <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-900">
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Conversion</p>
              <p className="font-display text-xs text-stone-200 mt-0.5">6x Reply %</p>
            </div>
            <div className="p-2.5 bg-neutral-950/60 rounded-xl border border-neutral-900">
              <p className="font-mono text-[9px] text-zinc-500 uppercase">Workspace</p>
              <p className="font-display text-xs text-stone-200 mt-0.5">Gmail Sync</p>
            </div>
          </div>
        </motion.div>

        {/* Authenticate Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center space-y-4 w-full max-w-md"
          id="cta_section"
        >
          {/* Method Selector Tabs */}
          <div className="flex bg-neutral-950/80 p-1 rounded-xl border border-neutral-900 shrink-0 w-full max-w-sm mb-2">
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${authMethod === 'google' ? 'bg-neutral-905 text-white border border-neutral-800' : 'text-zinc-500 hover:text-stone-300'}`}
            >
              Google Workspace
            </button>
            <button
              onClick={() => setAuthMethod('credentials')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${authMethod === 'credentials' ? 'bg-neutral-905 text-white border border-neutral-800' : 'text-zinc-500 hover:text-stone-300'}`}
            >
              Email & Password
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 px-8 py-3 rounded-xl bg-neutral-900 border border-neutral-800 w-full max-w-sm" id="loading_spinner">
              <div className="w-4 h-4 rounded-full border-2 border-zinc-200 border-t-zinc-800 animate-spin" />
              <span className="text-stone-300 text-xs font-mono uppercase">Syncing auth systems...</span>
            </div>
          ) : authMethod === 'google' ? (
            <button 
              onClick={onSignIn}
              className="gsi-material-button hover:shadow-emerald-950/20 hover:shadow-2xl transition w-full max-w-sm"
              id="google_signin_cta"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google Workspace</span>
              </div>
            </button>
          ) : (
            <form onSubmit={handleCredSubmit} className="w-full max-w-sm p-6 bg-stone-900/45 rounded-2xl border border-neutral-900 space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-950">
                 <h4 className="font-display font-medium text-[11px] text-zinc-300 uppercase tracking-widest">
                   {credMode === 'signin' ? 'Access Workspace' : 'Register New User'}
                 </h4>
                 <button
                   type="button"
                   onClick={() => {
                     setCredMode(credMode === 'signin' ? 'signup' : 'signin');
                     setErrorMessage(null);
                   }}
                   className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition"
                 >
                   {credMode === 'signin' ? 'Create Account' : 'Sign In instead'}
                 </button>
              </div>

              {errorMessage && (
                <div className="p-3 border border-rose-950 bg-rose-950/20 text-rose-400 font-mono text-[9px] uppercase rounded-xl leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. producer@sendingmachine.fm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-900 hover:border-zinc-850 focus:border-white rounded-xl text-xs text-neutral-200 outline-none placeholder-zinc-700 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Password</label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-900 hover:border-zinc-850 focus:border-white rounded-xl text-xs text-neutral-200 outline-none placeholder-zinc-700 transition"
                  />
                </div>
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full py-2.5 bg-neutral-100 hover:bg-white text-black font-display font-semibold transition text-xs rounded-xl tracking-wider uppercase disabled:opacity-50 mt-1 cursor-pointer"
              >
                {submitting ? 'Connecting...' : credMode === 'signin' ? 'Access Workspace' : 'Create & Register'}
              </button>
            </form>
          )}

          <div className="flex flex-col items-center space-y-1 pt-4 text-center">
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-zinc-400" /> Built for full sandbox workspace safety.
            </p>
            <p className="text-zinc-650 text-[9px] max-w-xs leading-normal">
              Direct draft syncing integrates with your standard personal email. All outreach drafts can also be manually read, copied, and dispatched at your convenience.
            </p>
          </div>
        </motion.div>

        {/* Features Split */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left border-t border-zinc-900 border-dashed w-full"
          id="features_bento"
        >
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-zinc-300 border border-neutral-800">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display font-medium text-xs text-white mb-1">Curation Intelligence</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Gemini matches your demo files, description prompts, bio details, and selected tone strictly with the custom target profile.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-zinc-300 border border-neutral-800">
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-display font-medium text-xs text-white mb-1">Direct Draft Mirroring</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Auto-generate and sync actual drafts into your raw Google Workspace Gmail app in real-time, preserving thread structures.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-900 flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-zinc-300 border border-neutral-800">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-medium text-xs text-white mb-1">Anti-Spam Guardrail</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Default limit of 1 active demo email outreach per day preserves your IP reputation and respects curators’ mental space.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="pt-8 text-center text-zinc-650 font-mono text-[9px]">
          MUSIC SENDING MACHINE INC. © 2026. PLATFORM DESIGN BY GOOGLE DEEPMIND ANTIGRAVITY AGENTS.
        </div>
      </div>
    </div>
  );
}
