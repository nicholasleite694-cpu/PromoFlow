import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Music, Headphones, ChevronRight, Check } from 'lucide-react';
import { ArtistProfile } from '../types.js';
import Logo from './Logo.js';

interface OnboardingProps {
  onSaveProfile: (profileData: Omit<ArtistProfile, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  isSaving: boolean;
  userEmail?: string;
  initialProfile?: ArtistProfile | null;
  onCancel?: () => void;
}

export default function OnboardingView({ onSaveProfile, isSaving, userEmail, initialProfile, onCancel }: OnboardingProps) {
  const [artistName, setArtistName] = useState(initialProfile?.artistName || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');
  const [genres, setGenres] = useState<string[]>(initialProfile?.genres || []);
  const [customGenre, setCustomGenre] = useState('');
  const [targetTone, setTargetTone] = useState(initialProfile?.targetTone || 'Professional & Humble');
  const [customToneInstruction, setCustomToneInstruction] = useState(initialProfile?.customToneInstruction || '');
  const [defaultLength, setDefaultLength] = useState<'small' | 'medium' | 'larger'>(initialProfile?.defaultLength || 'medium');

  const preseededGenres = [
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

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter(g => g !== genre));
    } else {
      if (genres.length >= 4) return; // Limit to 4 tags
      setGenres([...genres, genre]);
    }
  };

