import React, { useState } from 'react';
import { Mail, Clock, CheckCircle, FileText, Calendar, RotateCcw, AlertTriangle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Outreach, Demo, Target, Label } from '../types.js';

interface PitchHistoryViewProps {
  outreaches: Outreach[];
  demos: Demo[];
  targets: Target[];
  labels: Label[];
}

export default function PitchHistoryView({ outreaches, demos, targets, labels }: PitchHistoryViewProps) {
  const [filter, setFilter] = useState<'all' | 'sent' | 'draft'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Helper to map names and tracks
  const getPitchMetadata = (o: Outreach) => {
    const demo = demos.find(d => d.id === o.demoId);
    let targetName = o.targetName || '';
    let targetEmail = o.targetEmail || '';

    if (!targetName) {
      if (o.targetId.startsWith('label_')) {
        const lbl = labels.find(l => l.id === o.targetId);
        if (lbl) {
          targetName = lbl.name;
          targetEmail = lbl.email;
        }
      } else {
        const trg = targets.find(t => t.id === o.targetId);
        if (trg) {
          targetName = trg.name;
          targetEmail = trg.email;
        }
      }
    }

    return {
      trackTitle: demo ? demo.title : 'Unreleased Sound Demo',
      trackGenre: demo ? demo.genre : 'Electronic',
      targetName: targetName || 'Unknown Curator',
      targetEmail: targetEmail || 'A&R Department'
    };
  };

  const filteredPitches = outreaches.filter(o => {
    if (filter === 'sent') return o.status === 'sent';
    if (filter === 'draft') return o.status === 'draft';
    return true;
  });

  // Calculate dynamic follow-up recommended action date
  const getFollowUpStatus = (sentAtStr?: string) => {
    if (!sentAtStr) return { color: 'text-zinc-500', label: 'Draft Pitch' };
    const sentDate = new Date(sentAtStr);
    const followUpTargetDate = new Date(sentDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days rule
    const isOverdue = Date.now() > followUpTargetDate.getTime();
    
    if (isOverdue) {
      return { 
        color: 'text-amber-400', 
        label: 'Suggest following up now (Over 7 days since pitch)' 
      };
    }
    const daysLeft = Math.ceil((followUpTargetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { 
      color: 'text-emerald-400', 
      label: `Follow-up advised in ${daysLeft} days` 
    };
  };

  return (
    <div className="space-y-6" id="pitch_history_wrapper">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="text-2xl font-display font-medium text-white tracking-tight">Pitch History</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse active pitches, synchronized Gmail drafts, pending review items, and follow-up alerts.
          </p>
        </div>
        
        {/* Filter segment */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-900 font-mono text-[10px] uppercase tracking-wider">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'all' ? 'bg-neutral-850 text-white' : 'text-zinc-500 hover:text-stone-300'}`}
          >
            All ({outreaches.length})
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'sent' ? 'bg-neutral-850 text-white' : 'text-zinc-500 hover:text-stone-300'}`}
          >
            Sent ({outreaches.filter(o => o.status === 'sent').length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-3 py-1.5 rounded-lg transition ${filter === 'draft' ? 'bg-neutral-850 text-white' : 'text-zinc-500 hover:text-stone-300'}`}
          >
            Drafts ({outreaches.filter(o => o.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Philosophy Prompt */}
      <div className="p-4 bg-stone-900/30 border border-neutral-900 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-display font-medium text-[11px] uppercase tracking-wider text-stone-300">Sustainable Pitch Ethics</h4>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-light">
            Promo Flow encourages high-fidelity, high-personalization pitches. If you do not hear back within 7 days, we suggest sending one respectful, polite follow-up nudge in your Gmail thread. Avoid double-submitting tracks or spamming similar brands.
          </p>
        </div>
      </div>

      {/* Grid of outreaches */}
      {filteredPitches.length === 0 ? (
        <div className="text-center py-16 bg-neutral-950 rounded-2xl border border-neutral-900">
          <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">No historic pitches recorded inside active filter tier.</p>
        </div>
      ) : (
        <div className="space-y-3" id="pitches_history_list">
          {filteredPitches.map(o => {
            const meta = getPitchMetadata(o);
            const isExpanded = expandedId === o.id;
            const followUpProps = getFollowUpStatus(o.sentAt || o.createdAt);

            return (
              <div 
                key={o.id} 
                className="bg-stone-900/10 hover:bg-stone-900/20 rounded-2xl border border-neutral-900 overflow-hidden transition"
              >
                {/* Collapsible Action Bar */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  className="w-full p-4 md:p-5 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                        o.status === 'sent' 
                          ? 'bg-emerald-950/25 text-emerald-400 border-emerald-900/40' 
                          : 'bg-zinc-900/60 text-zinc-400 border-neutral-850'
                      }`}>
                        {o.status}
                      </span>
                      <span className="text-zinc-500 text-[10px] font-mono">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-white truncate">
                      Pitch to {meta.targetName}
                    </p>

                    <p className="text-xs text-zinc-400 font-sans truncate">
                      Track: <span className="text-zinc-200">{meta.trackTitle}</span> ({meta.trackGenre})
                    </p>
                  </div>

                  {/* Actions / status details */}
                  <div className="flex items-center gap-3 self-stretch md:self-auto justify-between border-t border-neutral-950/40 md:border-0 pt-2.5 md:pt-0 font-mono text-[10px]">
                    <span className={`flex items-center gap-1 ${followUpProps.color} text-[10px]`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {followUpProps.label}
                    </span>
                    
                    <div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Mail Draft Visualizer */}
                {isExpanded && (
                  <div className="border-t border-neutral-950 bg-neutral-950 p-4 font-sans space-y-4 text-xs">
                    <div className="space-y-2 pb-3 border-b border-neutral-900 text-zinc-400">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500 mr-2">Recipient Email:</span>
                        <span className="text-zinc-100">{meta.targetEmail}</span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500 mr-2">Subject Header:</span>
                        <span className="text-zinc-100">{o.emailSubject}</span>
                      </div>
                      {o.gmailDraftId && (
                        <div>
                          <span className="font-mono text-[9px] uppercase tracking-wider font-semibold text-emerald-500 mr-2">Gmail Draft ID:</span>
                          <span className="font-mono text-zinc-300 text-[10px]">{o.gmailDraftId}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-stone-900/15 border border-neutral-905 rounded-xl text-neutral-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap font-sans font-light">
                      {o.emailBody}
                    </div>

                    <div className="flex gap-2.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(o.emailBody);
                          alert('Copied pitch body successfully.');
                        }}
                        className="hover:text-emerald-300 cursor-pointer text-[10px]"
                      >
                        Copy Body Content
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
