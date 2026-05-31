import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  setAccessToken,
  emailAndPasswordSignIn,
  emailAndPasswordSignUp
} from './firebase.js';
import { ArtistProfile, Demo, Target, Outreach, DashboardStats, Label } from './types.js';
import LandingView from './components/LandingView.js';
import OnboardingView from './components/OnboardingView.js';
import DashboardView from './components/DashboardView.js';
import LabelBankView from './components/LabelBankView.js';
import NewPitchView from './components/NewPitchView.js';
import PitchHistoryView from './components/PitchHistoryView.js';
import SubscriptionView from './components/SubscriptionView.js';
import SettingsView from './components/SettingsView.js';
import OutreachFlowView from './components/OutreachFlowView.js';
import AdminView from './components/AdminView.js';
import Logo from './components/Logo.js';
import SupportView from './components/SupportView.js';
import { 
  Loader2, 
  LayoutDashboard, 
  Database, 
  Plus, 
  History, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Mail,
  User as UserIcon,
  ShieldAlert,
  Pencil
} from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Data State
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [demos, setDemos] = useState<Demo[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [outreaches, setOutreaches] = useState<Outreach[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOutreach: 0,
    draftsCount: 0,
    sentCount: 0,
    outreachToday: 0,
    plan: 'free_trial',
    planDaysRemaining: 5,
    dailyPitchLimit: 1
  });

    // Navigation / Workflow toggles
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new_pitch' | 'labels' | 'history' | 'subscription' | 'settings' | 'support'>('dashboard');
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [preselectedLabel, setPreselectedLabel] = useState<Label | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Initialize Auth Listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, cachedToken) => {
        setUser(firebaseUser);
        setToken(cachedToken);
        sessionStorage.setItem('userId', firebaseUser.uid); 
        sessionStorage.setItem('gmailToken', cachedToken); // kept in memory-equivalent for server session proxy
        await loadUserData(firebaseUser.uid, cachedToken);
        setLoading(false);
      },
      async () => {
        const savedUserId = sessionStorage.getItem('userId');
        const savedToken = sessionStorage.getItem('gmailToken');
        if (savedUserId === 'admin_nicholas') {
          try {
            // Guarantee admin user is registered in database upon session restore
            await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: 'admin_nicholas',
                email: 'nicholasleite694@gmail.com',
                name: 'Nicholas Leite (Admin)',
              })
            });
          } catch (e) {
            console.error('Error auto-registering admin on reload:', e);
          }

          const mockAdminUser = {
            uid: 'admin_nicholas',
            email: 'nicholasleite694@gmail.com',
            displayName: 'Nicholas Leite (Admin)',
            emailVerified: true
          } as any;
          setUser(mockAdminUser);
          setToken(savedToken || 'email-password-offline-token');
          await loadUserData('admin_nicholas', savedToken || 'email-password-offline-token');
          setLoading(false);
        } else {
          setUser(null);
          setToken(null);
          setProfile(null);
          sessionStorage.removeItem('userId');
          sessionStorage.removeItem('gmailToken');
          setLoading(false);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  // Monitor returned Stripe checkout success signals
  useEffect(() => {
    if (!user || loading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const planFromUrl = urlParams.get('plan');

    if (sessionId && planFromUrl) {
      const verifySession = async () => {
        try {
          setIsActionLoading(true);
          const res = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.uid
            },
            body: JSON.stringify({ sessionId })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            alert(`🎉 Splendid! Your payment was verified successfully. Your account plan has been upgraded to ${planFromUrl.toUpperCase()}!`);
            await loadUserData(user.uid, token || '');
          } else {
            alert(data.error || 'Verification of your checkout payment failed. Please contact support.');
          }
        } catch (err: any) {
          console.error('Error validating Stripe session:', err);
          alert('Failed to connect to verification server for Stripe checkout validation.');
        } finally {
          setIsActionLoading(false);
          // Gently clean up query string parameters from address bar to prevent redundant runs on refresh
          const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
          window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }
      };

      verifySession();
    }
  }, [user, loading]);

  // Hydrate all user specifics
  const loadUserData = async (uid: string, accessToken: string) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': uid,
      };

      // 1. Load Artist Profile
      const profRes = await fetch('/api/profile', { headers });
      const profData = await profRes.json();
      setProfile(profData);

      if (profData) {
        // 2. Load Demos
        const demosRes = await fetch('/api/demos', { headers });
        setDemos(await demosRes.json());

        // 3. Load Targets
        const targetsRes = await fetch('/api/targets', { headers });
        setTargets(await targetsRes.json());

        // 4. Load Outreaches
        const outRes = await fetch('/api/outreach', { headers });
        setOutreaches(await outRes.json());

        // 5. Load Stats
        const statsRes = await fetch('/api/outreach/stats', { headers });
        setStats(await statsRes.json());

        // 6. Load Labels
        const labelsRes = await fetch('/api/labels', { headers });
        setLabels(await labelsRes.json());
      } else {
        // Even if no profile exists yet, load labels for reference
        const labelsRes = await fetch('/api/labels', { headers });
        setLabels(await labelsRes.json());
      }

      // If logging in as admin_nicholas, route them to Admin Panel on load/restore
      if (uid === 'admin_nicholas') {
        setIsAdminViewActive(true);
      }
    } catch (err) {
      console.error('Error loading account data workspace:', err);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        sessionStorage.setItem('userId', result.user.uid);
        sessionStorage.setItem('gmailToken', result.accessToken);
        await loadUserData(result.user.uid, result.accessToken);
      }
    } catch (err) {
      console.error('Core sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if ((email.trim().toLowerCase() === 'nicholasleite694@gmail.com' || email.trim() === 'Nicholas') && pass === 'admin') {
        try {
          // Register admin user to database
          await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: 'admin_nicholas',
              email: 'nicholasleite694@gmail.com',
              name: 'Nicholas Leite (Admin)',
            })
          });
        } catch (e) {
          console.error('Failed to register admin user on sign-in:', e);
        }

        const mockAdminUser = {
          uid: 'admin_nicholas',
          email: 'nicholasleite694@gmail.com',
          displayName: 'Nicholas Leite (Admin)',
          emailVerified: true
        } as any;
        setUser(mockAdminUser);
        setToken('email-password-offline-token');
        sessionStorage.setItem('userId', 'admin_nicholas');
        sessionStorage.setItem('gmailToken', 'email-password-offline-token');
        await loadUserData('admin_nicholas', 'email-password-offline-token');
        setLoading(false);
        return;
      }

      const result = await emailAndPasswordSignIn(email, pass);
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        sessionStorage.setItem('userId', result.user.uid);
        sessionStorage.setItem('gmailToken', result.accessToken);
        await loadUserData(result.user.uid, result.accessToken);
      }
    } catch (err) {
      console.error('Email credentials sign in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await emailAndPasswordSignUp(email, pass);
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        sessionStorage.setItem('userId', result.user.uid);
        sessionStorage.setItem('gmailToken', result.accessToken);
        await loadUserData(result.user.uid, result.accessToken);
      }
    } catch (err) {
      console.error('Email credentials sign up failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setProfile(null);
      setDemos([]);
      setTargets([]);
      setOutreaches([]);
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('gmailToken');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Profile Save handler
  const handleSaveProfile = async (profileData: Omit<ArtistProfile, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const saved = await res.json();
        setProfile(saved);
        await loadUserData(user.uid, token || '');
      }
    } catch (err) {
      console.error('Failed to configure profile:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Add Demo handler
  const handleAddDemo = async (title: string, link: string, description: string, mood: string, genre: string) => {
    if (!user) return;
    const res = await fetch('/api/demos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ title, link, description, mood, genre }),
    });
    if (res.ok) {
      await loadUserData(user.uid, token || '');
    }
  };

  // Add Target handler
  const handleAddTarget = async (name: string, email: string, type: Target['type'], details: string) => {
    if (!user) return;
    const res = await fetch('/api/targets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ name, email, type, details }),
    });
    if (res.ok) {
      await loadUserData(user.uid, token || '');
    }
  };

  // Delete Demo handler
  const handleDeleteDemo = async (id: string) => {
    if (!user) return;
    const res = await fetch(`/api/demos/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.uid,
      }
    });
    if (res.ok) {
      await loadUserData(user.uid, token || '');
    }
  };

  // Update Demo handler
  const handleUpdateDemo = async (id: string, title: string, link: string, description: string, mood: string, genre: string) => {
    if (!user) return;
    const res = await fetch(`/api/demos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.uid,
      },
      body: JSON.stringify({ title, link, description, mood, genre }),
    });
    if (res.ok) {
      await loadUserData(user.uid, token || '');
    }
  };

  // Delete Target handler
  const handleDeleteTarget = async (id: string) => {
    if (!user) return;
    const res = await fetch(`/api/targets/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.uid,
      }
    });
    if (res.ok) {
      await loadUserData(user.uid, token || '');
    }
  };

  // Toggle Favorite Label handler
  const handleToggleFavoriteLabel = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/labels/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
      });
      if (res.ok) {
        // Reload all data
        await loadUserData(user.uid, token || '');
      }
    } catch (err) {
      console.error('Failed to toggle favorite label:', err);
    }
  };

  // Upgrade Plan handler
  const handleUpgradePlan = async (
    plan: 'free_trial' | 'starter' | 'pro',
    interval?: 'monthly' | 'quarterly' | 'yearly'
  ) => {
    if (!user) return;
    try {
      if (plan === 'free_trial') {
        const res = await fetch('/api/user/upgrade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.uid,
          },
          body: JSON.stringify({ plan }),
        });
        if (res.ok) {
          // Reload all data to catch plan limits changes
          await loadUserData(user.uid, token || '');
        }
        return;
      }

      // Create Stripe checkout session
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({ plan, interval: interval || 'monthly' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize Stripe payment session.');
      }

      if (data.url) {
        // Redirect user to Stripe secure Checkout
        window.location.href = data.url;
      } else {
        throw new Error('Server did not return a valid Checkout redirect URL.');
      }
    } catch (err: any) {
      console.error('Failed to change subscription plan:', err);
      alert(err.message || 'Unable to connect to Stripe payments. Please check your system endpoints.');
    }
  };

  // Outreach workflow completion handler
  const handleFinishOutreachFlow = async () => {
    setIsFlowActive(false);
    if (user) {
      await loadUserData(user.uid, token || '');
    }
  };

  // --- RENDERING PATH ORCHESTRATOR ---

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 space-y-4" id="global_loader">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">Syncing Workspace Session...</span>
      </div>
    );
  }

  // View A: Unauthenticated Space
  if (!user || !token) {
    return (
      <LandingView 
        onSignIn={handleSignIn} 
        onEmailSignIn={handleEmailSignIn} 
        onEmailSignUp={handleEmailSignUp} 
        isLoading={loading} 
      />
    );
  }

  // View Admin Space if authorized and active
  if (user.uid === 'admin_nicholas' && isAdminViewActive) {
    return (
      <AdminView onBackToApp={() => setIsAdminViewActive(false)} />
    );
  }

  // View B: Onboarding / Profile Setup Space
  if (!profile) {
    return (
      <OnboardingView 
        onSaveProfile={handleSaveProfile} 
        isSaving={isActionLoading} 
        userEmail={user.email || undefined} 
      />
    );
  }

  // Side bar Navigation items database
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'labels', label: 'Label Data Bank', icon: Database },
    { id: 'new_pitch', label: 'New Pitch', icon: Plus },
    { id: 'history', label: 'Pitch History', icon: History },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            profile={profile}
            demos={demos}
            targets={targets}
            outreaches={outreaches}
            stats={stats}
            labels={labels}
            onAddDemo={handleAddDemo}
            onDeleteDemo={handleDeleteDemo}
            onUpdateDemo={handleUpdateDemo}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
            onSelectLabelToPitch={(lbl) => {
              setPreselectedLabel(lbl);
              setActiveTab('new_pitch');
            }}
            onToggleFavoriteLabel={handleToggleFavoriteLabel}
            userEmail={user.email || undefined}
            onLogout={handleLogout}
            onEditProfile={() => setIsEditingProfile(true)}
          />
        );
      case 'labels':
        return (
          <LabelBankView
            labels={labels}
            onToggleFavorite={handleToggleFavoriteLabel}
            onPitchLabel={(lbl) => {
              setPreselectedLabel(lbl);
              setActiveTab('new_pitch');
            }}
            userPlan={stats.plan}
          />
        );
      case 'new_pitch':
        return (
          <NewPitchView
            demos={demos}
            targets={targets}
            labels={labels}
            onAddDemo={handleAddDemo}
            onAddTarget={handleAddTarget}
            onFinishFlow={async () => {
              if (user) {
                await loadUserData(user.uid, token || '');
              }
              setActiveTab('dashboard');
            }}
            userPlan={stats.plan}
            preselectedLabel={preselectedLabel}
            clearPreselectedLabel={() => setPreselectedLabel(null)}
          />
        );
      case 'history':
        return (
          <PitchHistoryView
            outreaches={outreaches}
            demos={demos}
            targets={targets}
            labels={labels}
          />
        );
      case 'subscription':
        return (
          <SubscriptionView
            currentPlan={stats.plan}
            daysRemaining={stats.planDaysRemaining}
            pitchTodayCount={stats.outreachToday}
            onUpgrade={handleUpgradePlan}
          />
        );
      case 'settings':
        return (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleSaveProfile}
            userEmail={user.email || undefined}
          />
        );
      case 'support':
        return (
          <SupportView />
        );
      default:
        return null;
    }
  };

  const bottomMenuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'labels', label: 'Labels', icon: Database },
    { id: 'new_pitch', label: 'Pitch', icon: Plus },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  // View C: Core Authorized Dashboard Workspace Layout
  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 flex flex-col md:flex-row pb-24 md:pb-0" id="main_app_layout">
      {/* BRANDING HEADER - Mobile screens only */}
      <div className="flex md:hidden items-center justify-between px-5 py-3.5 bg-stone-900/40 backdrop-blur-md border-b border-neutral-900/60 sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center p-1 bg-black text-white rounded-lg font-bold shadow-inner">
            <Logo size={20} strokeWidth={24} />
          </div>
          <div>
            <h1 className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white">PROMO FLOW</h1>
          </div>
        </div>

        {/* Small golden support button mobile next to profile bubble */}
        <button
          onClick={() => setActiveTab('support')}
          className={`ml-auto mr-3 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider transition duration-300 flex items-center gap-1 select-none cursor-pointer border ${
            activeTab === 'support'
              ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
              : 'bg-amber-500/10 hover:bg-amber-550/25 border-amber-500/30 hover:border-amber-400 text-amber-400'
          }`}
        >
          Support 💛
        </button>

        {/* Profile/Menu trigger bubble */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center justify-center p-0.5 rounded-full border border-neutral-800 focus:outline-none cursor-pointer"
          id="mobile_profile_bubble_toggle"
        >
          <div className="relative w-8 h-8 bg-neutral-900 hover:bg-neutral-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-300">
            {profile.artistName ? profile.artistName.charAt(0).toUpperCase() : 'A'}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
          </div>
        </button>
      </div>

      {/* MOBILE NAV PANEL DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sliding Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-72 bg-neutral-900 border-l border-neutral-800/80 p-6 z-50 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center p-0.5 bg-neutral-950 text-white rounded font-bold">
                      <Logo size={14} strokeWidth={24} />
                    </div>
                    <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white">Promo Flow</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-neutral-800/60 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Overview */}
                <div className="p-3 bg-stone-950/50 rounded-xl border border-neutral-800/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">Artist Profile</span>
                    <button 
                      onClick={() => {
                        setIsEditingProfile(true);
                        setMobileMenuOpen(false);
                      }}
                      className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 transition flex items-center gap-0.5 select-none cursor-pointer"
                    >
                      <Pencil className="w-2.5 h-2.5" /> Edit
                    </button>
                  </div>
                  <p className="font-semibold text-xs text-white truncate">{profile.artistName || 'Independent Artist'}</p>
                  <div className="inline-flex py-0.5 px-1.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 text-[8px] font-mono uppercase tracking-wider font-semibold">
                    {stats.plan.replace('_', ' ')} ACTIVE
                  </div>
                </div>

                {/* Drawer Core Navigation Tree */}
                <nav className="space-y-1.5">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 px-3 block mb-1">Configuration</span>
                  
                  <button
                    onClick={() => {
                      setActiveTab('subscription');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'subscription'
                        ? 'bg-zinc-100 text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-neutral-800/40'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    Subscription Plan
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-zinc-100 text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-neutral-800/40'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 shrink-0" />
                    Artist Settings
                  </button>

                  {user?.uid === 'admin_nicholas' && (
                    <button
                      onClick={() => {
                        setIsAdminViewActive(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/20 border border-emerald-900 border-dashed transition mt-4 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-emerald-400 animate-pulse" />
                      System Control Center 🛡️
                    </button>
                  )}
                </nav>
              </div>

              {/* Drawer Footer info */}
              <div className="pt-4 border-t border-neutral-800/60 space-y-3.5">
                <div className="px-2">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-650 block">CONNECTED MAIL</span>
                  <div className="text-[10px] font-mono text-zinc-400 truncate hover:text-white transition" title={user.email || ''}>
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-red-500 hover:text-red-400 hover:bg-red-950/10 cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  Logout Session
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING BOTTOM NAVIGATION BAR - Mobile Screens Only */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-35" id="mobile_bottom_nav">
        <div className="bg-neutral-900/90 backdrop-blur-md rounded-2xl border border-neutral-800/80 p-2 shadow-2xl flex items-center justify-around">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className="relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all cursor-pointer min-w-[50px] select-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active_pill"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white scale-105' : 'text-zinc-500 hover:text-zinc-300'}`} />
                <span className={`text-[9px] font-mono tracking-wider mt-1 transition-colors duration-200 ${isActive ? 'text-white font-semibold' : 'text-zinc-500'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.span 
                    layoutId="active_dot"
                    className="absolute -top-1 w-1.5 h-1.5 bg-white rounded-full" 
                  />
                )}
              </button>
            );
          })}
          
          {/* Menu / More button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all cursor-pointer min-w-[50px] select-none ${
              mobileMenuOpen ? 'text-white' : 'text-zinc-500'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {mobileMenuOpen && (
              <motion.div
                layoutId="active_pill"
                className="absolute inset-0 bg-white/5 rounded-xl border border-white/5"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <Menu className={`w-5 h-5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90 text-white' : 'text-zinc-500 hover:text-zinc-300'}`} />
            <span className={`text-[9px] font-mono tracking-wider mt-1 transition-colors duration-200 ${mobileMenuOpen ? 'text-white font-semibold' : 'text-zinc-500'}`}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* CORE LEFT RESPONSIVE SIDEBAR - Desktop screens */}
      <aside className="hidden md:flex flex-col w-64 xl:w-72 bg-stone-900/40 border-r border-neutral-900 p-6 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Executive Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center p-1 font-bold shadow-inner">
                <Logo size={24} strokeWidth={24} />
              </div>
              <div>
                <h1 className="font-display font-bold text-xs uppercase tracking-[0.14em] text-white">PROMO FLOW</h1>
              </div>
            </div>

            {/* Small golden donate button next to logo */}
            <button
              onClick={() => setActiveTab('support')}
              className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider transition duration-300 flex items-center gap-1 select-none cursor-pointer border ${
                activeTab === 'support'
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                  : 'bg-amber-500/10 hover:bg-amber-550/25 border-amber-500/30 hover:border-amber-400 text-amber-400 animate-pulse'
              }`}
              title="Support our work of producers for producers"
            >
              <span>Support 💛</span>
            </button>
          </div>

          {/* Active Artist Card */}
          <div className="p-4 bg-stone-950/50 rounded-2xl border border-neutral-900/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Public Profile</span>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 transition flex items-center gap-0.5 select-none cursor-pointer"
              >
                <Pencil className="w-2.5 h-2.5" /> Edit
              </button>
            </div>
            <p className="font-semibold text-xs text-white truncate max-w-[180px]">{profile.artistName || 'Independent Producer'}</p>
            <div className="inline-flex py-0.5 px-1.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 font-mono text-[9px] uppercase tracking-wider">
              {stats.plan.replace('_', ' ')}
            </div>
          </div>

          {/* Nav tree */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive 
                      ? 'bg-zinc-100 text-black font-semibold shadow' 
                      : 'text-zinc-400 hover:text-white hover:bg-neutral-900/25'
                  }`}
                  id={`nav_link_${item.id}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </button>
              );
            })}

            {user?.uid === 'admin_nicholas' && (
              <button
                onClick={() => setIsAdminViewActive(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/25 hover:bg-emerald-950/40 border border-emerald-900 border-dashed transition mt-4 cursor-pointer"
                id="nav_link_admin_control"
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-emerald-400 animate-pulse" />
                System Control Center 🛡️
              </button>
            )}
          </nav>
        </div>

        {/* User Identity context segment */}
        <div className="pt-4 border-t border-neutral-900/60 space-y-3">
          <div className="px-2">
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-650 block">CONNECTED MAIL</span>
            <div className="text-[10px] font-mono text-zinc-400 truncate max-w-[200px] hover:text-white transition title={user.email || ''}">
              {user.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-neutral-900/20 cursor-pointer"
            id="session_logout_link"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* DETAILED CONTENT SCROLLABLE CANVAS CONTAINER */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 md:p-8 xl:p-10 max-w-7xl mx-auto w-full" id="root_screen_pane">
        {renderActiveView()}
      </main>

      {/* Multi-step Outreach Generation Slider Overlay */}
      {isFlowActive && (
        <OutreachFlowView
          demos={demos}
          targets={targets}
          onCancel={() => setIsFlowActive(false)}
          onFinishFlow={handleFinishOutreachFlow}
        />
      )}

      {/* Onboarding edit profile modal overlay */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-neutral-950 overflow-y-auto">
          <OnboardingView
            onSaveProfile={async (profileData) => {
              setIsActionLoading(true);
              try {
                await handleSaveProfile(profileData);
                setIsEditingProfile(false);
              } catch (err) {
                console.error(err);
              } finally {
                setIsActionLoading(false);
              }
            }}
            isSaving={isActionLoading}
            userEmail={user?.email || undefined}
            initialProfile={profile}
            onCancel={() => setIsEditingProfile(false)}
          />
        </div>
      )}
    </div>
  );
}
