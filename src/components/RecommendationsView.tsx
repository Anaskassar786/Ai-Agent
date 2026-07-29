/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — AI Recommendations Queue View
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Cpu, 
  CheckCircle, 
  Clock, 
  Ban, 
  Archive, 
  ArrowUpDown,
  ExternalLink,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Recommendation, RecommendationPriority, RecommendationStatus, Store } from '../types.ts';

interface RecommendationsViewProps {
  recommendations: Recommendation[];
  activeStore: Store | null;
  onSelectRecommendation: (rec: Recommendation) => void;
  onUpdateStatus: (id: string, status: RecommendationStatus, snoozedUntil?: string) => Promise<void>;
  onRefresh: () => void;  
  onInspectEvidence: (rec: Recommendation) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  activeStore,
  onSelectRecommendation,  
  onInspectEvidence,
  onUpdateStatus,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('Open');
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'value'>('priority');

  const currencySymbol = activeStore?.currency === 'EUR' ? '€' : activeStore?.currency === 'GBP' ? '£' : '$';

  // Filter and sort logic
  const filtered = recommendations.filter(rec => {
    if (priorityFilter !== 'All' && rec.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchesTitle = rec.title.toLowerCase().includes(q);
      const matchesReason = rec.reason.toLowerCase().includes(q);
      const matchesCustomer = rec.customerName && rec.customerName.toLowerCase().includes(q);
      return matchesTitle || matchesReason || matchesCustomer;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
    if (sortBy === 'value') return b.opportunityValue - a.opportunityValue;
    const prioOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>AI Decision Support Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Every recommendation is traceable to immutable evidence snapshots and versioned business rules.
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search buyer, item, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Completed">Completed</option>
            <option value="Snoozed">Snoozed</option>
            <option value="Blocked">Blocked</option>
            <option value="Updated">Updated</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="priority">Sort by Priority</option>
            <option value="value">Sort by Value ($)</option>
            <option value="confidence">Sort by AI Confidence</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            
            {/* Left side: details */}
            <div className="space-y-3 flex-1 cursor-pointer" onClick={() => onSelectRecommendation(rec)}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md tracking-wider ${
                  rec.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  rec.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {rec.priority}
                </span>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                  rec.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                  rec.status === 'Snoozed' ? 'bg-slate-700 text-slate-300' :
                  rec.status === 'Blocked' ? 'bg-rose-900/40 text-rose-300' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  Status: {rec.status}
                </span>

                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{rec.confidenceScore}% AI Confidence</span>
                </span>

                <span className="text-xs text-slate-400 font-mono">
                  • {rec.rulesFiredCount} Rules Fired
                </span>

                <span className="text-xs text-slate-500 font-mono">
                  • Snapshot v{rec.evidenceHistory?.length || 1}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white hover:text-emerald-400 transition">
                {rec.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {rec.reason}
              </p>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 text-xs text-emerald-300 font-medium flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-normal mr-1.5">Action Plan:</span>
                  {rec.actionSummary}
                </div>
              <button
               onClick={() => onInspectEvidence(rec)}
               className="text-emerald-400 font-bold underline text-[11px] shrink-0 ml-4"
                           >
                  Inspect Evidence →
                  </button>
              </div>
            </div>

            {/* Right side: Value & Actions */}
            <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
              <div className="text-left lg:text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Recoverable Value</div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {currencySymbol}{rec.opportunityValue.toFixed(2)}
                </div>
              </div>

              {/* Quick Action buttons */}
              {rec.status === 'Open' || rec.status === 'Updated' ? (
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onUpdateStatus(rec.id, 'Completed')}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow transition"
                    title="Mark recommendation as completed / order recovered"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>

                  <button
                    onClick={() => {
                      const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
                      onUpdateStatus(rec.id, 'Snoozed', nextWeek);
                    }}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 transition"
                    title="Snooze for 7 days"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Snooze</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(rec.id, 'Blocked')}
                    className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition"
                    title="Block recommendation"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(rec.id, 'Open');
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white underline"
                >
                  Re-open Opportunity
                </button>
              )}
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-400 text-base">No matching recommendations found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or click "Simulate Live Webhook" in the top bar</p>
          </div>
        )}
      </div>

    </div>
  );
};
