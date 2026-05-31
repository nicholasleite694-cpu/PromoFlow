import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Music, Target as TargetIcon, ArrowRight, ArrowLeft, Loader2, AlertCircle, Check, Mail, Copy, Plus } from 'lucide-react';
import { Demo, Target, Label, Outreach } from '../types.js';
import { validatePitchEmail } from '../utils/validation.js';
import WaveformAnimation from './WaveformAnimation.js';

export const getRecipientCategory = (r: { name: string; notes?: string; type?: string; dbType?: string }) => {
  const name = (r.name || '').toLowerCase();
  const desc = (`${r.notes || ''} ${r.type || ''}`).toLowerCase();

  // 1. Check explicit name markers in database contacts
  if (name.includes('artist promo') || name.includes('(artist promo)')) {
    return 'artist';
  }
  if (name.includes('club showcase') || name.includes('club promo') || name.includes('(club showcase)') || name.includes('(club promo)')) {
    return 'club';
  }

  // 2. Specific custom target type overrides mapped from user-created targets
  if (r.dbType === 'curator') return 'artist';
  if (r.dbType === 'blog' || r.dbType === 'playlist') return 'club';

  // 3. Fallback text matching criteria for fuzzy matching
  if (
    name.includes('club') ||
    name.includes('venue') ||
    name.includes('nightclub') ||
    name.includes('amnesia') ||
    name.includes('dc10') ||
    name.includes('dc-10') ||
    name.includes('pacha') ||
    name.includes('hï') ||
    name.includes('printworks') ||
    name.includes('fabric') ||
    name.includes('watergate') ||
    name.includes('space ibiza') ||
    desc.includes('club') ||
    desc.includes('venue') ||
    desc.includes('nightclub') ||
    desc.includes('promoter') ||
    desc.includes('dancing')
  ) {
    return 'club';
  }
  if (
    name.includes('mochakk') ||
    name.includes('bibi') ||
    name.includes('pawsa') ||
    name.includes('black coffee') ||
    name.includes('solomun') ||
    name.includes('jamie jones') ||
    name.includes('dixon') ||
    name.includes('rufus') ||
    name.includes('keinemusikcrue') ||
    name.includes('resident') ||
    desc.includes('artist') ||
    desc.includes('dj') ||
    desc.includes('producer') ||
    desc.includes('curator') ||
    desc.includes('curators') ||
    desc.includes('creator') ||
    desc.includes('host') ||
    desc.includes('vocalist') ||
    r.type === 'Custom Recipient' ||
    r.type === 'curator'
  ) {
    return 'artist';
  }

  // 4. Default database entry fallback
  if (r.dbType === 'label') return 'label';
  return 'label';
};

interface NewPitchViewProps {
  demos: Demo[];
  targets: Target[];
  labels: Label[];
  onAddDemo: (title: string, link: string, description: string, mood: string, genre: string) => Promise<void>;
  onAddTarget: (name: string, email: string, type: 'label' | 'playlist' | 'blog' | 'curator', details: string) => Promise<void>;
  onFinishFlow: () => void;
  userPlan: 'free_trial' | 'starter' | 'pro';
  preselectedLabel?: Label | null;
  clearPreselectedLabel?: () => void;
}