  const handleAddCustomGenre = () => {
    const clean = customGenre.trim();
    if (clean && !genres.includes(clean) && genres.length < 4) {
      setGenres([...genres, clean]);
      setCustomGenre('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName.trim() || !bio.trim() || genres.length === 0) return;
    onSaveProfile({
      artistName: artistName.trim(),
      bio: bio.trim(),
      genres,
      targetTone,
      customToneInstruction: customToneInstruction.trim(),
      defaultLength,
    });
  };

  const tones = [
    {
      name: 'Professional & Humble',
      desc: 'Clean, straightforward, and highly respectful of curator schedule.',
    },
    {
      name: 'Energetic & Bold',
      desc: 'Confident, vibrant, electronic-forward, and driving.',
    },
    {
      name: 'Artistic & Deep',
      desc: 'Focuses on the acoustic mood, conceptual narrative, and visual layout.',
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-neutral-950 text-stone-100 overflow-hidden" id="onboarding_view">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-950/10 rounded-full blur-[160px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl bg-stone-900/40 p-6 md:p-10 rounded-2xl border border-neutral-900 shadow-2xl backdrop-blur-md relative z-10"
        id="onboarding_form_card"
      >
        <div className="space-y-4 mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-8 flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
              <Logo size="100%" />
            </div>
            <div className="h-4 w-[1px] bg-neutral-800 hidden md:block" />
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-[10px] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> {initialProfile ? 'Edit Profile Context' : 'Stage 1: Setup Profile'}
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
              {initialProfile ? 'Edit Artist Profile' : 'Configure Your Identity'}
            </h2>
            <p className="text-zinc-400 text-xs font-light mt-1">
              We use this configuration to synthesize personalized pitch contexts for curators. Connected as <span className="text-white font-mono font-normal">{userEmail || 'curator@sendingmachine.fm'}</span>.
            </p>
          </div>
        </div>

         <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artist Name Input */}
          <div className="space-y-2" id="onboarding_name_group">
            <label className="block text-stone-200 font-display font-medium text-xs">
              Artist / Project Name*
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-neutral-950/80 border border-neutral-900 hover:border-zinc-800 focus:border-white rounded-xl text-neutral-200 placeholder-zinc-650 font-sans text-xs focus:ring-1 focus:ring-white transition outline-none"
              placeholder="e.g. Lost Frequency, DJ Eclipse, Nicholas Leite"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>

          {/* Artist Bio Prompt */}
          <div className="space-y-2" id="onboarding_bio_group">
            <label className="block text-stone-200 font-display font-medium text-xs">
              Artist Bio / Project Narrative
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 bg-neutral-950/80 border border-neutral-900 hover:border-zinc-800 focus:border-white rounded-xl text-neutral-200 placeholder-zinc-650 font-sans text-xs focus:ring-1 focus:ring-white transition outline-none resize-none"
              placeholder="Tell us a short snippet about your background, accomplishments, releases, or artistic vision. Be honest and simple — AI uses this directly."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="block text-[10px] text-zinc-500 font-mono">
              Recommended: 2 - 3 sentences detailing your musical direction.
            </span>
          </div>

          {/* Genres Tagging */}
          <div className="space-y-3" id="onboarding_genres_group">
            <div className="flex justify-between items-center">
              <label className="text-stone-200 font-display font-medium text-xs">
                Select Genres / Sub-genres <span className="text-zinc-500 font-normal">({genres.length}/4)</span>
              </label>
              {genres.length === 0 && (
                <span className="text-rose-400 font-mono text-[9px] uppercase">Required: Select at least one</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {preseededGenres.map((genre) => {
                const active = genres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-full text-xs font-light transition tracking-wide flex items-center gap-1 border cursor-pointer select-none ${
                      active
                        ? 'bg-white text-black border-white font-medium'
                        : 'bg-neutral-900 text-stone-300 border-neutral-800 hover:border-zinc-700'
                    }`}
                  >
                    {genre}
                    {active && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </button>
                );
              })}

              {/* User-added custom genres that are not in the predefined pool */}
              {genres.filter(g => !preseededGenres.includes(g)).map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 text-indigo-400 border border-indigo-900/40 hover:bg-neutral-800 hover:text-rose-400 hover:border-rose-900/40 transition tracking-wide flex items-center gap-1.5 group cursor-pointer select-none"
                  title="Click to remove custom genre"
                >
                  {genre}
                  <span className="text-[10px] text-indigo-500 group-hover:text-rose-400 transition ml-0.5 font-bold">✕</span>
                </button>
              ))}
            </div>

            {/* Custom genre adding input */}
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="text"
                placeholder="Alternative, Chillwave..."
                className="flex-1 px-3 py-1.5 bg-neutral-950/60 border border-neutral-900 rounded-lg text-neutral-200 placeholder-zinc-650 font-sans text-xs outline-none focus:border-zinc-700"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomGenre();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                className="px-2.5 py-1.5 text-xs text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition font-mono"
              >
                + Custom
              </button>
            </div>
          </div>

          {/* Core Outreach Tone */}
          <div className="space-y-3" id="onboarding_tone_group">
            <label className="block text-stone-200 font-display font-medium text-xs">
              Outreach Writing Tone Alignment
            </label>
            <div className="space-y-2">
              {tones.map((t) => {
                const selected = targetTone === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setTargetTone(t.name)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                      selected
                        ? 'bg-neutral-900/60 border-zinc-200 text-white'
                        : 'bg-neutral-950/40 border-neutral-900 hover:border-zinc-800 text-neutral-400'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        selected ? 'border-zinc-200 bg-white' : 'border-neutral-800'
                      }`}>
                        {selected && <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />}
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-display font-medium text-xs ${selected ? 'text-white' : 'text-stone-300'}`}>
                        {t.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-normal font-light mt-0.5">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom AI writer options and Length bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-900/60">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
                  AI Writing Prompt Style
                </label>
                <textarea
                  placeholder="e.g. Include a witty sentence about sound design, keep the language highly poetic, use lowercase..."
                  rows={2}
                  className="w-full px-3 py-2 bg-neutral-950/80 border border-neutral-900 hover:border-zinc-800 focus:border-white rounded-xl text-neutral-200 placeholder-zinc-700 font-sans text-xs outline-none focus:ring-1 focus:ring-white transition resize-none leading-normal"
                  value={customToneInstruction}
                  onChange={(e) => setCustomToneInstruction(e.target.value)}
                />
                <p className="text-[9px] text-zinc-500 leading-normal italic">
                  Additional style constraints or special instructions for more unique drafts.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
                  Pitch Length Guide
                </label>
                <div className="flex bg-neutral-950/80 p-1 rounded-xl border border-neutral-900 h-9 shrink-0">
                  {(['small', 'medium', 'larger'] as const).map((len) => {
                    const label = len === 'small' ? 'Small' : len === 'medium' ? 'Medium' : 'Large';
                    const active = defaultLength === len;
                    return (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setDefaultLength(len)}
                        className={`flex-1 rounded-lg text-[10px] font-mono uppercase tracking-wider transition font-medium select-none cursor-pointer ${
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
                <p className="text-[9px] text-zinc-500 leading-normal italic">
                  {defaultLength === 'small' && 'Short submissions (~80-100 words fast read).'}
                  {defaultLength === 'medium' && 'Medium density standard pitches (~140-170 words).'}
                  {defaultLength === 'larger' && 'Large, descriptive submissions (~200-240 words).'}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-zinc-350 rounded-xl font-display font-medium text-xs tracking-wider uppercase transition text-center cursor-pointer select-none"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving || !bio.trim() || genres.length === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-display font-medium text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 ${
                isSaving || !bio.trim() || genres.length === 0
                  ? 'bg-neutral-700/50 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                  : 'bg-white text-black border border-white hover:bg-zinc-200'
              }`}
              id="onboarding_submit_btn"
            >
              {isSaving ? 'Saving Artist Profile...' : initialProfile ? 'Save Changes' : 'Initialize Promo Flow'}
              {!isSaving && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
