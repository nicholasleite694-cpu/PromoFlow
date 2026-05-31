import React, { useState } from 'react';
import { Plus, Disc, Send, MapPin, Sparkles, AlertTriangle, ArrowUpRight, Music, Heart, Calendar, Clock, Trash2, Pencil, Loader2 } from 'lucide-react';
import { Demo, Target, Outreach, DashboardStats, ArtistProfile, Label } from '../types.js';

interface DashboardProps {
  profile: ArtistProfile;
  demos: Demo[];
  targets: Target[];
  outreaches: Outreach[];
  stats: DashboardStats;
  labels: Label[];
  onAddDemo: (title: string, link: string, description: string, mood: string, genre: string) => Promise<void>;
  onDeleteDemo: (id: string) => Promise<void>;
  onUpdateDemo: (id: string, title: string, link: string, description: string, mood: string, genre: string) => Promise<void>;
  onNavigateTab: (tab: 'dashboard' | 'new_pitch' | 'labels' | 'history' | 'subscription' | 'settings') => void;
  onSelectLabelToPitch: (label: Label) => void;
  onToggleFavoriteLabel: (id: string) => Promise<void>;
  userEmail?: string;
  onLogout: () => void;
  onEditProfile?: () => void;
}

export default function DashboardView({
  profile,
  demos,
  targets,
  outreaches,
  stats,
  labels,
  onAddDemo,
  onDeleteDemo,
  onUpdateDemo,
  onNavigateTab,
  onSelectLabelToPitch,
  onToggleFavoriteLabel,
  userEmail,
  onLogout,
  onEditProfile
}: DashboardProps) {
  // Demo track quick creation state
  const [showAddTrackForm, setShowAddTrackForm] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackLink, setTrackLink] = useState('');
  const [trackGenre, setTrackGenre] = useState(profile.genres?.[0] || 'Tech House');
  const [trackMood, setTrackMood] = useState('Atmospheric');
  const [trackDescription, setTrackDescription] = useState('');
  const [isSavingTrack, setIsSavingTrack] = useState(false);

  // Demo track editing state
  const [editingDemoId, setEditingDemoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editMood, setEditMood] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditingSaving, setIsEditingSaving] = useState(false);

  const GENRE_POOL = [
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

  const handleQuickAddTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !trackLink.trim()) return;
    setIsSavingTrack(true);
    try {
      await onAddDemo(
        trackTitle.trim(),
        trackLink.trim(),
        trackDescription.trim(),
        trackMood,
        trackGenre
      );
      setTrackTitle('');
      setTrackLink('');
      setTrackDescription('');
      setShowAddTrackForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTrack(false);
    }
  };

  const handleStartEdit = (demo: Demo) => {
    setEditingDemoId(demo.id);
    setEditTitle(demo.title);
    setEditLink(demo.link);
    setEditGenre(demo.genre);
    setEditMood(demo.mood);
    setEditDescription(demo.description || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editLink.trim()) return;
    setIsEditingSaving(true);
    try {
      await onUpdateDemo(id, editTitle.trim(), editLink.trim(), editDescription.trim(), editMood, editGenre);
      setEditingDemoId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditingSaving(false);
    }
  };

  // 1. Calculate Recommended Labels
  // Matches labels in database matching artist's saved profile genres
  const matchedLabels = labels.filter(label => {
    const labelGenre = (label.genre || '').toLowerCase();
    const matchesProfile = profile.genres?.some(g => g && labelGenre.includes(g.toLowerCase()));
    const firstDemoGenre = (demos?.[0]?.genre || '').toLowerCase();
    const matchesDemo = firstDemoGenre && labelGenre.includes(firstDemoGenre);
    return matchesProfile || matchesDemo;
  }).slice(0, 3); // Top 3 recommendation matches

  // Default recommendations if no genre match
  const recommendedLabels = matchedLabels.length > 0 ? matchedLabels : labels.slice(0, 3);

  // 2. Track remaining daily limits
  const dailyLimit = stats.dailyPitchLimit;
  const sentToday = stats.outreachToday;
  const isLimitReached = sentToday >= dailyLimit;

  return (
    <div className="space-y-6" id="dashboard_panel">
      {/* Alert Warning on limit hit */}
      {isLimitReached && (
        <div className="p-4 bg-orange-950/25 border border-orange-900/50 rounded-2xl flex items-start gap-3 text-orange-400 text-xs">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-widest font-semibold block">Quota Threshold Engaged</span>
            <p className="leading-relaxed font-light text-zinc-300">
              You’ve used your {sentToday} of {dailyLimit} daily sent pitches today. Upgrade to the **Pro Plan** dynamically inside your settings tab to uncapped unlimited curation emailing.
            </p>
            <button
              onClick={() => onNavigateTab('subscription')}
              className="text-[10px] uppercase font-mono tracking-wider font-semibold hover:underline block text-orange-400 pt-1"
            >
              Explore pro plan →
            </button>
          </div>
        </div>
      )}

      {/* Hero Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Workspace Overview</span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-2xl font-display font-medium text-white tracking-tight">
              Welcome back, {profile.artistName || 'Independent Producer'}
            </h2>
            <button
              onClick={() => onEditProfile?.()}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 text-zinc-500 hover:text-indigo-400 hover:border-indigo-900 transition cursor-pointer"
              title="Edit Artist Profile"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-zinc-400 text-xs mt-1 font-sans">
            Personalization beats automation. Connected as <span className="text-neutral-300 font-mono font-medium">{userEmail || 'curator@sendingmachine.fm'}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('new_pitch')}
          disabled={isLimitReached}
          className={`px-5 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition shadow-lg shrink-0 cursor-pointer ${
            isLimitReached 
              ? 'bg-neutral-900 text-zinc-500 cursor-not-allowed border border-neutral-850' 
              : 'bg-zinc-100 hover:bg-white text-black'
          }`}
        >
          <Plus className="w-4 h-4" /> Start New Pitch
        </button>
      </div>

      {/* Micro Metrics Dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats_metrics_grid">
        {/* Metric 1 */}
        <div className="bg-stone-900/30 p-5 rounded-2xl border border-neutral-900 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">Daily Limit capacity</span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-display font-semibold text-white font-mono">
              {sentToday} <span className="text-zinc-500 font-normal">/</span> {dailyLimit === 999 ? '∞' : dailyLimit}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans">Pitches sent today</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-stone-900/30 p-5 rounded-2xl border border-neutral-900 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">Plan Level</span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xl font-mono font-medium text-emerald-400 uppercase tracking-wide">
              {stats.plan.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans">
            {stats.plan === 'free_trial' ? `${stats.planDaysRemaining} days trial remaining` : 'Premium Active'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-stone-900/30 p-5 rounded-2xl border border-neutral-900 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">Outreach Archive</span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-display font-semibold text-white font-mono">
              {stats.totalOutreach}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans">{stats.sentCount} sent, {stats.draftsCount} pending drafts</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-stone-900/30 p-5 rounded-2xl border border-neutral-900 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">My Music Index</span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-display font-semibold text-white font-mono">
              {demos.length}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans">Unreleased demos stored</p>
        </div>
      </div>

      {/* Main Content Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Music index + Track Matches list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Unreleased demos list with floating creator */}
          <div className="bg-stone-900/20 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800/40 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Music className="w-4 h-4 text-emerald-400" /> My Music Index ({demos.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTrackForm(!showAddTrackForm)}
                className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Add
              </button>
            </div>

            {/* In-place quick creation form */}
            {showAddTrackForm && (
              <form onSubmit={handleQuickAddTrackSubmit} className="bg-neutral-950 p-4 rounded-xl border border-neutral-900 space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Track Title</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acid Sunset (Club Mix)"
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Private SoundCloud / Dropbox link</span>
                  <input
                    type="url"
                    required
                    placeholder="https://soundcloud.com/user/private-token-url"
                    value={trackLink}
                    onChange={(e) => setTrackLink(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-zinc-300 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Genre</span>
                    <select
                      value={trackGenre}
                      onChange={(e) => setTrackGenre(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-stone-200 outline-none"
                    >
                      {GENRE_POOL.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Mood</span>
                    <select
                      value={trackMood}
                      onChange={(e) => setTrackMood(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-stone-200 outline-none"
                    >
                      {MOODS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Track Description / Detail (Optional)</span>
                  <textarea
                    placeholder="Describe your track's specific features, synth design, or label similarity..."
                    value={trackDescription}
                    onChange={(e) => setTrackDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddTrackForm(false)}
                    className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-zinc-400 text-[10px] font-mono uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTrack}
                    className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-black font-semibold text-[10px] font-mono uppercase cursor-pointer"
                  >
                    Save Track Info
                  </button>
                </div>
              </form>
            )}

            {demos.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500 font-mono uppercase">
                No unreleased tracks saved. Click "Quick Add" to list your first demo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="demos_card_grid">
                {demos.map(d => {
                  const isEditing = editingDemoId === d.id;
                  
                  if (isEditing) {
                    return (
                      <div key={d.id} className="p-4 rounded-xl bg-neutral-950 border border-indigo-900/60 space-y-3 col-span-1 md:col-span-2">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Edit Track Details</span>
                          <button
                            type="button"
                            onClick={() => setEditingDemoId(null)}
                            className="text-zinc-500 hover:text-zinc-300 text-[10px] uppercase font-mono cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Track Title</span>
                            <input
                              type="text"
                              required
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white outline-none"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Private Streaming Link</span>
                            <input
                              type="url"
                              required
                              value={editLink}
                              onChange={(e) => setEditLink(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-zinc-300 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Genre</span>
                            <select
                              value={editGenre}
                              onChange={(e) => setEditGenre(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-stone-200 outline-none"
                            >
                              {GENRE_POOL.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Mood</span>
                            <select
                              value={editMood}
                              onChange={(e) => setEditMood(e.target.value)}
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-stone-200 outline-none"
                            >
                              {MOODS.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block">Track Description / Detail (Optional)</span>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            placeholder="Describe your track..."
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white outline-none resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingDemoId(null)}
                            className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-zinc-400 text-[10px] font-mono uppercase cursor-pointer"
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(d.id)}
                            disabled={isEditingSaving}
                            className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-black font-semibold text-[10px] font-mono uppercase cursor-pointer"
                          >
                            {isEditingSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={d.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-900 flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Disc className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <h4 className="font-semibold text-xs text-white truncate">{d.title}</h4>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{d.genre} • {d.mood}</p>
                        {d.description && (
                          <p className="text-[10px] text-zinc-400 font-sans line-clamp-2 italic leading-relaxed py-0.5">{d.description}</p>
                        )}
                        <a 
                          href={d.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[9px] font-mono text-emerald-400 hover:underline block truncate mt-1"
                        >
                          {d.link}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(d)}
                          className="w-7 h-7 rounded border border-neutral-900 hover:border-indigo-900 text-zinc-650 hover:text-indigo-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                          aria-label="Edit demo track"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDemo(d.id)}
                          className="w-7 h-7 rounded border border-neutral-900 hover:border-red-900 text-zinc-650 hover:text-red-400 flex items-center justify-center transition shrink-0 cursor-pointer"
                          aria-label="Delete demo track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent output outreaches sent table */}
          <div className="bg-stone-900/20 p-5 md:p-6 rounded-2xl border border-neutral-900 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800/40 pb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" /> Recent Pitch Activities
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('history')}
                className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                Full History <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {outreaches.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500 font-mono uppercase">
                No historic pitch logs found. Start pitching in New Pitch tab!
              </div>
            ) : (
              <div className="space-y-2" id="recent_outreaches_simple_list">
                {outreaches.slice(0, 3).map(o => {
                  const demo = demos.find(d => d.id === o.demoId);
                  return (
                    <div key={o.id} className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-905 flex justify-between items-center text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">Pitch to {o.targetName || 'Curator contact'}</p>
                        <p className="text-[10px] text-zinc-400 font-mono truncate">
                          Track: {demo?.title || 'Unreleased Sound Demo'} ({o.status})
                        </p>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 font-light whitespace-nowrap ml-3">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Recommended match list */}
        <div className="space-y-6">
          <div className="bg-stone-900/20 p-5 md:p-6 rounded-2xl border border-neutral-900 flex flex-col justify-between space-y-4">
            <div className="border-b border-neutral-800/40 pb-3">
              <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold block">A&R Smart Match matches</span>
              <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Recommended Labels
              </h3>
              <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                Based on your registered profile genres: <span className="text-zinc-400 font-semibold">{profile.genres?.join(', ')}</span>.
              </p>
            </div>

            <div className="space-y-3" id="recommended_labels_cards_dashboard">
              {recommendedLabels.map((lbl) => (
                <div key={lbl.id} className="p-4 bg-neutral-950 border border-neutral-900 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-xs text-white">{lbl.name}</h4>
                      <p className="text-[9px] font-mono text-zinc-500 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {lbl.region}
                      </p>
                    </div>
                    <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/50 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded">
                      {lbl.genre}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                    {lbl.notes.substring(0, 80)}...
                  </p>

                  <div className="flex justify-between items-center pt-1 border-t border-neutral-900/60">
                    <button
                      onClick={() => onToggleFavoriteLabel(lbl.id)}
                      className={`text-[9px] font-mono uppercase tracking-wider ${lbl.isFavorite ? 'text-red-400' : 'text-zinc-600 hover:text-white'} flex items-center gap-1 cursor-pointer`}
                    >
                      <Heart className={`w-3 h-3 ${lbl.isFavorite ? 'fill-current' : ''}`} />
                      Favorite
                    </button>

                    <button
                      onClick={() => onSelectLabelToPitch(lbl)}
                      className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Pitch Label <Send className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('labels')}
              className="w-full text-center py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 hover:border-neutral-800 text-zinc-400 hover:text-white rounded-lg text-[10px] font-mono uppercase tracking-widest transition cursor-pointer"
            >
              Browse entire Label database →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
