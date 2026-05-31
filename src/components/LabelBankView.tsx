import React, { useState } from 'react';
import { Search, Heart, MapPin, ExternalLink, Instagram, Send, Info, Lock } from 'lucide-react';
import { Label } from '../types.js';

interface LabelBankViewProps {
  labels: Label[];
  onToggleFavorite: (id: string) => Promise<void>;
  onPitchLabel: (label: Label) => void;
  userPlan: 'free_trial' | 'starter' | 'pro';
}

export default function LabelBankView({ labels, onToggleFavorite, onPitchLabel, userPlan }: LabelBankViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const GENRES = [
    'All',
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

  // Derive unique countries/regions for filter dropdown
  const REGIONS = ['All', ...new Set(labels.map(l => {
    // e.g. "Berlin, Germany" -> extract "Germany" or keep as is
    const parts = (l.region || '').split(',');
    return parts.length > 0 ? parts[parts.length - 1].trim() : '';
  }).filter(Boolean))];

  // Enforce locked boundaries per plan:
  // Free Trial: accesses first 3 labels
  // Starter: accesses first 6 labels
  // Pro: accesses all labels
  const getLabelAccessState = (index: number) => {
    if (userPlan === 'pro') return { locked: false, reason: '' };
    if (userPlan === 'starter') {
      if (index >= 6) return { locked: true, reason: 'Starter tier limits label access to the top 6 premier contacts. Upgrade to Pro for complete access.' };
      return { locked: false, reason: '' };
    }
    // free_trial
    if (index >= 3) return { locked: true, reason: 'Free Trial includes a teaser preview of the top 3 high-converting labels. Upgrade to unlock the database.' };
    return { locked: false, reason: '' };
  };

  const filteredLabels = labels
    .map((lbl, idx) => ({ ...lbl, access: getLabelAccessState(idx) }))
    .filter(lbl => {
      // Search matches
      const searchMatches = 
        (lbl.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lbl.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lbl.region || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Genre matches
      const genreMatches = selectedGenre === 'All' || lbl.genre === selectedGenre;

      // Region matches
      const regionMatches = selectedRegion === 'All' || (lbl.region || '').includes(selectedRegion);

      // Favorite toggle matches
      const favoriteMatches = !showOnlyFavorites || lbl.isFavorite;

      return searchMatches && genreMatches && regionMatches && favoriteMatches;
    });

  return (
    <div className="space-y-6" id="label_bank_container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="text-2xl font-display font-medium text-white tracking-tight">Label Data Bank</h2>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Curated list of premium, active electronic record labels. Directly target and personalized pitch via Gemini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider transition cursor-pointer ${
              showOnlyFavorites 
                ? 'bg-red-950/20 border-red-900 text-red-400' 
                : 'bg-neutral-950 border-neutral-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-red-400 text-red-400' : ''}`} />
            {showOnlyFavorites ? 'Showing Favorites' : 'Show Favorites'}
          </button>
        </div>
      </div>

      {/* Warnings / Quotas indicators */}
      {userPlan !== 'pro' && (
        <div className="p-4 bg-orange-950/20 border border-orange-900/40 rounded-xl text-neutral-300 flex items-start gap-3">
          <Lock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-display font-medium text-xs text-white uppercase tracking-wider">Premium Labels Restricted</h4>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              You are currently on the <span className="text-orange-400 uppercase font-mono font-medium">{userPlan.replace('_', ' ')} plan</span>. 
              Some premium high-profile label contact details are locked. Upgrade to the **Pro Plan** to unlock 100% of the curated Label Data Bank, priority contacts, and uncapped daily pitching.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Controls Bar */}
      <div className="bg-stone-900/30 p-4 rounded-xl border border-neutral-900 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search labels by name, description, region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 hover:border-neutral-800 rounded-lg text-xs text-white outline-none transition"
              id="label_search_input"
            />
          </div>

          {/* Region Dropdown Filter */}
          <div className="flex gap-2 items-center bg-transparent">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-lg text-xs text-zinc-300 outline-none focus:border-neutral-700 transition"
            >
              {REGIONS.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Genre Pill Selection Bar */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">Filter Genre:</span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-wider transition uppercase cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-zinc-100 text-neutral-950 font-medium'
                    : 'bg-neutral-950 text-zinc-400 hover:text-white border border-neutral-905'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Label Cards */}
      {filteredLabels.length === 0 ? (
        <div className="text-center py-12 bg-neutral-950 rounded-2xl border border-neutral-900">
          <p className="text-xs text-zinc-500 font-mono uppercase">No label contacts match filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="labels_grid">
          {filteredLabels.map((lbl, idx) => (
            <div 
              key={lbl.id} 
              className={`p-5 rounded-2xl transition border flex flex-col justify-between space-y-4 relative ${
                lbl.access.locked 
                  ? 'bg-stone-900/10 border-neutral-905 overflow-hidden' 
                  : 'bg-stone-900/30 border-neutral-900 hover:border-neutral-800'
              }`}
            >
              {(() => {
                const vStatus = lbl.verificationStatus || (
                  (lbl.email || '').toLowerCase().includes('gmail') || (lbl.email || '').toLowerCase().includes('promos')
                    ? 'unverified'
                    : (lbl.id === 'label_5' || lbl.id === 'label_11' || lbl.id === 'label_13')
                      ? 'needs_review'
                      : 'verified'
                );

                return (
                  <>
                    {lbl.access.locked && (
                      <div className="absolute inset-x-0 bottom-0 top-0 bg-neutral-950/70 backdrop-blur-[5px] z-10 flex flex-col items-center justify-center p-4 text-center">
                        <Lock className="w-5 h-5 text-orange-400 mb-1.5 animate-pulse" />
                        <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1 font-bold">LOCKED CONTACT</p>
                        <p className="text-[11px] text-zinc-300 max-w-xs px-2 leading-relaxed">
                          {lbl.access.reason}
                        </p>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase mt-1">Upgrade to unblur and pitch.</span>
                      </div>
                    )}

                    {/* Card Title & Heart Button */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-medium text-base text-white">{lbl.name}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[9px] font-mono tracking-wider text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-950/60 uppercase border border-neutral-900 select-none">
                            {lbl.genre}
                          </span>
                          {vStatus === 'verified' && (
                            <span className="text-[9px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase select-none">
                              ✓ Verified Contact
                            </span>
                          )}
                          {vStatus === 'unverified' && (
                            <span className="text-[9px] font-mono tracking-wider text-red-400 bg-red-400/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-semibold select-none">
                              ⚠ Unverified Contact
                            </span>
                          )}
                          {vStatus === 'needs_review' && (
                            <span className="text-[9px] font-mono tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase select-none">
                              ⚡ Needs Review
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-[11px] font-mono flex items-center gap-1 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {lbl.region}
                        </p>
                      </div>

                      <button
                        onClick={() => onToggleFavorite(lbl.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                          lbl.isFavorite 
                            ? 'bg-red-950/20 text-red-400 border-red-900/50' 
                            : 'bg-neutral-950 text-zinc-600 border-neutral-900 hover:text-red-400 hover:border-neutral-800'
                        }`}
                        aria-label="Toggle Favorite"
                      >
                        <Heart className={`w-4 h-4 ${lbl.isFavorite ? 'fill-red-400' : ''}`} />
                      </button>
                    </div>
                  </>
                );
              })()}

              {/* Description & Fit Tags */}
              <div className="space-y-2 mt-1">
                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {lbl.notes}
                </p>
                <div className="p-2.5 bg-neutral-950/50 rounded-lg border border-neutral-905">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 block mb-0.5">Recommended Pitch Fit:</span>
                  <p className="text-[10px] text-zinc-400 leading-normal font-sans italic">
                    "{lbl.bestFitDescription}"
                  </p>
                </div>
              </div>

              {/* Meta Links & Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-950/60 font-mono text-[10px]">
                <div className="flex gap-2.5">
                  <a 
                    href={lbl.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-zinc-200 transition flex items-center gap-1"
                  >
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                  {lbl.instagram && (
                    <a 
                      href={`https://instagram.com/${lbl.instagram.replace('@','')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-zinc-200 transition flex items-center gap-1"
                    >
                      Instagram <Instagram className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lbl.lastContactedAt ? (
                    <span className="text-zinc-500 text-[9px]">
                      Contacted {new Date(lbl.lastContactedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-[9px]">Never Contacted</span>
                  )}
                  <button
                    onClick={() => onPitchLabel(lbl)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-black font-display font-medium text-[10px] transition uppercase cursor-pointer"
                  >
                    Pitch <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
