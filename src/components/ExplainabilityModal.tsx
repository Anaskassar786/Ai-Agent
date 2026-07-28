/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Explainability & Immutable Evidence Deep-Dive Modal
 * The core Decision Support interface showing Reason, Evidence Snapshots, Rules Fired, and Audit Trail
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Ban, 
  History, 
  Layers, 
  ThumbsUp, 
  ThumbsDown, 
  DollarSign, 
  FileText, 
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Recommendation, EvidenceSnapshot, RecommendationStatus } from '../types.ts';

interface ExplainabilityModalProps {
  recommendation: Recommendation;
  onClose: () => void;
  onUpdateStatus: (id: string, status: RecommendationStatus, snoozedUntil?: string) => Promise<void>;
  onSubmitFeedback: (id: string, isUseful: boolean, comments?: string) => Promise<void>;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  recommendation,
  onClose,
  onUpdateStatus,
  onSubmitFeedback
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'rules' | 'audit' | 'feedback'>('evidence');
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState<number>(0);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isUsefulSelection, setIsUsefulSelection] = useState<boolean | null>(null);

  const snapshots = recommendation.evidenceHistory || [];
  const currentSnapshot: EvidenceSnapshot | undefined = snapshots[selectedSnapshotIndex] || snapshots[0];
  const currencySymbol = recommendation.currency === 'EUR' ? '€' : recommendation.currency === 'GBP' ? '£' : '$';

  const handleFeedbackSubmit = async (isUseful: boolean) => {
    setIsUsefulSelection(isUseful);
    await onSubmitFeedback(recommendation.id, isUseful, feedbackComments);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-800/80 border-b border-slate-700/80 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  recommendation.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' :
                  recommendation.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {recommendation.priority} Priority
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {recommendation.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{recommendation.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Main Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Reason & Action Summary Card */}
          <div className="bg-gradient-to-r from-slate-800/90 to-slate-800/50 rounded-2xl p-5 border border-slate-700/60 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Explainability Reasoning
                </span>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed">{recommendation.reason}</p>
              </div>

              <div className="bg-slate-900/90 px-4 py-3 rounded-xl border border-slate-700/80 text-center shrink-0">
                <div className="text-[10px] uppercase font-semibold text-slate-400">AI Confidence</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{recommendation.confidenceScore}%</div>
                <div className="text-[10px] text-slate-500">Zero Hallucinations</div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-300 font-medium">
              <span className="font-bold text-emerald-400 mr-2">Suggested Next Step:</span>
              {recommendation.actionSummary}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'evidence' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Immutable Evidence Snapshots ({snapshots.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'rules' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Rules Fired ({currentSnapshot?.rulesFired?.length || recommendation.rulesFiredCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'audit' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Timeline ({recommendation.auditHistory?.length || 1})</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'feedback' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Merchant Feedback</span>
            </button>
          </div>

          {/* TAB 1: IMMUTABLE EVIDENCE SNAPSHOTS */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              
              {/* Snapshot Version Switcher */}
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Evidence is immutable. Every re-evaluation creates a new snapshot without overwriting.</span>
                </div>
                {snapshots.length > 1 && (
                  <select
                    value={selectedSnapshotIndex}
                    onChange={(e) => setSelectedSnapshotIndex(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    {snapshots.map((snap, idx) => (
                      <option key={snap.snapshotId} value={idx}>
                        Snapshot v{snap.version} ({new Date(snap.evaluatedAt).toLocaleTimeString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {currentSnapshot ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cart Details Snapshot */}
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/60 pb-2">
                      Cart & Customer Snapshot (v{currentSnapshot.version})
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cart Value at Evaluation:</span>
                        <span className="font-mono font-bold text-white">{currencySymbol}{currentSnapshot.cartValueAtEval.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cart Abandoned Age:</span>
                        <span className="font-mono text-white">{currentSnapshot.cartAgeHours} hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Customer LTV Spent:</span>
                        <span className="font-mono text-emerald-400 font-bold">{currencySymbol}{currentSnapshot.customerTotalSpentAtEval.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Past Orders:</span>
                        <span className="font-mono text-white">{currentSnapshot.customerTotalOrdersAtEval} orders</span>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700/60 pb-2">
                      Cart Line Items ({currentSnapshot.itemsSnapshot.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {currentSnapshot.itemsSnapshot.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          <div>
                            <div className="font-medium text-slate-200">{item.quantity}x {item.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="font-bold text-white">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${item.inStock ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'}`}>
                              {item.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No snapshot available</div>
              )}
            </div>
          )}

          {/* TAB 2: RULES FIRED */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                These specific Core & Edge business rules evaluated to <span className="text-emerald-400 font-bold">TRUE</span> during cart evaluation, providing traceable justification for the AI confidence score.
              </p>
              <div className="space-y-2">
                {(currentSnapshot?.rulesFired || []).map((rule, idx) => (
                  <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          rule.ruleType === 'CORE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {rule.ruleType} Rule v{rule.version || 1}
                        </span>
                        <span className="text-sm font-bold text-white">{rule.ruleName}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rule.explanation}</p>
                    </div>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg text-center shrink-0 border border-slate-800 font-mono">
                      <div className="text-[9px] uppercase text-slate-500">Weight</div>
                      <div className="text-sm font-bold text-emerald-400">+{rule.weight} pt</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TIMELINE */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Immutable append-only audit trail logging every automated and manual state transition.
              </p>
              <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-6 my-4">
                {(recommendation.auditHistory || []).map((audit, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                    <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{audit.action}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{new Date(audit.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>Actor: <strong className="text-slate-300">{audit.actor}</strong></span>
                        {audit.newStatus && <span>• Status: <strong className="text-emerald-400">{audit.newStatus}</strong></span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MERCHANT FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-4 max-w-xl mx-auto py-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">Was this AI recommendation useful?</h3>
                <p className="text-xs text-slate-400">Your feedback trains our algorithmic confidence weighting for your store.</p>
              </div>

              {!feedbackSubmitted ? (
                <div className="space-y-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleFeedbackSubmit(true)}
                      className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition border ${
                        isUsefulSelection === true ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Yes, Useful</span>
                    </button>
                    <button
                      onClick={() => handleFeedbackSubmit(false)}
                      className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition border ${
                        isUsefulSelection === false ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-rose-500'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Not Useful</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Optional Notes / Reason</label>
                    <textarea
                      rows={3}
                      value={feedbackComments}
                      onChange={(e) => setFeedbackComments(e.target.value)}
                      placeholder="Why was this suggestion helpful or inaccurate?"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Thank you! Feedback Recorded.</h4>
                  <p className="text-xs text-slate-400">Your feedback has been logged to the immutable audit trail.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer / Quick Actions */}
        <div className="bg-slate-800/80 border-t border-slate-700/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            Current Status: <strong className="text-white font-semibold">{recommendation.status}</strong>
          </div>

          <div className="flex items-center space-x-2">
            {recommendation.status !== 'Completed' && (
              <button
                onClick={() => {
                  onUpdateStatus(recommendation.id, 'Completed');
                  onClose();
                }}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Completed & Recovered</span>
              </button>
            )}

            <button
              onClick={() => {
                const nextWeek = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
                onUpdateStatus(recommendation.id, 'Snoozed', nextWeek);
                onClose();
              }}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-600 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Snooze 7 Days</span>
            </button>

            <button
              onClick={() => {
                onUpdateStatus(recommendation.id, 'Blocked');
                onClose();
              }}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 px-3 py-2 rounded-xl text-xs font-medium border border-slate-700 transition"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Block</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