export default function NewPitchView({
  demos,
  targets,
  labels,
  onAddDemo,
  onAddTarget,
  onFinishFlow,
  userPlan,
  preselectedLabel,
  clearPreselectedLabel
}: NewPitchViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Track Details & Targets, 2: AI Generating, 3: Final Pitch Review
  
  // Track parameters
  const [useExistingTrack, setUseExistingTrack] = useState(true);
  const [selectedDemoId, setSelectedDemoId] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackLink, setNewTrackLink] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Tech House');
  const [newTrackDescription, setNewTrackDescription] = useState('');
  const [newTrackMood, setNewTrackMood] = useState('Atmospheric');

  // Target multi-selection and filters
  const [targetSearch, setTargetSearch] = useState('');
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [genreFilter, setGenreFilter] = useState('ALL');
  
  // Direct Quick custom target parameters
  const [showQuickCustomTarget, setShowQuickCustomTarget] = useState(false);
  const [customTargetName, setCustomTargetName] = useState('');
  const [customTargetEmail, setCustomTargetEmail] = useState('');
  const [isCreatingCustomTarget, setIsCreatingCustomTarget] = useState(false);
  const [createdEmails, setCreatedEmails] = useState<string[]>([]);

  // Recipient Category Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['label', 'artist', 'club']);
  const [customTargetCategory, setCustomTargetCategory] = useState<'label' | 'artist' | 'club'>('label');

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  // AI-generated pitches review state
  const [customizedPitches, setCustomizedPitches] = useState<Array<{
    id: string;
    subject: string;
    body: string;
    targetName: string;
    targetEmail: string;
    strategy: string;
    status: 'draft' | 'sent' | 'idle';
  }>>([]);
  const [activePitchIndex, setActivePitchIndex] = useState(0);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // AI edit states
  const [aiModifyInstruction, setAiModifyInstruction] = useState('');
  const [pitchLength, setPitchLength] = useState<'small' | 'medium' | 'larger'>('medium');
  const [isAltering, setIsAltering] = useState(false);
  const [alterError, setAlterError] = useState<string | null>(null);

  // Sync / Execution state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(0);
  const [generatingLabelName, setGeneratingLabelName] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [transmissionCompleted, setTransmissionCompleted] = useState<'draft' | 'sent' | null>(null);

  const GENRES = [
    'Afro House',
    'Minimal / Deep Tech',
    'Tech House',
    'House',
    'Deep House',
    'Melodic House',
    'Disco House',
    'Latin House',
    'Electronic / Other'
  ];

  const MOODS = ['Atmospheric', 'Driving & Groovy', 'Soulful & Deep', 'Uplifting', 'Dark & Heavy', 'Minimalistic'];

  // Targets combined list
  const combinedRecipients = [
    ...labels.map(l => ({ id: l.id, name: l.name, type: 'Premier Label', email: l.email, notes: l.notes, region: l.region, genre: l.genre, website: l.website, dbType: 'label' })),
    ...targets.map(t => ({ id: t.id, name: t.name, type: 'Custom Recipient', email: t.email, notes: t.details, region: 'Custom Recipient', genre: 'All Styles', website: '#', dbType: t.type }))
  ];

  const getCountryFromRegion = (reg: string) => {
    if (!reg) return '';
    const parts = reg.split(',');
    return parts.length > 0 ? parts[parts.length - 1].trim() : '';
  };

  // Dynamic filter lists
  const uniqueCountries = Array.from(new Set(labels.map(l => getCountryFromRegion(l.region)).filter(Boolean))).sort();
  const uniqueGenres = Array.from(new Set(labels.map(l => l.genre).filter(Boolean))).sort();

  // Match target details
  const getSelectedTargetDetails = () => {
    if (selectedTargetIds.length === 0) return null;
    const firstId = selectedTargetIds[0];
    if (firstId.startsWith('label_')) {
      const lbl = labels.find(l => l.id === firstId);
      if (lbl) return { name: lbl.name, contact: lbl.email, details: lbl.notes, isLabel: true };
    } else {
      const trg = targets.find(t => t.id === firstId);
      if (trg) return { name: trg.name, contact: trg.email, details: trg.details, isLabel: false };
    }
    return null;
  };

  // Handle pre-selected label from the bank
  useEffect(() => {
    if (preselectedLabel) {
      setSelectedTargetIds([preselectedLabel.id]);
      setTargetSearch('');
      if (clearPreselectedLabel) clearPreselectedLabel();
    }
  }, [preselectedLabel]);

  // Handle default selecting of existing demo
  useEffect(() => {
    if (demos.length > 0 && !selectedDemoId) {
      setSelectedDemoId(demos[0].id);
    }
  }, [demos]);

  // Auto-select newly created custom target
  useEffect(() => {
    if (createdEmails.length > 0) {
      const newlyAdded = targets.filter(t => createdEmails.includes(t.email));
      if (newlyAdded.length > 0) {
        setSelectedTargetIds(prev => {
          const next = [...prev];
          newlyAdded.forEach(t => {
            if (!next.includes(t.id)) {
              next.push(t.id);
            }
          });
          return next;
        });
        setCreatedEmails(prev => prev.filter(email => !newlyAdded.some(t => t.email === email)));
      }
    }
  }, [targets, createdEmails]);

  const handleGeneratePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    // 1. Resolve Demo/Track ID
    let finalDemoId = selectedDemoId;
    if (!useExistingTrack) {
      if (!newTrackTitle.trim() || !newTrackLink.trim()) {
        setErrorText('Please specify both your unreleased music title and a streaming review URL.');
        return;
      }
      try {
        setStep(2); // Generation loader page
        const uid = sessionStorage.getItem('userId') || '';
        const res = await fetch('/api/demos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': uid,
          },
          body: JSON.stringify({
            title: newTrackTitle.trim(),
            link: newTrackLink.trim(),
            description: newTrackDescription.trim(),
            mood: newTrackMood,
            genre: newTrackGenre
          })
        });
        if (!res.ok) throw new Error('Could not upload new demo track settings.');
        const savedDemo = await res.json();
        finalDemoId = savedDemo.id;
      } catch (err: any) {
        setErrorText(err.message || 'Failed saving tracks.');
        setStep(1);
        return;
      }
    }

    if (!finalDemoId) {
      setErrorText('Please choose or upload a track to pitch.');
      setStep(1);
      return;
    }

    if (selectedTargetIds.length === 0) {
      setErrorText('Please select at least one targeted music curator or record label to pitch.');
      setStep(1);
      return;
    }

    // Trigger sequential AI compilation to build tailored drafts
    setStep(2);
    try {
      const uid = sessionStorage.getItem('userId') || '';
      const generatedResults = [];
      
      for (let i = 0; i < selectedTargetIds.length; i++) {
        const targetId = selectedTargetIds[i];
        const targetObj = combinedRecipients.find(r => r.id === targetId);
        
        setGeneratingLabelName(targetObj ? targetObj.name : 'Target Recipient');
        setCurrentGeneratingIndex(i);
        
        const res = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': uid,
          },
          body: JSON.stringify({
            demoId: finalDemoId,
            targetId: targetId,
          })
        });

        if (!res.ok) {
          throw new Error(await res.text() || `Failed triggering Gemini content generation engine for ${targetObj?.name || 'target'}.`);
        }

        const val = await res.json();
        generatedResults.push({
          id: val.outreach.id,
          subject: val.outreach.emailSubject,
          body: val.outreach.emailBody,
          targetName: val.outreach.targetName || targetObj?.name || 'Target Recipient',
          targetEmail: val.outreach.targetEmail || targetObj?.email || '',
          strategy: val.strategy,
          status: 'idle' as 'draft' | 'sent' | 'idle'
        });
      }

      setCustomizedPitches(generatedResults);
      setActivePitchIndex(0);
      setTransmissionCompleted(null);
      setStep(3); // Review pitch screen
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'AI generation failed. Please verify API configuration or limits.');
      setStep(1);
    }
  };

  // Sync active pitch draft to Gmail
  const handleSyncActiveToGmail = async () => {
    const activePitch = customizedPitches[activePitchIndex];
    if (!activePitch) return;
    setIsSyncing(true);
    setErrorText(null);
    try {
      const token = sessionStorage.getItem('gmailToken');
      const uid = sessionStorage.getItem('userId') || '';
      const res = await fetch('/api/gmail/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': uid,
        },
        body: JSON.stringify({
          outreachId: activePitch.id,
          emailSubject: activePitch.subject,
          emailBody: activePitch.body
        })
      });

      if (!res.ok) {
        const txt = await res.json();
        throw new Error(txt.error || `Failed saving draft to Google accounts for ${activePitch.targetName}.`);
      }

      // Mark this active pitch as processed
      setCustomizedPitches(prev => prev.map((p, idx) => idx === activePitchIndex ? { ...p, status: 'draft' } : p));
      
      const nextPitches = customizedPitches.map((p, idx) => idx === activePitchIndex ? { ...p, status: 'draft' as const } : p);
      if (nextPitches.every(p => p.status !== 'idle')) {
        setTransmissionCompleted('draft');
      }
    } catch (err: any) {
      setErrorText(err.message || 'Draft sync unsuccessful.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Live direct submit for active pitch via Gmail
  const handleSendActiveLive = async () => {
    const activePitch = customizedPitches[activePitchIndex];
    if (!activePitch) return;

    const valResult = validatePitchEmail(activePitch.targetEmail);
    if (!valResult.isValid) {
      alert("This contact email could not be verified. Please check the address or use another submission contact.");
      return;
    }

    if (valResult.isUnverifiedSample) {
      const confirmUnverified = window.confirm("This contact is marked as an unverified sample contact email. Do you manually confirm that you want to proceed and send this pitch anyway?");
      if (!confirmUnverified) return;
    }
    
    const warn = window.confirm(`Transmit email pitch now to ${activePitch.targetName} (${activePitch.targetEmail}) via your Google account?`);
    if (!warn) return;

    setIsSending(true);
    setErrorText(null);
    try {
      const token = sessionStorage.getItem('gmailToken');
      const uid = sessionStorage.getItem('userId') || '';
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-user-id': uid,
        },
        body: JSON.stringify({
          outreachId: activePitch.id,
          emailSubject: activePitch.subject,
          emailBody: activePitch.body
        })
      });

      if (!res.ok) {
        const txt = await res.json();
        throw new Error(txt.error || `Direct send failed for ${activePitch.targetName}.`);
      }

      // Mark as sent
      setCustomizedPitches(prev => prev.map((p, idx) => idx === activePitchIndex ? { ...p, status: 'sent' } : p));
      
      const nextPitches = customizedPitches.map((p, idx) => idx === activePitchIndex ? { ...p, status: 'sent' as const } : p);
      if (nextPitches.every(p => p.status !== 'idle')) {
        setTransmissionCompleted('sent');
      }
    } catch (err: any) {
      setErrorText(err.message || 'Transmission failed. Verify session credentials.');
    } finally {
      setIsSending(false);
    }
  };

  // Bulk process all pending pitch drafts to Gmail
  const handleSyncAllToGmail = async () => {
    if (customizedPitches.length === 0) return;
    setIsSyncing(true);
    setErrorText(null);
    try {
      const token = sessionStorage.getItem('gmailToken');
      const uid = sessionStorage.getItem('userId') || '';
      
      for (let i = 0; i < customizedPitches.length; i++) {
        const pitch = customizedPitches[i];
        if (pitch.status !== 'idle') continue;
        
        const res = await fetch('/api/gmail/draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': uid,
          },
          body: JSON.stringify({
            outreachId: pitch.id,
            emailSubject: pitch.subject,
            emailBody: pitch.body
          })
        });

        if (!res.ok) {
          const txt = await res.json();
          throw new Error(txt.error || `Bulk draft creation failed for ${pitch.targetName}`);
        }
      }

      setCustomizedPitches(prev => prev.map(p => ({ ...p, status: 'draft' })));
      setTransmissionCompleted('draft');
    } catch (err: any) {
      setErrorText(err.message || 'Bulk draft synchronization unsuccessful.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Bulk transmit all pending pitches live
  const handleSendAllLive = async () => {
    if (customizedPitches.length === 0) return;

    // Pre-validate all emails in the batch
    for (let i = 0; i < customizedPitches.length; i++) {
      const pitch = customizedPitches[i];
      if (pitch.status === 'sent') continue;

      const valResult = validatePitchEmail(pitch.targetEmail);
      if (!valResult.isValid) {
        alert(`This contact email could not be verified. Please check the address or use another submission contact.\n\nFailed for: ${pitch.targetName} (${pitch.targetEmail})`);
        return;
      }
    }

    const warn = window.confirm(`Transmit all ${customizedPitches.length} email pitches directly via Gmail now?`);
    if (!warn) return;

    setIsSending(true);
    setErrorText(null);
    try {
      const token = sessionStorage.getItem('gmailToken');
      const uid = sessionStorage.getItem('userId') || '';
      
      for (let i = 0; i < customizedPitches.length; i++) {
        const pitch = customizedPitches[i];
        if (pitch.status === 'sent') continue;

        // Check if unverified sample email needs dynamic warning before sending
        const valResult = validatePitchEmail(pitch.targetEmail);
        if (valResult.isUnverifiedSample) {
          const confirmUnverified = window.confirm(`The contact "${pitch.targetName}" (${pitch.targetEmail}) is an unverified sample email. Do you manually confirm that you want to send this pitch anyway?`);
          if (!confirmUnverified) {
            continue; // Skip this one, or let user decide
          }
        }
        
        const res = await fetch('/api/gmail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': uid,
          },
          body: JSON.stringify({
            outreachId: pitch.id,
            emailSubject: pitch.subject,
            emailBody: pitch.body
          })
        });

        if (!res.ok) {
          const txt = await res.json();
          throw new Error(txt.error || `Bulk direct sending failed for ${pitch.targetName}`);
        }
      }

      setCustomizedPitches(prev => prev.map(p => ({ ...p, status: 'sent' })));
      setTransmissionCompleted('sent');
    } catch (err: any) {
      setErrorText(err.message || 'Direct bulk transmission failed.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubjectChange = (val: string) => {
    setCustomizedPitches(prev => prev.map((p, idx) => idx === activePitchIndex ? { ...p, subject: val } : p));
  };

  const handleBodyChange = (val: string) => {
    setCustomizedPitches(prev => prev.map((p, idx) => idx === activePitchIndex ? { ...p, body: val } : p));
  };

  const handleAlterPitch = async () => {
    const activePitch = customizedPitches[activePitchIndex];
    if (!activePitch || !aiModifyInstruction.trim()) return;

    setIsAltering(true);
    setAlterError(null);

    try {
      const uid = sessionStorage.getItem('userId') || '';
      const res = await fetch('/api/gemini/alter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid,
        },
        body: JSON.stringify({
          originalSubject: activePitch.subject,
          originalBody: activePitch.body,
          instruction: aiModifyInstruction.trim(),
          length: pitchLength,
          outreachId: activePitch.id
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Pitch modification failed.' }));
        throw new Error(errorData.error || 'Failed to modify pitch content.');
      }

      const val = await res.json();
      setCustomizedPitches(prev => prev.map((p, idx) => 
        idx === activePitchIndex 
          ? { 
              ...p, 
              subject: val.subject, 
              body: val.body, 
              strategy: val.strategy 
            } 
          : p
      ));
      
      // Clear prompt input after successful application
      setAiModifyInstruction('');
    } catch (err: any) {
      console.error(err);
      setAlterError(err.message || 'AI revision failed.');
    } finally {
      setIsAltering(false);
    }
  };

  const copyToClipboard = (type: 'subject' | 'body') => {
    const activePitch = customizedPitches[activePitchIndex];
    if (!activePitch) return;
    if (type === 'subject') {
      navigator.clipboard.writeText(activePitch.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2500);
    } else {
      navigator.clipboard.writeText(activePitch.body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2500);
    }
  };

  // Filter combined targets
  const filteredRecipients = combinedRecipients.filter(r => {
    const category = getRecipientCategory(r);
    const matchesCategory = selectedCategories.includes(category);

    const matchesSearch = 
      (r.name || '').toLowerCase().includes(targetSearch.toLowerCase()) || 
      (r.email || '').toLowerCase().includes(targetSearch.toLowerCase()) ||
      (r.region || '').toLowerCase().includes(targetSearch.toLowerCase()) ||
      (r.genre || '').toLowerCase().includes(targetSearch.toLowerCase());
    
    const matchesCountry = countryFilter === 'ALL' || (r.region || '').includes(countryFilter);
    const matchesGenre = genreFilter === 'ALL' || r.genre === genreFilter;
    
    return matchesCategory && matchesSearch && matchesCountry && matchesGenre;
  });

  const activePitch = customizedPitches[activePitchIndex] || null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" id="new_pitch_flow_card">
      {/* Step Indicator Headers */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight">Compose New Outreach</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Build highly strategic, human-feeling, tailored A&R pitches with Gemini.
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider">
          Step {step} of 3
        </div>
      </div>

      {errorText && (
        <div className="p-4 bg-rose-950/20 border border-rose-900/60 text-rose-400 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1 w-full">
            <span className="font-mono tracking-wider font-semibold uppercase block">Transaction Exception Flagged</span>
            <p className="leading-relaxed font-light">{errorText}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Main Config and Target Selection */}
      {step === 1 && (
        <form onSubmit={handleGeneratePitch} className="space-y-6">
          {/* Section A: Selection of Music Track */}
          <div className="bg-stone-900/25 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-950 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-400" /> A. Select Your Sound
              </h3>
              <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-900 text-[10px] font-mono uppercase">
                <button
                  type="button"
                  onClick={() => setUseExistingTrack(true)}
                  className={`px-3 py-1 rounded-md transition ${useExistingTrack ? 'bg-neutral-850 text-white' : 'text-zinc-500 hover:text-stone-300'}`}
                >
                  Saved Tracks ({demos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingTrack(false)}
                  className={`px-3 py-1 rounded-md transition ${!useExistingTrack ? 'bg-neutral-850 text-white' : 'text-zinc-500 hover:text-stone-300'}`}
                >
                  Add On-The-Fly
                </button>
              </div>
            </div>

            {useExistingTrack ? (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Select Unreleased Track</label>
                {demos.length === 0 ? (
                  <div className="p-4 border border-dashed border-neutral-900 rounded-xl text-center text-xs text-neutral-500">
                    No saved tracks found. Click "Add On-The-Fly" to quickly input your track coordinates.
                  </div>
                ) : (
                  <select
                    value={selectedDemoId}
                    onChange={(e) => setSelectedDemoId(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 outline-none rounded-xl text-xs text-stone-200"
                    id="track_selector_dropdown"
                  >
                    {demos.map(d => (
                      <option key={d.id} value={d.id}>{d.title} ({d.genre})</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Track Title</label>
                  <input
                    type="text"
                    required={!useExistingTrack}
                    placeholder="e.g. Dreamscape (Original Mix)"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">SoundCloud / Dropbox / Google Drive link</label>
                  <input
                    type="url"
                    required={!useExistingTrack}
                    placeholder="https://soundcloud.com/private-token-link"
                    value={newTrackLink}
                    onChange={(e) => setNewTrackLink(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Primary Genre</label>
                    <select
                      value={newTrackGenre}
                      onChange={(e) => setNewTrackGenre(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-stone-200 outline-none"
                    >
                      {GENRES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Vibe Mood</label>
                    <select
                      value={newTrackMood}
                      onChange={(e) => setNewTrackMood(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-stone-200 outline-none"
                    >
                      {MOODS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Short Track Description (A&R Context)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Classic tape delay warm chords, Roland 909 hats, and analog synth bass. Built for deep sunrise visual sets."
                    value={newTrackDescription}
                    onChange={(e) => setNewTrackDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section B: Selection of Targets and Deep Regional Filtering */}
          <div className="bg-stone-900/25 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-950 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-blue-400" /> B. Pick Target Recipient(s)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowQuickCustomTarget(!showQuickCustomTarget);
                }}
                className="flex items-center gap-1.5 font-mono text-[9px] uppercase text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showQuickCustomTarget ? 'Search database instead' : 'Pitch dynamic direct email'}
              </button>
            </div>

            {/* Quick target modal-like container */}
            {showQuickCustomTarget && (
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">Add Custom Recipient Details</h4>
                  <button
                    type="button"
                    onClick={() => setShowQuickCustomTarget(false)}
                    className="text-[9px] font-mono uppercase text-zinc-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block">Contact Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe (A&R Director)"
                      value={customTargetName}
                      onChange={(e) => setCustomTargetName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900/50 border border-neutral-900 focus:border-neutral-700 outline-none rounded-lg text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block">Contact Email</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@labelname.com"
                      value={customTargetEmail}
                      onChange={(e) => setCustomTargetEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900/50 border border-neutral-900 focus:border-neutral-700 outline-none rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Recipient category selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block">Recipient Category Type</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'label', label: 'Record Label 🏢', dbType: 'label' },
                      { id: 'artist', label: 'Artist / DJ 👤', dbType: 'curator' },
                      { id: 'club', label: 'Club / Venue 🎶', dbType: 'blog' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCustomTargetCategory(cat.id as any)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition select-none cursor-pointer ${
                          customTargetCategory === cat.id
                            ? 'bg-neutral-100 text-neutral-950 border-white font-medium'
                            : 'bg-stone-900/40 hover:bg-stone-900/70 border-neutral-900 text-zinc-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={!customTargetName.trim() || !customTargetEmail.trim() || isCreatingCustomTarget}
                    onClick={async () => {
                      if (!customTargetName.trim() || !customTargetEmail.trim()) return;
                      try {
                        setIsCreatingCustomTarget(true);
                        setErrorText(null);
                        setCreatedEmails(prev => [...prev, customTargetEmail.trim()]);
                        
                        // Map category to db types
                        const mappedDbType = customTargetCategory === 'label' ? 'label' : (customTargetCategory === 'artist' ? 'curator' : 'blog');
                        await onAddTarget(customTargetName.trim(), customTargetEmail.trim(), mappedDbType as any, 'Added during quick pitch setup.');
                        
                        setCustomTargetName('');
                        setCustomTargetEmail('');
                        setShowQuickCustomTarget(false);
                      } catch (err: any) {
                        setErrorText(err.message || 'Failed storing target creator.');
                      } finally {
                        setIsCreatingCustomTarget(false);
                      }
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[10px] uppercase font-mono tracking-widest cursor-pointer"
                  >
                    {isCreatingCustomTarget ? 'Registering...' : 'Add & Select Recipient'}
                  </button>
                </div>
              </div>
            )}

            {!showQuickCustomTarget && (
              <div className="space-y-4">
                {/* Search Text input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Search Label / Curator Database</label>
                  <input
                    type="text"
                    placeholder="Search curated bank: Keinemusik, Solid Grooves, Selected..."
                    value={targetSearch}
                    onChange={(e) => setTargetSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-750 rounded-xl text-xs text-white outline-none font-sans"
                    id="recipient_search_dropdown"
                  />
                </div>

                {/* Recipient Category Type Selection Filters */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Show Recipient Types</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'label', label: 'Record Labels 🏢', desc: 'A&Rs & Imprints' },
                      { id: 'artist', label: 'Artists / DJs 👤', desc: 'Direct Contacts' },
                      { id: 'club', label: 'Clubs / Venues 🎶', desc: 'Nightlife Promoters' },
                    ].map((cat) => {
                      const active = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-3 py-2.5 rounded-xl border text-center transition select-none cursor-pointer flex flex-col items-center justify-center ${
                            active
                              ? 'bg-neutral-100 text-neutral-950 border-white font-medium'
                              : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-900 text-zinc-400'
                          }`}
                        >
                          <span className="text-[11px] font-bold block">{cat.label}</span>
                          <span className={`text-[8px] font-mono uppercase tracking-wide mt-0.5 ${active ? 'text-zinc-650' : 'text-zinc-500'}`}>{cat.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Regional and Genre Alignment Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block">Filter by Target Country</label>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 outline-none rounded-xl text-xs text-stone-200"
                    >
                      <option value="ALL">All Countries (Global Coverage)</option>
                      {uniqueCountries.map(ctry => (
                        <option key={ctry} value={ctry}>{ctry}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase block">Filter by Music Genre</label>
                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 outline-none rounded-xl text-xs text-stone-200"
                    >
                      <option value="ALL">All Label Styles</option>
                      {uniqueGenres.map(gen => (
                        <option key={gen} value={gen}>{gen}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick select/clear tools */}
                <div className="flex justify-between items-center bg-transparent mt-1 py-1">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">
                    Showing {filteredRecipients.length} of {combinedRecipients.length} curators ({selectedTargetIds.length} Selected)
                  </span>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const filteredIds = filteredRecipients.map(r => r.id);
                        setSelectedTargetIds(prev => {
                          const next = [...prev];
                          filteredIds.forEach(id => {
                            if (!next.includes(id)) next.push(id);
                          });
                          return next;
                        });
                      }}
                      className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Select All Matching
                    </button>
                    <span className="text-zinc-800 text-[10px]">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const filteredIds = filteredRecipients.map(r => r.id);
                        setSelectedTargetIds(prev => prev.filter(id => !filteredIds.includes(id)));
                      }}
                      className="text-[9px] font-mono text-rose-400 hover:text-rose-300 font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Deselect Matching
                    </button>
                  </div>
                </div>

                {/* Scrolling multi-select list */}
                <div className="max-h-72 overflow-y-auto space-y-2 border border-neutral-900 p-2.0.5 rounded-xl bg-neutral-950" id="scrolling_results">
                  {filteredRecipients.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-500 font-mono uppercase">
                      No matching records found. Try adjusting filters or click "Pitch dynamic direct email"
                    </div>
                  ) : (
                    filteredRecipients.map(r => {
                      const isSelected = selectedTargetIds.includes(r.id);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setSelectedTargetIds(prev => 
                              prev.includes(r.id) 
                                ? prev.filter(id => id !== r.id) 
                                : [...prev, r.id]
                            );
                          }}
                          className={`w-full p-3.5 rounded-xl text-left border transition flex justify-between items-start cursor-pointer hover:border-zinc-750 ${
                            isSelected 
                              ? 'bg-neutral-900 border-stone-200 text-white' 
                              : 'bg-stone-900/15 border-transparent hover:bg-stone-900/35 text-neutral-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2">
                              {/* Checkbox */}
                              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-white text-black' : 'border-zinc-750'}`}>
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[4.5]" />}
                              </span>
                              <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                                {r.name}
                              </p>
                              {r.type === 'Premier Label' ? (
                                <span className="font-mono text-[8px] uppercase tracking-wider text-amber-500/80 border border-amber-900/30 bg-amber-950/15 px-1.5 py-0.25 rounded shrink-0">
                                  Standard Bank
                                </span>
                              ) : (
                                <span className="font-mono text-[8px] uppercase tracking-wider text-emerald-500/80 border border-emerald-900/30 bg-emerald-950/15 px-1.5 py-0.25 rounded shrink-0">
                                  Custom Direct
                                </span>
                              )}
                              
                              {/* Category badge */}
                              {(() => {
                                const cat = getRecipientCategory(r);
                                if (cat === 'label') {
                                  return (
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-blue-400 border border-blue-900/30 bg-blue-950/15 px-1.5 py-0.25 rounded shrink-0">
                                      Label 🏢
                                    </span>
                                  );
                                } else if (cat === 'artist') {
                                  return (
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-fuchsia-400 border border-fuchsia-900/30 bg-fuchsia-950/15 px-1.5 py-0.25 rounded shrink-0">
                                      Artist Key 👤
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="font-mono text-[8px] uppercase tracking-wider text-indigo-400 border border-indigo-900/30 bg-indigo-950/15 px-1.5 py-0.25 rounded shrink-0">
                                      Club / Venue 🎶
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                            
                            <p className="text-[9px] font-mono text-zinc-400 mt-1.5 truncate">
                              {r.email}
                            </p>
                            
                            {/* Region and genre flags badges */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {r.region && r.region !== 'Custom' && (
                                <span className="inline-flex items-center text-[10px] text-zinc-350 font-sans">
                                  {r.region}
                                </span>
                              )}
                              {r.genre && r.genre !== 'All Styles' && (
                                <span className="inline-flex items-center text-[9px] text-zinc-500 font-mono uppercase bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                                  🏷️ {r.genre}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submission and loading triggers */}
          <button
            type="submit"
            disabled={selectedTargetIds.length === 0}
            className={`w-full py-4 font-display font-semibold transition text-xs rounded-xl tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xl border ${
              selectedTargetIds.length === 0
                ? 'bg-neutral-800 text-neutral-500 border-neutral-900 cursor-not-allowed'
                : 'bg-zinc-100 hover:bg-white text-black border-transparent'
            }`}
            id="draft_ai_pitch_btn"
          >
            Compose AI Pitch {selectedTargetIds.length > 1 ? `Strategies for ${selectedTargetIds.length} Recipient(s)` : 'Strategy'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: AI Generation sequential progress indicator */}
      {step === 2 && (
        <div className="py-16 text-center space-y-6 flex flex-col items-center justify-center bg-stone-900/10 rounded-2xl border border-neutral-900" id="ai_generator_loader">
          <Loader2 className="w-12 h-12 text-zinc-300 animate-spin" />
          <div className="space-y-2.5">
            <h3 className="font-display font-medium text-lg text-white">Synthesizing Creative Outreach Pitch...</h3>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
              GENERATING TAILORED DRAFT {currentGeneratingIndex + 1} OF {selectedTargetIds.length}
            </p>
            {generatingLabelName && (
              <p className="text-emerald-400 text-xs font-semibold bg-emerald-950/20 px-3.5 py-1.5 rounded-full border border-emerald-900/40 inline-block font-sans animate-pulse">
                Aligning Curator: {generatingLabelName}
              </p>
            )}
            <p className="text-stone-400 text-xs max-w-sm mx-auto leading-relaxed">
              Gemini is aligning unreleased audio description, genre tagging, and customized A&R fit parameters in real time...
            </p>
          </div>
          <div className="w-96 max-w-xs transition">
            <WaveformAnimation active={true} speed={1.5} heightClass="h-10" />
          </div>
        </div>
      )}

      {/* STEP 3: Multi-Recipient Pitch Review and Customization Workspace */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Header tabs to switch between active draft being reviewed */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Select Recipient to Proofread & Personalize ({customizedPitches.length} total)</label>
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-900 no-scrollbar">
              {customizedPitches.map((p, idx) => {
                const isActive = idx === activePitchIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePitchIndex(idx);
                      setCopiedSubject(false);
                      setCopiedBody(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 border-stone-200 text-white shadow-md'
                        : 'bg-stone-900/10 border-neutral-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold font-sans">{p.targetName}</span>
                    {p.status === 'draft' && (
                      <span className="text-[8px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-400 px-1.5 py-0.25 rounded font-bold">
                        DRAFT
                      </span>
                    )}
                    {p.status === 'sent' && (
                      <span className="text-[8px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.25 rounded font-bold">
                        SENT
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {activePitch && (
            <div className="space-y-5 animate-fade-in" key={activePitch.id}>
              {/* Strategy Annotation Callout panel */}
              {activePitch.strategy && (
                <div className="p-4 bg-emerald-950/25 border border-emerald-900/50 rounded-2xl text-neutral-300 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-semibold block">A&R Connection Strategy</span>
                    <p className="text-xs text-neutral-300 leading-relaxed font-light italic">
                      "{activePitch.strategy}"
                    </p>
                  </div>
                </div>
              )}

              {/* AI Modifier and Length Controller Panel */}
              <div className="bg-gradient-to-br from-indigo-950/10 via-neutral-900/30 to-purple-950/10 p-5 rounded-2xl border border-indigo-900/40 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-300">
                    AI Revision & Text Amount Workspace
                  </h4>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  Instruct the AI to alter this specific email draft in any way (e.g. <i>"make it more casual"</i>, <i>"focus on the nostalgic summer sound"</i>, <i>"add a friendly request to schedule a listen"</i>) and custom tailor the final length.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* Prompt Textbox */}
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Altering Instruction</span>
                    <input
                      type="text"
                      placeholder="e.g. Make it shorter and extremely energetic..."
                      value={aiModifyInstruction}
                      onChange={(e) => setAiModifyInstruction(e.target.value)}
                      disabled={isAltering || activePitch.status !== 'idle'}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-900 focus:border-indigo-800 outline-none rounded-xl text-xs text-stone-200"
                    />
                  </div>

                  {/* Size guideline Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Text Amount Size</span>
                    <div className="grid grid-cols-3 bg-neutral-950 border border-neutral-900 p-1 rounded-xl">
                      {([
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Med' },
                        { value: 'larger', label: 'Large' },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPitchLength(opt.value)}
                          disabled={isAltering || activePitch.status !== 'idle'}
                          className={`py-1 text-[10px] font-mono rounded-lg transition-all cursor-pointer ${
                            pitchLength === opt.value
                              ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold shadow'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error notification */}
                {alterError && (
                  <p className="text-[10px] text-red-400 font-mono">
                    ⚠️ Error: {alterError}
                  </p>
                )}

                {/* Confirm application button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAlterPitch}
                    disabled={isAltering || !aiModifyInstruction.trim() || activePitch.status !== 'idle'}
                    className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 transition cursor-pointer font-bold ${
                      !aiModifyInstruction.trim() || activePitch.status !== 'idle'
                        ? 'bg-neutral-950 text-zinc-650 hover:text-zinc-650 border border-neutral-900 cursor-not-allowed'
                        : isAltering
                        ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50 cursor-wait animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    }`}
                  >
                    {isAltering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Revising Pitch...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Alter Pitch via AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editable email panel form */}
              <div className="bg-stone-900/25 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-5">
                <div className="flex justify-between items-center border-b border-neutral-950 pb-3">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    Review Pitch context for {activePitch.targetName} ({activePitch.targetEmail})
                  </h3>
                  {activePitch.status !== 'idle' && (
                    <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest font-semibold">
                      ✓ Sync Registered
                    </span>
                  )}
                </div>

                <div className="space-y-4 font-sans">
                  {/* Subject line input */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center bg-transparent">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Email Subject Line</label>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('subject')}
                        className="font-mono text-[9px] uppercase text-emerald-400 flex items-center gap-1 cursor-pointer focus:outline-none"
                      >
                        {copiedSubject ? 'Copied ✓' : 'Copy Subject Text'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={activePitch.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 outline-none rounded-xl text-xs text-white"
                    />
                  </div>

                  {/* Body text area */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center bg-transparent">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Email Pitch Body</label>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('body')}
                        className="font-mono text-[9px] uppercase text-emerald-400 flex items-center gap-1 cursor-pointer focus:outline-none"
                      >
                        {copiedBody ? 'Copied ✓' : 'Copy Body'}
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={activePitch.body}
                      onChange={(e) => handleBodyChange(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 outline-none rounded-xl text-xs text-neutral-200 leading-relaxed font-sans resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Active Pitch Specific Actions */}
              <div className="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  Transmission Status: {activePitch.status === 'idle' ? 'Pending' : activePitch.status.toUpperCase()}
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isSyncing || isSending || activePitch.status !== 'idle'}
                    onClick={handleSyncActiveToGmail}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-neutral-950 border border-neutral-850 hover:border-neutral-750 text-stone-300 rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    {isSyncing ? 'Syncing...' : 'Sync Active to Gmail'}
                  </button>
                  <button
                    type="button"
                    disabled={isSyncing || isSending || activePitch.status !== 'idle'}
                    onClick={handleSendActiveLive}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-display font-medium uppercase tracking-wider cursor-pointer font-semibold"
                  >
                    {isSending ? 'Sending...' : 'Send active live'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Master Bulk Control Panels */}
          {!transmissionCompleted && customizedPitches.length > 1 && (
            <div className="border-t border-neutral-900 pt-6 mt-4 space-y-4">
              <div className="flex items-center gap-2.5 text-zinc-500 font-mono text-[10px] uppercase">
                <h4>Bulk Pipeline Processing</h4>
                <span className="text-zinc-800">|</span>
                <span>{customizedPitches.filter(p => p.status !== 'idle').length} of {customizedPitches.length} Completed</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={isSyncing || isSending}
                  onClick={handleSyncAllToGmail}
                  className="w-full py-4 bg-stone-900/60 text-stone-250 hover:bg-stone-900 border border-neutral-900 hover:border-neutral-700 transition font-display font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                  id="gmail_draft_sync"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <Mail className="w-4 h-4 text-emerald-400" />}
                  Sync All to Gmail ({customizedPitches.filter(p => p.status === 'idle').length} Pending)
                </button>

                <button
                  type="button"
                  disabled={isSyncing || isSending}
                  onClick={handleSendAllLive}
                  className="w-full py-4 bg-zinc-100 hover:bg-white text-black transition font-display font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                  id="gmail_direct_send"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Transmit All Directly ({customizedPitches.filter(p => p.status === 'idle').length} Pending)
                </button>
              </div>
            </div>
          )}

          {/* Fallback actions if just single selection */}
          {!transmissionCompleted && customizedPitches.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                disabled={isSyncing || isSending}
                onClick={handleSyncActiveToGmail}
                className="w-full py-4 bg-stone-900/60 text-stone-250 hover:bg-stone-900 border border-neutral-900 hover:border-neutral-700 transition font-display font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                id="gmail_draft_sync"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4 text-emerald-400" />}
                Sync Draft with Gmail
              </button>

              <button
                type="button"
                disabled={isSyncing || isSending}
                onClick={handleSendActiveLive}
                className="w-full py-4 bg-zinc-100 hover:bg-white text-black transition font-display font-bold text-xs uppercase rounded-xl tracking-wider cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                id="gmail_direct_send"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Transmit Pitch Directly
              </button>
            </div>
          )}

          {/* Success final message block */}
          {transmissionCompleted && (
            <div className="p-5 bg-stone-900/60 rounded-2xl border border-teal-900/20 flex flex-col items-center justify-center text-center space-y-4 mt-6 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-950/40 text-emerald-400 flex items-center justify-center border border-emerald-900/50">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-medium text-sm text-white uppercase tracking-wider">
                  {transmissionCompleted === 'draft' ? 'Drafts Mapped successfully' : 'Batch Dispatched successfully'}
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {transmissionCompleted === 'draft' 
                    ? `Brilliant! Your ${customizedPitches.length} unreleased demo submissions are fully synced inside your actual connected Google Workspace accounts. Go head and preview them in your Gmail drafts folder.`
                    : `Excellent news! All ${customizedPitches.length} tailored demo submission drafts are fully transmitted directly to the requested curators.`}
                </p>
              </div>
              <button
                onClick={onFinishFlow}
                className="px-5 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-display font-semibold uppercase tracking-wider cursor-pointer mt-2"
                id="finish_flow_back_dashboard"
              >
                Return to Dashboard View
              </button>
            </div>
          )}

          {/* Restart option */}
          {!transmissionCompleted && (
            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-zinc-550 hover:text-white underline text-xs font-mono uppercase tracking-widest"
              >
                Back to track & targets selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
