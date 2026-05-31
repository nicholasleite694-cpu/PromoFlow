import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  ShieldAlert, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  ArrowLeft,
  X,
  Sparkles,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  plan: 'free_trial' | 'starter' | 'pro';
  artistName: string;
  demosCount: number;
  outreachesSent: number;
  outreachesDraft: number;
  repliesReceived: number;
}

interface AdminOutreach {
  id: string;
  userId: string;
  userName: string;
  demoId: string;
  targetId: string;
  targetName: string;
  targetEmail: string;
  status: 'draft' | 'approved' | 'sent';
  emailSubject: string;
  emailBody: string;
  sentAt?: string;
  createdAt: string;
  responseStatus?: 'no_reply' | 'replied_interested' | 'replied_passed';
  responseBody?: string;
  respondedAt?: string;
}

interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  totalDemos: number;
  totalPitches: number;
  sentCount: number;
  draftsCount: number;
  repliesCount: number;
  interestedCount: number;
  passedCount: number;
  responseRate: number;
  outreaches: AdminOutreach[];
}

interface AdminViewProps {
  onBackToApp: () => void;
}

export default function AdminView({ onBackToApp }: AdminViewProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'pitches'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('All');
  const [selectedResponseFilter, setSelectedResponseFilter] = useState<string>('All');
  const [selectedOutreach, setSelectedOutreach] = useState<AdminOutreach | null>(null);
  
  // Confirmation state for user deletion
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': 'admin_nicholas'
      };

      const usersRes = await fetch('/api/admin/users', { headers });
      const statsRes = await fetch('/api/admin/stats', { headers });

      if (usersRes.ok && statsRes.ok) {
        setUsers(await usersRes.json());
        setStats(await statsRes.json());
      } else {
        console.error('Failed to authenticate administrative boundaries.');
      }
    } catch (err) {
      console.error('Core administrative request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteError(null);
    
    if (deleteConfirmText.toLowerCase() !== 'remove') {
      setDeleteError('Please type "REMOVE" in the input field to authenticate deletion.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin_nicholas'
        }
      });

      if (res.ok) {
        setDeletingUser(null);
        setDeleteConfirmText('');
        await loadAdminData();
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'User deletion transaction failed.');
      }
    } catch (error: any) {
      setDeleteError(error.message || 'Server error occurred.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-stone-100" id="admin_loading_state">
        <Activity className="w-8 h-8 text-neutral-400 animate-spin mb-4" />
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Decrypting System Registers...</p>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.artistName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlanFilter === 'All' || u.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredPitches = (stats?.outreaches || []).filter(o => {
    const matchesSearch = (o.targetName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (o.emailSubject || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesResponse = true;
    if (selectedResponseFilter === 'Interested') {
      matchesResponse = o.responseStatus === 'replied_interested';
    } else if (selectedResponseFilter === 'Passed') {
      matchesResponse = o.responseStatus === 'replied_passed';
    } else if (selectedResponseFilter === 'No Reply') {
      matchesResponse = o.responseStatus === 'no_reply' || !o.responseStatus;
    }

    return matchesSearch && matchesResponse;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-200" id="admin_area_root">
      {/* Top Admin Header Bar */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-100 text-neutral-950 font-mono text-xs font-bold px-2 py-1.5 rounded-md uppercase tracking-wider">
              ADMIN CONTROL
            </div>
            <div>
              <h1 className="text-sm font-display font-medium text-white tracking-tight flex items-center gap-1.5">
                Nicholas Leite <span className="text-zinc-500 font-normal">| Principal Curator</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">
                Node Ingress: nicholasleite694@gmail.com
              </p>
            </div>
          </div>
          
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-zinc-300 hover:text-white font-mono text-[10px] uppercase tracking-wider transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return To App
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex bg-neutral-900/40 p-1.5 rounded-xl border border-neutral-900/60 max-w-md">
          <button
            onClick={() => { setActiveSubTab('overview'); setSearchTerm(''); }}
            className={`flex-1 py-2 text-center rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${activeSubTab === 'overview' ? 'bg-zinc-100 text-neutral-950 font-bold' : 'text-zinc-500 hover:text-stone-300'}`}
          >
            Sytem Overview
          </button>
          <button
            onClick={() => { setActiveSubTab('users'); setSearchTerm(''); }}
            className={`flex-1 py-2 text-center rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${activeSubTab === 'users' ? 'bg-zinc-100 text-neutral-950 font-bold' : 'text-zinc-500 hover:text-stone-300'}`}
          >
            Manage Users ({users.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('pitches'); setSearchTerm(''); }}
            className={`flex-1 py-2 text-center rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${activeSubTab === 'pitches' ? 'bg-zinc-100 text-neutral-950 font-bold' : 'text-zinc-500 hover:text-stone-300'}`}
          >
            Data Audits ({stats?.totalPitches || 0})
          </button>
        </div>

        {/* 1. SYSTEM OVERVIEW PAGE */}
        {activeSubTab === 'overview' && stats && (
          <div className="space-y-8" id="admin_overview_pane">
            {/* Stats Grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-stone-900/20 border border-neutral-900 rounded-2xl space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                  ACTIVE USERS <Users className="w-3.5 h-3.5" />
                </p>
                <p className="text-3xl font-display font-bold text-white">{stats.totalUsers}</p>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-normal">
                  {stats.totalProfiles} Complete Artist Profiles Managed
                </p>
              </div>

              <div className="p-5 bg-stone-900/20 border border-neutral-900 rounded-2xl space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                  TOTAL AUDIOS/DEMOS <TrendingUp className="w-3.5 h-3.5" />
                </p>
                <p className="text-3xl font-display font-bold text-white">{stats.totalDemos}</p>
                <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-normal">
                  Uploaded & Stored securely
                </p>
              </div>

              <div className="p-5 bg-stone-900/20 border border-neutral-900 rounded-2xl space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                  OUTBOUND PITCHES <Mail className="w-3.5 h-3.5" />
                </p>
                <p className="text-3xl font-display font-bold text-white">{stats.totalPitches}</p>
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-normal">
                  <span className="text-zinc-100 font-medium">{stats.sentCount} sent</span> • {stats.draftsCount} local drafts
                </p>
              </div>

              <div className="p-5 bg-stone-900/20 border-emerald-950/40 border rounded-2xl space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center justify-between">
                  A&R REPLY RATE <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                </p>
                <p className="text-3xl font-display font-bold text-emerald-400">{stats.responseRate}%</p>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-normal">
                  {stats.repliesCount} Simulated A&R Responses Recorded
                </p>
              </div>
            </div>

            {/* In-depth Response rate analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie/Ratio card */}
              <div className="p-6 bg-stone-900/30 rounded-2xl border border-neutral-900 space-y-4 col-span-1">
                <h3 className="text-xs font-mono uppercase tracking-widest text-white border-b border-neutral-900 pb-3 block">
                  A&R DECISIONS STREAM
                </h3>
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> INTEREST TYPE
                      </span>
                      <span className="text-white font-mono uppercase">{stats.interestedCount} ({stats.repliesCount > 0 ? ((stats.interestedCount / stats.repliesCount)*100).toFixed(0): 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${stats.repliesCount > 0 ? (stats.interestedCount / stats.repliesCount) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-amber-400 font-mono font-medium flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> CONSTRUCTIVE PASS
                      </span>
                      <span className="text-white font-mono uppercase">{stats.passedCount} ({stats.repliesCount > 0 ? ((stats.passedCount / stats.repliesCount)*100).toFixed(0): 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${stats.repliesCount > 0 ? (stats.passedCount / stats.repliesCount) * 100 : 0}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-500 font-mono font-medium flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-650" /> NO DEEP FEEDBACK (PENDING)
                      </span>
                      <span className="text-white font-mono uppercase">{stats.sentCount - stats.repliesCount} ({stats.sentCount > 0 ? (((stats.sentCount - stats.repliesCount) / stats.sentCount)*100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-650" style={{ width: `${stats.sentCount > 0 ? ((stats.sentCount - stats.repliesCount) / stats.sentCount) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/60 border border-neutral-900 rounded-xl text-[10px] leading-relaxed text-zinc-500">
                  <span className="font-mono text-zinc-300 font-medium block mb-0.5">💡 Performance Note:</span>
                  The system measures response trends from premium global labels. Current tracking shows organic house (<span className="text-emerald-400">Keinemusik</span> style) leads international response engagement ratios.
                </div>
              </div>

              {/* Recent activity stream */}
              <div className="p-6 bg-stone-900/30 rounded-2xl border border-neutral-900 space-y-4 col-span-1 lg:col-span-2">
                <h3 className="text-xs font-mono uppercase tracking-widest text-white border-b border-neutral-900 pb-3 flex justify-between items-center">
                  PLATFORM OUTBOUND STREAM 
                  <span className="text-[9px] font-mono text-emerald-400 lowercase bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded">live stream</span>
                </h3>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {stats.outreaches.slice(0, 5).map(out => (
                    <div key={out.id} className="p-3 bg-neutral-950/50 rounded-xl border border-neutral-900 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-stone-300 font-bold uppercase">{out.userName}</span>
                          <span className="text-zinc-650">➔</span>
                          <span className="text-xs font-semibold text-white">{out.targetName}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 italic">"{out.emailSubject}"</p>
                        <p className="text-[9px] font-mono text-zinc-600">Pitched: {out.sentAt ? new Date(out.sentAt).toLocaleDateString() : new Date(out.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                          out.status === 'sent' 
                            ? 'bg-emerald-950/25 border-emerald-900 text-emerald-400' 
                            : 'bg-zinc-950 border-neutral-900 text-zinc-500'
                        }`}>
                          {out.status}
                        </span>

                        {out.responseStatus && out.responseStatus !== 'no_reply' && (
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded mt-1 ${
                            out.responseStatus === 'replied_interested' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          }`}>
                            {out.responseStatus === 'replied_interested' ? 'Interested' : 'Constructive Pass'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CHOOSE USERS TABLE */}
        {activeSubTab === 'users' && (
          <div className="space-y-6 animate-fadeIn" id="admin_users_pane">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900/30 p-4 rounded-xl border border-neutral-900">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter users by email, name, artist role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 hover:border-neutral-800 rounded-lg text-xs text-white outline-none transition animate-none"
                />
              </div>

              <div className="flex gap-2 items-center w-full sm:w-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Plan:</span>
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-lg text-xs text-zinc-300 outline-none focus:border-neutral-700 transition w-full sm:w-auto"
                >
                  <option value="All">All Tiers</option>
                  <option value="free_trial">Free Trial</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-900 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-neutral-300">
                  <thead className="bg-stone-900/40 border-b border-neutral-900 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="p-4 font-semibold">User Details</th>
                      <th className="p-4 font-semibold">Artist Moniker</th>
                      <th className="p-4 font-semibold">Joined At</th>
                      <th className="p-4 font-semibold">Plan Level</th>
                      <th className="p-4 font-semibold text-center">Demos</th>
                      <th className="p-4 font-semibold text-center">Sent Pitches</th>
                      <th className="p-4 font-semibold text-center">A&R Replies</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-12 text-center text-zinc-500 font-mono uppercase">
                          No users found matching query params.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-stone-900/10 transition">
                          <td className="p-4 space-y-0.5">
                            <div className="font-semibold text-white text-sm">{u.name}</div>
                            <div className="text-[11px] text-zinc-500 font-mono">{u.email}</div>
                            <div className="text-[9px] text-zinc-600 font-mono">UID: {u.id}</div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-[10px] tracking-wider px-2 py-0.5 bg-zinc-900 text-stone-300 rounded uppercase">
                              {u.artistName}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-400 text-xs">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-mono font-medium px-2.5 py-1 rounded-full border uppercase ${
                              u.plan === 'pro' 
                                ? 'bg-indigo-950/40 border-indigo-900 text-indigo-400' 
                                : u.plan === 'starter'
                                ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'
                                : 'bg-zinc-900/30 border-neutral-800 text-zinc-400'
                            }`}>
                              {u.plan?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono font-medium text-white text-sm">
                            {u.demosCount}
                          </td>
                          <td className="p-4 text-center font-mono font-medium text-white text-sm">
                            {u.outreachesSent}
                          </td>
                          <td className="p-4 text-center">
                            {u.repliesReceived > 0 ? (
                              <span className="font-mono font-medium text-emerald-400 text-sm bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                                {u.repliesReceived}
                              </span>
                            ) : (
                              <span className="text-zinc-650 font-mono text-xs">0</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {u.id.startsWith('user_seed_') ? (
                              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest pr-2.5">
                                Seed User
                              </span>
                            ) : (
                              <button
                                onClick={() => setDeletingUser(u)}
                                className="p-2 bg-rose-950/10 hover:bg-rose-950/30 border border-rose-950/30 hover:border-rose-900 rounded-lg text-rose-400 transition cursor-pointer"
                                title="Remove User completely"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. PLATFORM PITCHES AUDIT FEED */}
        {activeSubTab === 'pitches' && (
          <div className="space-y-6 animate-fadeIn" id="admin_pitches_pane">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900/30 p-4 rounded-xl border border-neutral-900">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by label target or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-900 focus:border-neutral-700 hover:border-neutral-800 rounded-lg text-xs text-white outline-none transition"
                />
              </div>

              <div className="flex gap-2 items-center w-full sm:w-auto">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Filter Response:</span>
                <select
                  value={selectedResponseFilter}
                  onChange={(e) => setSelectedResponseFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-lg text-xs text-zinc-300 outline-none focus:border-neutral-700 transition w-full sm:w-auto"
                >
                  <option value="All">All Responses</option>
                  <option value="Interested">Interested Only</option>
                  <option value="Passed">Constructive Passes</option>
                  <option value="No Reply">Pending / No Reply</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pitches list */}
              <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredPitches.length === 0 ? (
                  <div className="p-8 text-center bg-stone-900/10 rounded-2xl border border-neutral-900/60 text-zinc-500 font-mono uppercase">
                    No matching pitch emails found.
                  </div>
                ) : (
                  filteredPitches.map(out => (
                    <div 
                      key={out.id}
                      onClick={() => setSelectedOutreach(out)}
                      className={`p-4 rounded-2xl border transition text-left cursor-pointer flex justify-between gap-3 items-start ${
                        selectedOutreach?.id === out.id 
                          ? 'bg-neutral-900 border-zinc-700' 
                          : 'bg-stone-900/20 border-neutral-905 hover:bg-stone-900/45 hover:border-neutral-800'
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[8px] px-1 bg-zinc-950 text-stone-400 border border-neutral-900 rounded uppercase truncate max-w-28">{out.userName}</span>
                          <span className="text-zinc-650 font-mono text-[9px]">➔</span>
                          <span className="text-xs font-semibold text-white text-ellipsis overflow-hidden truncate max-w-28">{out.targetName}</span>
                        </div>
                        <h4 className="font-display font-medium text-xs leading-normal text-white truncate">{out.emailSubject}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono">Date: {out.sentAt ? new Date(out.sentAt).toLocaleDateString() : new Date(out.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="shrink-0 flex flex-col items-end justify-between h-full space-y-4">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase border ${
                          out.status === 'sent' 
                            ? 'bg-emerald-950/20 border-emerald-950 text-emerald-400' 
                            : 'bg-zinc-950 border-neutral-900 text-zinc-500'
                        }`}>
                          {out.status}
                        </span>

                        {out.responseStatus && out.responseStatus !== 'no_reply' && (
                          <div className={`w-2 h-2 rounded-full ${out.responseStatus === 'replied_interested' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Detailed view */}
              <div className="lg:col-span-2">
                {selectedOutreach ? (
                  <div className="p-6 bg-stone-900/20 rounded-2xl border border-neutral-900 space-y-6 text-left shadow-3xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-900 pb-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">Outreach Channel</span>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm font-semibold text-white">{selectedOutreach.userName}</span>
                          <span className="text-zinc-500">➔</span>
                          <span className="text-sm font-semibold text-zinc-300">{selectedOutreach.targetName} ({selectedOutreach.targetEmail})</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">Dispatched</span>
                        <span className="text-xs text-white font-mono mt-1 block">
                          {selectedOutreach.sentAt ? new Date(selectedOutreach.sentAt).toLocaleString() : 'Saving as Local Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Email body detail */}
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 block">SUBMITTED EMAIL PITCH:</span>
                      <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-900 text-xs text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap max-h-64 overflow-y-auto">
                        <span className="font-serif font-bold text-white text-xs border-b border-neutral-900 pb-2 mb-3 block">Subject: {selectedOutreach.emailSubject}</span>
                        {selectedOutreach.emailBody}
                      </div>
                    </div>

                    {/* Simulated response log */}
                    <div className="space-y-3.5 pt-2 border-t border-neutral-900">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> SIMULATED RECIPIENT FEEDBACK:
                      </span>

                      {selectedOutreach.responseStatus && selectedOutreach.responseStatus !== 'no_reply' ? (
                        <div className={`p-4 rounded-xl border space-y-2.5 text-xs text-neutral-300 ${
                          selectedOutreach.responseStatus === 'replied_interested' 
                            ? 'bg-emerald-950/10 border-emerald-900/50' 
                            : 'bg-amber-950/10 border-amber-900/50'
                        }`}>
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                            <span className={selectedOutreach.responseStatus === 'replied_interested' ? 'text-emerald-400' : 'text-amber-400'}>
                              {selectedOutreach.responseStatus === 'replied_interested' ? '● Interested - WAV requested' : '● Pass - Constructive feedback'}
                            </span>
                            <span className="text-zinc-500">
                              Responded: {selectedOutreach.respondedAt ? new Date(selectedOutreach.respondedAt).toLocaleDateString() : 'Simulated'}
                            </span>
                          </div>

                          <p className="leading-relaxed font-light italic">
                            "{selectedOutreach.responseBody}"
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-neutral-950/45 rounded-xl border border-neutral-900/75 text-center text-zinc-500 text-xs font-mono py-6">
                          A&R REVIEW PENDING. NO SIMULATED RESPONSE HAS REGISTERED YET.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-16 text-center bg-stone-900/10 border border-neutral-900 border-dashed rounded-2xl text-zinc-500 font-mono uppercase h-72 flex flex-col items-center justify-center">
                    <Mail className="w-8 h-8 text-zinc-650 mb-3" />
                    Select a pitch email details log from the left column to audit strategic details and responses.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CASCADE DELETE CONFIRM DIALOG */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-[5px] z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border border-rose-950 p-6 rounded-2xl text-left space-y-4 shadow-3xl">
            <div className="flex items-center gap-3 text-rose-400 font-semibold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              CONFIRM CASCADE DELETION TRANSACTION
            </div>

            <p className="text-xs text-neutral-300 leading-normal font-sans">
              You are completely removing <span className="font-semibold text-white">{deletingUser.name}</span> (<span className="text-zinc-400 font-mono">{deletingUser.email}</span>) from the platform server stack. 
              This action is <span className="text-rose-400 font-medium font-mono uppercase">permanent & irreversible</span>. This will securely purge:
            </p>

            <ul className="text-[10px] font-mono text-rose-400 bg-rose-950/10 p-3.5 rounded-xl border border-rose-950/50 space-y-2 uppercase leading-relaxed">
              <li>• Purge Entire User Account Metadata ({deletingUser.plan} Plan)</li>
              <li>• Cascade Clean {deletingUser.demosCount} Audios/Demos from storage</li>
              <li>• Flush {deletingUser.outreachesSent + deletingUser.outreachesDraft} total Sent Outreaches / Draft history</li>
              <li>• Remove Favorites linkages ({deletingUser.repliesReceived} replies log)</li>
            </ul>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                Type <span className="text-white font-mono font-bold font-sans">"REMOVE"</span> to authorize transaction:
              </label>
              <input
                required
                type="text"
                placeholder="REMOVE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-rose-900 rounded-lg text-xs font-mono uppercase tracking-widest text-rose-400 outline-none transition"
              />
            </div>

            {deleteError && (
              <p className="text-[10px] font-mono text-rose-500 uppercase font-medium">{deleteError}</p>
            )}

            <div className="flex gap-2 justify-end pt-2 text-xs">
              <button
                onClick={() => { setDeletingUser(null); setDeleteConfirmText(''); setDeleteError(null); }}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-900 bg-transparent text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg transition uppercase cursor-pointer"
              >
                Execute Permanent Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
