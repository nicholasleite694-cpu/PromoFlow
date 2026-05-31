import React, { useState } from 'react';
import { Calendar, Check, Star, Shield, Zap, Sparkles, Clock } from 'lucide-react';

interface SubscriptionViewProps {
  currentPlan: 'free_trial' | 'starter' | 'pro';
  daysRemaining: number;
  pitchTodayCount: number;
  onUpgrade: (plan: 'free_trial' | 'starter' | 'pro', interval?: 'monthly' | 'quarterly' | 'yearly') => Promise<void>;
}

export default function SubscriptionView({ currentPlan, daysRemaining, pitchTodayCount, onUpgrade }: SubscriptionViewProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const handleUpgradeClick = async (tier: 'free_trial' | 'starter' | 'pro', detailsLabel: string) => {
    try {
      if (tier === 'free_trial') {
        await onUpgrade(tier);
        alert(`Plan updated. Your active plan is now updated to: FREE TRIAL`);
        return;
      }
      
      const confirmText = `Are you sure you want to subscribe to the ${tier.toUpperCase()} plan under the ${billingInterval.toUpperCase()} deal?\n\nDetails: ${detailsLabel}\n\nYou will now be redirected securely to Stripe Checkout to finalize your payment test.`;
      if (window.confirm(confirmText)) {
        await onUpgrade(tier, billingInterval);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic pricing states
  let starterPrice = '$15';
  let starterSub = '/ mo';
  let starterTotalLabel = 'Billed month-to-month';
  let starterSubmitMsg = 'Starter $15 month-to-month subscription';

  if (billingInterval === 'quarterly') {
    starterPrice = '$12';
    starterSub = '/ mo';
    starterTotalLabel = 'Save 20% • $36 billed upfront every 3-Months';
    starterSubmitMsg = 'Starter 3-Month upfront deal ($36 total)';
  } else if (billingInterval === 'yearly') {
    starterPrice = '$9';
    starterSub = '/ mo';
    starterTotalLabel = 'Save 40% • $108 billed upfront Annually';
    starterSubmitMsg = 'Starter Yearly upfront deal ($108 total)';
  }

  let proPrice = '$39';
  let proSub = '/ mo';
  let proTotalLabel = 'Billed month-to-month';
  let proSubmitMsg = 'Pro $39 month-to-month subscription';

  if (billingInterval === 'quarterly') {
    proPrice = '$32';
    proSub = '/ mo';
    proTotalLabel = 'Save 18% • $96 billed upfront every 3-Months';
    proSubmitMsg = 'Pro 3-Month upfront deal ($96 total)';
  } else if (billingInterval === 'yearly') {
    proPrice = '$24';
    proSub = '/ mo';
    proTotalLabel = 'Save 38% • $288 billed upfront Annually';
    proSubmitMsg = 'Pro Yearly upfront deal ($288 total)';
  }

  return (
    <div className="space-y-8" id="subscription_view_wrapper">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-5">
        <h2 className="text-2xl font-display font-medium text-white tracking-tight">Subscription Plan Matrix</h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Manage your subscription limits, active quotas, and unreleased music pitching capability settings with flexible deals.
        </p>
      </div>

      {/* Trial Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="subscription_status_hub">
        <div className="bg-stone-900/40 p-5 rounded-2xl border border-neutral-900 flex items-center gap-4 col-span-2">
          <div className="w-12 h-12 rounded-xl bg-neutral-950 flex items-center justify-center border border-neutral-850 shrink-0 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Current active tier</p>
            <h3 className="text-sm font-semibold text-white uppercase font-mono mt-0.5">
              {currentPlan.replace('_', ' ')} Plan
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1">
              You have sent <span className="text-white font-mono font-bold">{pitchTodayCount}</span> pitches today. 
              {currentPlan === 'free_trial' && ` Your trial phase has ${daysRemaining} days remaining.`}
              {currentPlan === 'starter' && ` Starter accounts permit up to 3 pitches daily.`}
              {currentPlan === 'pro' && ` Pro accounts enjoy uncapped pitching with maximum priority.`}
            </p>
          </div>
        </div>

        {currentPlan === 'free_trial' && (
          <div className="bg-amber-950/20 p-5 rounded-2xl border border-amber-900/30 flex flex-col justify-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 block mb-0.5">Countdown Timer</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-medium text-white font-mono">{daysRemaining}</span>
              <span className="text-[11px] text-amber-500 font-mono">Days Left</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight mt-1">Free introductory trial window.</p>
          </div>
        )}
      </div>

      {/* Flexible Billing Interval Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-900/40 p-4 rounded-2xl border border-neutral-900 gap-4" id="billing_interval_tab_bar">
        <div>
          <h4 className="text-xs font-semibold text-white">Choose Your Package Duration</h4>
          <p className="text-[10px] text-zinc-450 mt-0.5">Enjoy premium features at discounted monthly equivalents with multi-month upfront deals.</p>
        </div>
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-850/60 self-start sm:self-auto gap-1">
          {[
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: '3-Months Deal 🚀', desc: 'Billed as 1 deal' },
            { id: 'yearly', label: 'Yearly Plan ✨', desc: '40% discount' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setBillingInterval(item.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer select-none text-center ${
                billingInterval === item.id
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-neutral-900/45'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2" id="plans_comparison_matrix">
        {/* Tier 1: Free Trial */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 ${
          currentPlan === 'free_trial' 
            ? 'bg-neutral-950/40 border-zinc-500 ring-1 ring-zinc-500' 
            : 'bg-stone-900/10 border-neutral-900'
        }`}>
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Trial Tier</span>
              <h4 className="font-display font-semibold text-lg text-white">Free Trial</h4>
              <p className="text-xs text-zinc-400">Perfect to test run A&R pitch generation mechanics.</p>
            </div>

            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-2xl font-mono font-medium text-white">$0</span>
              <span className="text-[10px] text-zinc-500 font-mono">/ 5 Days</span>
            </div>

            <p className="text-[9px] font-mono text-zinc-500 italic uppercase">Included forever</p>

            <ul className="space-y-2 text-[11px] text-neutral-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>1 Sent Pitch per day allotment</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-500">
                <Check className="w-3.5 h-3.5 text-zinc-700 shrink-0 mt-0.5" />
                <span>Teaser Label Database (3 Contacts Only)</span>
              </li>
              <li className="flex items-start gap-2 text-zinc-500">
                <Check className="w-3.5 h-3.5 text-zinc-700 shrink-0 mt-0.5" />
                <span>Standard default signature templates</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            disabled={currentPlan === 'free_trial'}
            onClick={() => handleUpgradeClick('free_trial', 'Free Trial')}
            className={`w-full py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
              currentPlan === 'free_trial'
                ? 'bg-neutral-900 text-zinc-400 cursor-default border border-neutral-800'
                : 'bg-neutral-950 hover:bg-neutral-900 text-white border border-neutral-800 cursor-pointer'
            }`}
          >
            {currentPlan === 'free_trial' ? 'Current Active Tier' : 'Select Free Trial'}
          </button>
        </div>

        {/* Tier 2: Starter */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 relative overflow-hidden ${
          currentPlan === 'starter' 
            ? 'bg-neutral-950/40 border-emerald-500 ring-1 ring-emerald-500' 
            : 'bg-stone-900/10 border-neutral-900'
        }`}>
          {billingInterval !== 'monthly' && (
            <div className="absolute top-3 right-3 bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 font-mono text-[7px] tracking-wider uppercase px-2 py-0.5 rounded">
              {billingInterval === 'quarterly' ? 'Save 20%' : 'Save 40%'}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Recommended</span>
              <h4 className="font-display font-semibold text-lg text-white">
                Starter Plan
              </h4>
              <p className="text-xs text-zinc-400">Built for independent artists starting weekly releases.</p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-medium text-white">{starterPrice}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{starterSub}</span>
              </div>
              <p className="text-[10px] font-mono text-emerald-500 leading-none">{starterTotalLabel}</p>
            </div>

            <ul className="space-y-2 text-[11px] text-neutral-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium text-white">3 Sent Pitches daily volume</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Partial Label Database (6 top contacts)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>AI personalized emails auto-drafting</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Basic Pitch History review & archive</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleUpgradeClick('starter', starterSubmitMsg)}
            className={`w-full py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
              currentPlan === 'starter'
                ? 'bg-neutral-905 text-zinc-400 border border-neutral-900 cursor-default'
                : 'bg-zinc-100 hover:bg-white text-black font-semibold cursor-pointer'
            }`}
          >
            {currentPlan === 'starter' ? 'Current Active Tier' : `Upgrade Starter (${starterPrice}/mo)`}
          </button>
        </div>

        {/* Tier 3: Pro */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 relative overflow-hidden ${
          currentPlan === 'pro' 
            ? 'bg-neutral-950/40 border-purple-500 ring-1 ring-purple-500 lg:scale-105' 
            : 'bg-stone-900/10 border-neutral-900 lg:scale-105'
        }`}>
          {/* Subtle badge */}
          <div className="absolute top-3 left-3 bg-purple-950/50 border border-purple-900 text-purple-400 font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 rounded">
            Unlimited
          </div>

          {billingInterval !== 'monthly' && (
            <div className="absolute top-3 right-3 bg-purple-950/60 border border-purple-900/40 text-purple-400 font-mono text-[7px] tracking-wider uppercase px-2 py-0.5 rounded">
              {billingInterval === 'quarterly' ? 'Save 18%' : 'Save 38%'}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider block font-bold">Uncapped Power</span>
              <h4 className="font-display font-semibold text-lg text-white flex items-center gap-1.5 text-purple-300">
                Pro Plan
              </h4>
              <p className="text-xs text-zinc-400 font-sans">Ideal for serious producers, DJs, managers, and labels.</p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-mono font-medium text-white">{proPrice}</span>
                <span className="text-[10px] text-zinc-400 font-mono">{proSub}</span>
              </div>
              <p className="text-[10px] font-mono text-purple-400 leading-none">{proTotalLabel}</p>
            </div>

            <ul className="space-y-2 text-[11px] text-neutral-300 font-sans pt-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
                <span className="font-bold text-white">UNLIMITED Sent Pitches daily</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-white">Full Label Data Bank access (100% open)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Advanced multi-genre search & location filters</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Priority queue for new target updates</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleUpgradeClick('pro', proSubmitMsg)}
            className={`w-full py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition ${
              currentPlan === 'pro'
                ? 'bg-neutral-905 text-zinc-400 border border-neutral-900 cursor-default'
                : 'bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer'
            }`}
          >
            {currentPlan === 'pro' ? 'Current Active Tier' : `Upgrade Pro (${proPrice}/mo)`}
          </button>
        </div>
      </div>
    </div>
  );
}
