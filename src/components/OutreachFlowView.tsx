import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Send, 
  FileText, 
  Music, 
  User, 
  AlertCircle, 
  Loader2, 
  MailCheck, 
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { Demo, Target, Outreach } from '../types.js';
import { validatePitchEmail } from '../utils/validation.js';
import WaveformAnimation from './WaveformAnimation.js';

interface OutreachFlowProps {
  demos: Demo[];
  targets: Target[];
  onCancel: () => void;
  onFinishFlow: (updatedOutreach: Outreach) => void;
}

export default function OutreachFlowView({
  demos,
  targets,
  onCancel,
  onFinishFlow,
}: OutreachFlowProps) {
  const [step, setStep] = useState(1); // Steps: 1 (Pick Target), 2 (Pick Track), 3 (AI Generating), 4 (Draft Review), 5 (Success Confirmation)
  
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  
  // AI generation state
  const [generatingMessageIdx, setGeneratingMessageIdx] = useState(0);
  const [generateError, setGenerateError] = useState<string | null>(null);
  
  // Loaded email state
  const [outreachResult, setOutreachResult] = useState<Outreach | null>(null);
  const [outreachStrategy, setOutreachStrategy] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');
  
  // Review execution states
  const [isSyncingDraft, setIsSyncingDraft] = useState(false);
  const [isSendingLive, setIsSendingLive] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transmissionSuccess, setTransmissionSuccess] = useState<'draft' | 'sent' | null>(null);

  // Clipboard copy feedback states
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subjectInput);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(bodyInput);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const loadingPhrases = [
    'Parsing curator profile constraints...',
    'Analyzing demo acoustic tags and bio notes...',
    'Formulating tactical message narrative...',
    'Synthesizing professional signature tone alignment...',
    'Drafting RFC 822 MIME transport envelope...'
  ];

  // Rotate loading phrases slowly
  useEffect(() => {
    let interval: any;
    if (step === 3) {
      interval = setInterval(() => {
        setGeneratingMessageIdx((prev) => (prev + 1) % loadingPhrases.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Execute Gemini Generation API
  const handleGenerateAI = async () => {
    if (!selectedTarget || !selectedDemo) return;
    setStep(3); // Enter Loading state
    setGenerateError(null);
    setGeneratingMessageIdx(0);
    
    try {
      // Set headers with user authorization and simulate ID
      const authHeader = `Bearer ${sessionStorage.getItem('gmailToken') || ''}`;
      const uid = sessionStorage.getItem('userId') || '';

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid,
        },
        body: JSON.stringify({
          demoId: selectedDemo.id,
          targetId: selectedTarget.id,
        })
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to trigger Gemini API generation');
      }

      const data = await res.json();
      setOutreachResult(data.outreach);
      setOutreachStrategy(data.strategy);
      setSubjectInput(data.outreach.emailSubject);
      setBodyInput(data.outreach.emailBody);
      
      setStep(4); // Advance to review screen
    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message || 'An error occurred while calling the AI model.');
      setStep(1); // Reset
    }
  };

  // Sync Draft to Gmail API
  const handleCreateDraft = async () => {
    if (!outreachResult) return;
    setIsSyncingDraft(true);
    setActionError(null);
    
    try {
      const gToken = sessionStorage.getItem('gmailToken');
      const uid = sessionStorage.getItem('userId') || '';
      if (!gToken) {
        throw new Error('No valid Google OAuth session. Please log in again.');
      }

      // First we must upload current customized Subject/Body back into local database
      const updatePayload: Outreach = {
        ...outreachResult,
        emailSubject: subjectInput.trim(),
        emailBody: bodyInput.trim()
      };

      // Call Draft creator
      const res = await fetch('/api/gmail/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid,
          'Authorization': `Bearer ${gToken}`
        },
        body: JSON.stringify({
          outreachId: outreachResult.id,
        })
      });

      if (!res.ok) {
        const dObj = await res.json();
        throw new Error(dObj.error || 'Gmail Draft creation rejected by server.');
      }

      const freshData = await res.json();
      setTransmissionSuccess('draft');
      setOutreachResult(freshData.outreach);
      setStep(5); // Go to success confirmation screen
    } catch (err: any) {
      console.error(err);
      setActionError(err.message);
    } finally {
      setIsSyncingDraft(false);
    }
  };

  // Send Direct via Gmail API
  const handleSendLiveEmail = async () => {
    if (!outreachResult) return;
    
    const emailToValidate = selectedTarget?.email || outreachResult.targetEmail || '';
    const valResult = validatePitchEmail(emailToValidate);

    if (!valResult.isValid) {
      alert("This contact email could not be verified. Please check the address or use another submission contact.");
      return;
    }

    if (valResult.isUnverifiedSample) {
      const confirmUnverified = window.confirm("This contact is marked as an unverified sample contact email. Do you manually confirm that you want to proceed and send this pitch anyway?");
      if (!confirmUnverified) return;
    }
    
    // Explicit manual confirm warning popup before executing live send
    const warn = window.confirm(`Send email pitch now to ${selectedTarget?.name || outreachResult.targetName} (${emailToValidate}) via your personal Google Workspace account?`);
    if (!warn) return;

    setIsSendingLive(true);
    setActionError(null);
    
    try {
      const gToken = sessionStorage.getItem('gmailToken');
      const uid = sessionStorage.getItem('userId') || '';
      if (!gToken) {
        throw new Error('Google Workspace session has expired. Logout and re-authenticate.');
      }

      // Ensure local server has the latest client adjustments from the textareas
      const updatePayload: Outreach = {
        ...outreachResult,
        emailSubject: subjectInput.trim(),
        emailBody: bodyInput.trim()
      };

      // Call live Send API
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid,
          'Authorization': `Bearer ${gToken}`
        },
        body: JSON.stringify({
          outreachId: outreachResult.id,
        })
      });

      if (!res.ok) {
        const dObj = await res.json();
        throw new Error(dObj.error || 'Live submission send rejected by email transport.');
      }

      const freshData = await res.json();
      setTransmissionSuccess('sent');
      setOutreachResult(freshData.outreach);
      setStep(5); // Advance to success confirmation screen
    } catch (err: any) {
      console.error(err);
      setActionError(err.message);
    } finally {
      setIsSendingLive(false);
    }
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-neutral-950/95 flex items-center justify-center p-3 md:p-6 z-50 overflow-y-auto" id="outreach_flow_overlay">
      
      {/* Container */}
      <div className="w-full max-w-2xl bg-stone-900 border border-neutral-900 rounded-2xl shadow-2xl relative my-auto flex flex-col justify-between overflow-hidden" id="flow_widget">
        
        {/* Header (Exclude on step 5) */}
        {step < 5 && (
          <div className="flex justify-between items-center p-5 border-b border-neutral-900 bg-stone-900/50">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest border border-neutral-800 px-2 py-0.5 rounded">
                Step {step === 3 ? 'AI' : `${step}`} of 4
              </span>
              <h3 className="font-display font-medium text-xs text-stone-200">Outreach Workspace Pipeline</h3>
            </div>
            
            <button
              onClick={onCancel}
              className="p-1 text-zinc-500 hover:text-white rounded border border-neutral-900 hover:border-zinc-805 transition"
              id="close_flow_btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dynamic Steps Render */}
        <div className="p-6 md:p-8 flex-1 min-h-[300px]" id="step_workspace_body">
          
          {/* STEP 1: SELECT Recipient Target */}
          {step === 1 && (
            <div className="space-y-6" id="step_1_box">
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="font-display font-medium text-base text-white">Target Selection</h4>
                <p className="text-zinc-400 text-xs font-light">Select the record label, Spotify playlist, or blogger contact to submit your demo.</p>
              </div>

              {generateError && (
                <div className="p-3 bg-rose-950/20 text-rose-400 border border-rose-900 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] uppercase leading-relaxed">{generateError}</p>
                </div>
              )}

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {targets.map((t) => {
                  const active = selectedTarget?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTarget(t)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                        active
                          ? 'bg-neutral-900/50 border-white text-white'
                          : 'bg-neutral-950/40 border-neutral-900 hover:border-zinc-850 text-neutral-400'
                      }`}
                      id={`target_btn_${t.id}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <User className={`w-3.5 h-3.5 ${active ? 'text-zinc-200' : 'text-zinc-500'}`} />
                          <h5 className={`font-display text-xs font-semibold ${active ? 'text-white' : 'text-zinc-300'}`}>{t.name}</h5>
                        </div>
                        <p className="font-mono text-[9px] text-zinc-500 uppercase mt-1">{t.type} • {t.email}</p>
                        {t.details && <p className="text-[10px] text-zinc-405 truncate mt-0.5">Context: "{t.details}"</p>}
                      </div>
                      
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-zinc-200 bg-white' : 'border-neutral-800'}`}>
                        {active && <Check className="w-3 h-3 text-black stroke-[3.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  disabled={!selectedTarget}
                  onClick={() => setStep(2)}
                  className={`py-2.5 px-5 rounded-lg font-display font-medium text-xs tracking-wider uppercase transition flex items-center gap-1 border ${
                    !selectedTarget
                      ? 'bg-neutral-800 text-neutral-500 border-neutral-900 cursor-not-allowed'
                      : 'bg-white text-black border-white hover:bg-zinc-200'
                  }`}
                  id="s1_next_btn"
                >
                  Confirm Target <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT Demo Track */}
          {step === 2 && (
            <div className="space-y-6" id="step_2_box">
              <div className="space-y-1.5 text-center md:text-left">
                <h4 className="font-display font-medium text-base text-white">Select Demo Sound Track</h4>
                <p className="text-zinc-400 text-xs font-light">Select which added track file details/streaming links are passed to Gemini for pitch optimization.</p>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {demos.map((d) => {
                  const active = selectedDemo?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDemo(d)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                        active
                          ? 'bg-neutral-900/50 border-white text-white'
                          : 'bg-neutral-950/40 border-neutral-900 hover:border-zinc-850 text-neutral-400'
                      }`}
                      id={`demo_btn_${d.id}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Music className={`w-3.5 h-3.5 ${active ? 'text-zinc-200' : 'text-zinc-500'}`} />
                          <h5 className={`font-display text-xs font-semibold ${active ? 'text-white' : 'text-zinc-300'}`}>{d.title}</h5>
                        </div>
                        <p className="font-mono text-[9px] text-zinc-500 uppercase mt-1">Genre: {d.genre}</p>
                        <p className="text-[10px] text-zinc-550 truncate mt-0.5">Acoustic: {d.description || 'Raw energetic demo'}</p>
                      </div>
                      
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-zinc-200 bg-white' : 'border-neutral-800'}`}>
                        {active && <Check className="w-3 h-3 text-black stroke-[3.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[10px] uppercase text-zinc-400 hover:text-white transition flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  disabled={!selectedDemo}
                  onClick={handleGenerateAI}
                  className={`py-2.5 px-5 rounded-lg font-display font-medium text-xs tracking-wider uppercase transition flex items-center gap-1 border ${
                    !selectedDemo
                      ? 'bg-neutral-800 text-neutral-500 border-neutral-900 cursor-not-allowed'
                      : 'bg-emerald-500 text-black border-emerald-500 hover:bg-emerald-400 font-semibold shadow-emerald-950/20 shadow-md'
                  }`}
                  id="s2_generate_btn"
                >
                  Compose Pitch with Gemini <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOADING GENERATING PIPELINE */}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center" id="step_3_box">
              <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center relative overflow-hidden">
                <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
              </div>
              
              <div className="space-y-2">
                <span className="font-mono text-[9px] tracking-widest text-emerald-400 uppercase font-medium animate-pulse">
                  ⚡ GEMINI PRO SUBMISSION STRATEGIST ACTIVE
                </span>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={generatingMessageIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.35 }}
                    className="text-white font-display text-sm font-medium"
                    id="loading_label"
                  >
                    {loadingPhrases[generatingMessageIdx]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-zinc-500 text-[10px] max-w-xs mx-auto">
                  Constructing tailored RFC 822 transport layout targeting {selectedTarget?.name}. This typically takes 3 to 5 seconds.
                </p>
              </div>

              <div className="w-full max-w-xs pt-4">
                <WaveformAnimation active={true} speed={0.8} heightClass="h-10" />
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW AND EDIT EDITABLE DRAFT */}
          {step === 4 && (
            <div className="space-y-5" id="step_4_box">
              <div className="space-y-1.5 text-center md:text-left pb-2 border-b border-neutral-900">
                <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-[9px] tracking-widest uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> GEMINI OUTREACH CO-PILOT
                </span>
                <h4 className="font-display font-medium text-base text-white">Review Generated Pitch Copy</h4>
                <p className="text-zinc-500 text-[10px] font-mono uppercase">
                  RECIPIENT: <span className="text-stone-300 font-normal">{selectedTarget?.name} ({selectedTarget?.email})</span>
                </p>
              </div>

              {actionError && (
                <div className="p-3 bg-rose-950/20 text-rose-400 border border-rose-950 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-mono text-[10px] uppercase leading-relaxed">{actionError}</p>
                </div>
              )}

              {/* Strategy Annotation */}
              <div className="p-3 bg-zinc-950 border border-neutral-900 rounded-xl space-y-1">
                <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Curator specific alignment strategy:</p>
                <p className="text-xs text-stone-200 font-sans italic leading-relaxed">"{outreachStrategy}"</p>
              </div>

              {/* Editable Subjects and Body */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center bg-transparent">
                    <label className="block text-[9px] text-zinc-500 font-mono uppercase">Email Subject Line</label>
                    <button
                      type="button"
                      onClick={handleCopySubject}
                      className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition focus:outline-none cursor-pointer"
                    >
                      {copiedSubject ? 'Copied! ✓' : 'Copy Subject'}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 focus:border-white rounded-lg text-xs text-white outline-none font-sans"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center bg-transparent">
                    <label className="block text-[9px] text-zinc-500 font-mono uppercase">Email Body Text</label>
                    <button
                      type="button"
                      onClick={handleCopyBody}
                      className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition focus:outline-none cursor-pointer"
                    >
                      {copiedBody ? 'Copied! ✓' : 'Copy Pitch Body'}
                    </button>
                  </div>
                  <textarea
                    rows={7}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-white rounded-xl text-xs text-neutral-200 outline-none font-sans resize-none leading-relaxed"
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                  />
                  <span className="block text-[9px] text-zinc-650 font-mono text-right uppercase">MANUAL CORRECTION OPTIONAL</span>
                </div>
              </div>

              {/* Choices with Anti-spam rules info */}
              <div className="pt-3 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <p className="text-[10px] text-zinc-500 leading-normal flex items-start gap-1 pb-2 sm:pb-0 max-w-xs font-mono uppercase">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" /> Verification: Draft requires no immediate sending. Mail directly populates your Gmail account.
                </p>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    disabled={isSyncingDraft || isSendingLive}
                    onClick={handleCreateDraft}
                    className={`flex-1 sm:flex-none py-2 px-3.5 border rounded-lg font-mono text-[10px] uppercase tracking-wider transition ${
                      isSyncingDraft
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-500 cursor-wait'
                        : 'bg-neutral-950 border-neutral-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                    }`}
                    id="flow_draft_btn"
                  >
                    {isSyncingDraft ? 'Syncing...' : 'Create Gmail Draft'}
                  </button>

                  <button
                    disabled={isSyncingDraft || isSendingLive}
                    onClick={handleSendLiveEmail}
                    className={`flex-1 sm:flex-none py-2 px-4 rounded-lg font-display font-medium text-[11px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 border border-white bg-white text-black hover:bg-zinc-200 ${
                      isSendingLive ? 'opacity-50 cursor-wait' : ''
                    }`}
                    id="flow_send_live_btn"
                  >
                    {isSendingLive ? 'Sending...' : 'Send via Gmail'} <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS TRANSMISSION CONFIRMATION */}
          {step === 5 && (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center" id="step_5_box">
              <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-800 flex items-center justify-center relative overflow-hidden text-emerald-400">
                <MailCheck className="w-7 h-7" />
              </div>
              
              <div className="space-y-2">
                <span className="font-mono text-[9px] tracking-widest text-emerald-400 uppercase font-medium">
                  SUBMISSION TRANSMISSION SUCCESSFUL
                </span>
                <h4 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight">
                  {transmissionSuccess === 'sent' ? 'Pitch Sent Directly' : 'Gmail Draft Created'}
                </h4>
                
                {transmissionSuccess === 'sent' ? (
                  <p className="text-zinc-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                    Splendid! Your pitch email has been dispatched via Gmail to <span className="text-white font-mono font-normal">{selectedTarget?.email}</span>. A copy is logged in your sent messages tree and the 1-pitch-per-day slot is registered.
                  </p>
                ) : (
                  <p className="text-zinc-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                    Success! A raw drafted message was pushed directly into your actual Google Workspace Gmail account. Open Google Gmail on your smartphone, review, and tap send at your absolute convenience!
                  </p>
                )}
              </div>

              <div className="w-full max-w-sm border-t border-neutral-900 pt-5 mt-4">
                <button
                  onClick={() => {
                    if (outreachResult) onFinishFlow(outreachResult);
                  }}
                  className="w-full py-3 bg-white text-gray-950 uppercase font-display font-semibold text-xs rounded-xl hover:bg-zinc-250 transition"
                  id="final_success_btn"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
