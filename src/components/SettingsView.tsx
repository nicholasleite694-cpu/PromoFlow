import React, { useState } from 'react';
import { Save, User, Heart, Settings, ShieldAlert, BadgeCheck, Music } from 'lucide-react';
import { ArtistProfile } from '../types.js';

interface SettingsViewProps {
  profile: ArtistProfile;
  onUpdateProfile: (profileData: Omit<ArtistProfile, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  userEmail?: string;
}

export default function SettingsView({ profile, onUpdateProfile, userEmail }: SettingsViewProps) {
  const [artistName, setArtistName] = useState(profile.artistName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [targetTone, setTargetTone] = useState(profile.targetTone || 'Professional & Humble');
  const [defaultSignature, setDefaultSignature] = useState(profile.defaultSignature || '');
  const [customToneInstruction, setCustomToneInstruction] = useState(profile.customToneInstruction || '');
  const [defaultLength, setDefaultLength] = useState<'small' | 'medium' | 'larger'>(profile.defaultLength || 'medium');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(profile.genres || []);
  const [customGenre, setCustomGenre] = useState('');
  const [notifSound, setNotifSound] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const GENRE_POOL = [
    'Afro House',
    'Minimal / Deep Tech',
    'Tech House',
    'House',
    'Deep House',
    'Melodic House',
    'Disco House',
    'Latin House',
    'Electronic / Other',
    'Techno',
    'Synth-pop',
    'Indie',
    'Ambient',
    'Future Bass',
    'Trap',
    'Neo-soul'
  ];

  const TONES = [
    'Professional & Humble',
    'Energetic & Bold',
    'Artistic & Deep',
    'Direct & Business-focused'
  ];

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateProfile({
        artistName: artistName.trim(),
        bio: bio.trim(),
        genres: selectedGenres,
        targetTone,
        defaultSignature: defaultSignature.trim(),
        customToneInstruction: customToneInstruction.trim(),
        defaultLength,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" id="settings_container">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-5">
        <h2 className="text-2xl font-display font-medium text-white tracking-tight">Artist Profile & Settings</h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Customize your artist signature tone, bio statements, and connected account preferences for pitching curators.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {saveSuccess && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/60 text-emerald-400 rounded-xl text-xs font-mono uppercase tracking-wider">
            ✓ Settings and public profile successfully saved.
          </div>
        )}

        {/* Section A: Artist Identity */}
        <div className="bg-stone-900/25 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-neutral-950 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" /> A. Artist Profile Context
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Artist / Producer Stage Name</label>
              <input
                type="text"
                required
                placeholder="e.g. LEITE"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Short Artist Bio & Vision</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your releases history, hometown roots, rhythmic influences, and future release maps..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section B: Outreach customization */}
        <div className="bg-stone-900/25 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-neutral-950 pb-3 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-blue-400" /> B. AI Pitch Configuration
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">outreach Signature Tone</label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-stone-200 outline-none"
              >
                {TONES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <p className="text-[9px] font-sans text-zinc-500 italic">
                Gemini adapts vocabulary arrangements to fit the selected emotional signature.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Default Email Sign-off Name</label>
              <input
                type="text"
                placeholder="e.g. Nicholas Leite (Management Team)"
                value={defaultSignature}
                onChange={(e) => setDefaultSignature(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none font-mono"
              />
              <p className="text-[9px] font-sans text-zinc-500 italic">
                Left empty, MSM defaults to signing off with your public artist name.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-950/60">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Custom AI Writing Prompt Style</label>
                <textarea
                  placeholder="e.g. Include a witty sentence about sound design, keep the language highly poetic, use lowercase..."
                  rows={2}
                  value={customToneInstruction}
                  onChange={(e) => setCustomToneInstruction(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 rounded-xl text-xs text-white outline-none resize-none leading-normal"
                />
                <p className="text-[9px] font-sans text-zinc-500 italic">
                  Additional style constraints or special instructions for more unique drafts.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Default Pitch Length Guide</label>
                <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-900 h-9 shrink-0 items-center">
                  {(['small', 'medium', 'larger'] as const).map((len) => {
                    const label = len === 'small' ? 'Small' : len === 'medium' ? 'Medium' : 'Large';
                    const active = defaultLength === len;
                    return (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setDefaultLength(len)}
                        className={`flex-1 h-7 rounded-lg text-[10px] font-mono uppercase tracking-wider transition font-medium select-none cursor-pointer ${
                          active 
                            ? 'bg-white text-black font-semibold shadow-inner' 
                            : 'text-zinc-500 hover:text-stone-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] font-sans text-zinc-500 italic mt-1">
                  {defaultLength === 'small' && 'Short submissions (~80-100 words fast read).'}
                  {defaultLength === 'medium' && 'Medium density standard pitches (~140-170 words).'}
                  {defaultLength === 'larger' && 'Large, descriptive submissions (~200-240 words).'}
                </p>
              </div>
            </div>
            
            {/* Preferred Genres checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Selected Primary Genres</label>
              <div className="grid grid-cols-2 gap-2">
                {GENRE_POOL.map((g) => {
                  const isChecked = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGenreToggle(g)}
                      className={`p-3 rounded-lg border text-left text-xs transition uppercase font-mono tracking-wider cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-zinc-100 text-neutral-950 border-white' 
                          : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-900 text-zinc-400'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>

              {/* Custom Genres managed dynamically in Settings */}
              <div className="space-y-4 pt-4 border-t border-neutral-950/60">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Custom Added Genres</label>
                
                {/* Custom genres tags block with active X button to remove */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                  {selectedGenres.filter(g => !GENRE_POOL.includes(g)).length === 0 ? (
                    <span className="text-[11px] text-zinc-600 italic">No custom genres configured. Add below to refine AI pitching targets.</span>
                  ) : (
                    selectedGenres.filter(g => !GENRE_POOL.includes(g)).map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setSelectedGenres(selectedGenres.filter(g => g !== genre))}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-950 text-indigo-400 border border-indigo-900/40 hover:bg-neutral-900 hover:text-rose-400 hover:border-rose-900/40 transition tracking-wide flex items-center gap-1.5 group cursor-pointer select-none"
                        title="Click to remove custom genre"
                      >
                        {genre}
                        <span className="text-[10px] text-indigo-500 group-hover:text-rose-400 transition ml-0.5 font-bold">✕</span>
                      </button>
                    ))
                  )}
                </div>

                {/* Input form to add a custom genre in profile edit */}
                <div className="flex items-center gap-2 max-w-xs">
                  <input
                    type="text"
                    placeholder="Alternative, Chillwave..."
                    className="flex-1 px-3 py-1.5 bg-neutral-950/60 border border-neutral-950 rounded-lg text-neutral-200 placeholder-zinc-650 font-sans text-xs outline-none focus:border-zinc-700"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const clean = customGenre.trim();
                        if (clean && !selectedGenres.includes(clean)) {
                          setSelectedGenres([...selectedGenres, clean]);
                          setCustomGenre('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const clean = customGenre.trim();
                      if (clean && !selectedGenres.includes(clean)) {
                        setSelectedGenres([...selectedGenres, clean]);
                        setCustomGenre('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-stone-300 bg-neutral-950 border border-neutral-900 rounded-lg hover:bg-neutral-900 hover:text-white transition font-mono cursor-pointer"
                  >
                    + Custom
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Credentials status */}
        <div className="bg-stone-900/25 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 border-b border-neutral-950 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" /> C. Workspace Preferences & Connection
          </h3>

          <div className="space-y-4 text-xs font-sans text-zinc-400 leading-relaxed">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Connected curator accounts</p>
              <p className="text-white font-medium text-xs mt-0.5">{userEmail || 'independent-artist@sendingmachine.fm'}</p>
            </div>

            {/* Simulated Notification Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifSound}
                  onChange={(e) => setNotifSound(e.target.checked)}
                  className="mt-0.5 bg-neutral-950 accent-white border border-neutral-850"
                />
                <span className="text-[11px]">Enable sound alert feedbacks on successful transmissions</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.checked)}
                  className="mt-0.5 bg-neutral-950 accent-white border border-neutral-850"
                />
                <span className="text-[11px]">Receive weekly email digests of label database update alerts</span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Controls */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-zinc-100 hover:bg-white text-black font-display font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xl"
          id="settings_submit_action"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Synchronizing Profiles...' : 'Save Settings Details'}
        </button>
      </form>
    </div>
  );
}
