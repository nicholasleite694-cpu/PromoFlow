import React, { useState } from 'react';
import { Heart, Sparkles, Coffee, Music, DollarSign, Gift, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SupportView() {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(15);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [supportNote, setSupportNote] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);
  const [hasDonated, setHasDonated] = useState(false);

  const presets = [5, 15, 30, 50, 100];

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDonating(true);
    
    setTimeout(() => {
      setIsDonating(false);
      setHasDonated(true);
    }, 1500);
  };

  const currentBillAmount = selectedAmount === 'custom' ? parseFloat(customAmount) || 0 : selectedAmount;

  return (
    <div className="space-y-8 max-w-4xl mx-auto" id="support_view_parent">
      {/* Page Header */}
      <div className="border-b border-neutral-900 pb-5">
        <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-semibold block mb-1">
          Support Independent Development
        </span>
        <h2 className="text-3xl font-display font-medium text-white tracking-tight">Support Our Core Work</h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          Promo Flow is built independently with pride. No corporate backing, no massive sales forces—just pure focus on independent music.
        </p>
      </div>

      {hasDonated ? (
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-950/20 border border-amber-500/30 rounded-2xl p-8 text-center space-y-6 max-w-xl mx-auto animate-fade-in my-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400/40 mx-auto text-amber-400 animate-bounce">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-xl text-white">Thank You, {donorName || 'Fellow Artist'}!</h3>
            <p className="text-sm text-zinc-300">
              Your contribution of <span className="text-amber-400 font-mono font-bold">${currentBillAmount}</span> has been received successfully.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed pt-2 max-w-md mx-auto">
              Every dollar directly funds our automated premium labels database updates, AI email rendering pipelines, and hosting fees. We are committed to keeping independent music submission workflows open and high-performing.
            </p>
          </div>

          {supportNote && (
            <div className="p-4 bg-black/40 rounded-xl border border-neutral-900 text-left">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">Your Note left on the wall:</span>
              <p className="text-xs text-stone-300 italic mt-1 font-sans">"{supportNote}"</p>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={() => {
                setHasDonated(false);
                setSelectedAmount(15);
                setCustomAmount('');
                setDonorName('');
                setSupportNote('');
              }}
              className="px-6 py-2 bg-white text-black text-xs font-mono font-bold rounded-lg hover:bg-zinc-200 transition cursor-pointer select-none"
            >
              Support Again
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Pitch & Legacy explanation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-stone-900/20 border border-neutral-900 p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-400" /> Made by Producers, for Producers
              </h3>
              
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                We are a small collective of active underground electronic music producers and DJs. Like millions of other artists worldwide, we struggled for years with the tedious, manual grind of finding genuine curation contacts. We hated submitting and gets zero replies because of outdated databases.
              </p>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                We designed <strong className="text-white">Promo Flow</strong> to replace manual spreadsheet tracking with smart automated alignment. By combining clean curation taxonomy (matching deep record labels vs dynamic DJ sets) with responsive AI drafts, we’re putting professional toolsets directly back into independent artists' hands.
              </p>

              <div className="p-4 bg-neutral-950/40 rounded-xl border border-neutral-900/60 flex gap-3.5">
                <div className="w-10 h-10 rounded-full bg-indigo-505/10 border border-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-400 italic font-bold">
                  PF
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Autonomous Launch Phase</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    This is a new independent project. We are working around the clock to hand-verify contact feedback, index new underground promoters, and sharpen alignment filters. Your support helps keep this platform completely sustainable, advertising-free, and purely community-driven!
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-stone-900/10 border border-neutral-900 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 block font-bold">100% DIRECT</span>
                <p className="text-[11px] text-zinc-400">Zero broker commissions or hidden premium agent payout interfaces.</p>
              </div>
              <div className="p-4 bg-stone-900/10 border border-neutral-905 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-amber-500 block font-bold">FREQUENT REFINEMENTS</span>
                <p className="text-[11px] text-zinc-400">Contact bounce rates monitored weekly in live environments.</p>
              </div>
            </div>
          </div>

          {/* Golden Donation Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-stone-900/40 to-black/60 border border-amber-500/20 p-6 rounded-2xl space-y-5">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h4 className="font-display font-semibold text-sm text-white pt-1">Make a Contribution</h4>
              <p className="text-[11px] text-zinc-400">Choose your custom support pledge level</p>
            </div>

            <form onSubmit={handleDonateSubmit} className="space-y-4">
              {/* Preset selection grids */}
              <div className="grid grid-cols-3 gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(p);
                    }}
                    className={`py-2 rounded-lg border text-xs font-mono transition select-none cursor-pointer flex flex-col items-center justify-center ${
                      selectedAmount === p
                        ? 'bg-amber-500/15 text-amber-400 border-amber-400/80 font-bold'
                        : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-900 text-zinc-400'
                    }`}
                  >
                    <span>${p}</span>
                    {p === 15 && <span className="text-[8px] text-amber-600 block leading-none font-sans font-normal mt-0.5">Most common</span>}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setSelectedAmount('custom')}
                  className={`py-2 rounded-lg border text-xs font-mono transition select-none cursor-pointer flex flex-col items-center justify-center ${
                    selectedAmount === 'custom'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-400/80 font-bold'
                      : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-900 text-zinc-400'
                  }`}
                >
                  <span>Custom</span>
                </button>
              </div>

              {selectedAmount === 'custom' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block">Custom Support Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter USD value..."
                      className="w-full pl-8 pr-4 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-sm font-mono text-white placeholder-zinc-700 outline-none focus:border-amber-500/50"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Supporter metadata info */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block">Your Producer/Artist Name</label>
                  <input
                    type="text"
                    placeholder="e.g. DJ Resident, Soul Vision..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-xs placeholder-zinc-705 text-white outline-none focus:border-zinc-700"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase block">Message on the Supporter Wall (Optional)</label>
                  <textarea
                    placeholder="Leave a message for the developer collective..."
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-850 rounded-lg text-[11px] placeholder-zinc-705 text-white outline-none focus:border-zinc-700 resize-none"
                    value={supportNote}
                    onChange={(e) => setSupportNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic submit action */}
              <button
                type="submit"
                disabled={isDonating || (selectedAmount === 'custom' && !customAmount)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer select-none flex items-center justify-center gap-1.5 shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDonating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Support...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Donation (${currentBillAmount})</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-2" />
                  </>
                )}
              </button>
            </form>

            <span className="text-[9px] text-center block text-zinc-550 pt-1 leading-tight">
              Sponsorship transactions are securely completed as individual voluntary developer support credits.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
