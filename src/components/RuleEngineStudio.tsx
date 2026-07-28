/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Rule Engine Studio Component
 * Manages Core & Edge rules, version tracking, custom rule creation, and interactive simulation
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  RefreshCw, 
  ChevronRight,
  Cpu,
  Zap
} from 'lucide-react';
import { RuleVersion, RuleType, Store } from '../types.ts';

interface RuleEngineStudioProps {
  rules: RuleVersion[];
  activeStore: Store | null;
  onToggleRule: (id: string) => Promise<void>;
  onCreateRule: (ruleData: any) => Promise<void>;
  onSimulate: (params: any) => Promise<any>;
}

export const RuleEngineStudio: React.FC<RuleEngineStudioProps> = ({
  rules,
  activeStore,
  onToggleRule,
  onCreateRule,
  onSimulate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleField, setNewRuleField] = useState('cart.totalValue');
  const [newRuleOp, setNewRuleOp] = useState('GTE');
  const [newRuleVal, setNewRuleVal] = useState('150');
  const [newRuleWeight, setNewRuleWeight] = useState(20);

  // Simulation state
  const [simCartValue, setSimCartValue] = useState(350);
  const [simItemCount, setSimItemCount] = useState(2);
  const [simVip, setSimVip] = useState(true);
  const [simAgeHours, setSimAgeHours] = useState(3);
  const [simResults, setSimResults] = useState<any[] | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const currencySymbol = activeStore?.currency === 'EUR' ? '€' : activeStore?.currency === 'GBP' ? '£' : '$';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName) return;
    await onCreateRule({
      name: newRuleName,
      description: newRuleDesc,
      ruleType: 'CUSTOM',
      priorityWeight: Number(newRuleWeight),
      conditionField: newRuleField,
      operator: newRuleOp,
      thresholdValue: isNaN(Number(newRuleVal)) ? newRuleVal : Number(newRuleVal)
    });
    setShowCreateModal(false);
    setNewRuleName('');
    setNewRuleDesc('');
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await onSimulate({
        cartValue: simCartValue,
        itemCount: simItemCount,
        vip: simVip,
        ageHours: simAgeHours
      });
      setSimResults(res.executions || []);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-emerald-400" />
            <span>Rule Engine Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Core, Edge, and Custom threshold rules. Every modification creates an immutable versioned record.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Custom Rule</span>
        </button>
      </div>

      {/* Rules List Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Active & Versioned Rules ({rules.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                rule.isActive ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-900/40 border-slate-800/50 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      rule.ruleType === 'CORE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      rule.ruleType === 'EDGE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {rule.ruleType}
                    </span>
                    <span className="text-xs font-mono text-slate-400">v{rule.version}</span>
                  </div>

                  <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +{rule.priorityWeight} pt weight
                  </span>
                </div>

                <h3 className="font-bold text-white text-base">{rule.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="text-slate-400">
                  Condition: <span className="text-white font-bold">{rule.conditionField}</span> {rule.operator} <span className="text-emerald-400 font-bold">{rule.thresholdValue}</span>
                </div>

                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    rule.isActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {rule.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Simulation Bench */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-700/80 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-400" />
            <span>Interactive Rule Evaluation Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test how your active business rules and algorithmic weights trigger against hypothetical cart scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Simulated Cart Value ({currencySymbol})</label>
            <input
              type="number"
              value={simCartValue}
              onChange={(e) => setSimCartValue(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Cart Item Count</label>
            <input
              type="number"
              value={simItemCount}
              onChange={(e) => setSimItemCount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Abandonment Age (Hours)</label>
            <input
              type="number"
              value={simAgeHours}
              onChange={(e) => setSimAgeHours(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="text-xs font-medium text-slate-300">Customer VIP Status</label>
            <button
              type="button"
              onClick={() => setSimVip(!simVip)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition border ${
                simVip ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {simVip ? '★ VIP Customer' : 'Standard Customer'}
            </button>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl shadow transition disabled:opacity-50 text-xs"
        >
          <Zap className="w-4 h-4" />
          <span>Run Simulation Against Rule Engine</span>
        </button>

        {/* Simulation Output */}
        {simResults && (
          <div className="pt-4 border-t border-slate-700/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Simulation Results — {simResults.length} Rules Fired!
              </span>
              <span className="text-xs font-bold text-white font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                Total Confidence Weight: +{simResults.reduce((sum, r) => sum + r.weight, 0)} pt
              </span>
            </div>

            <div className="space-y-2">
              {simResults.map((res, i) => (
                <div key={i} className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white">{res.ruleName}</span>
                    <p className="text-slate-400">{res.explanation}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 shrink-0 ml-4">+{res.weight} pt</span>
                </div>
              ))}
              {simResults.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4 bg-slate-900/60 rounded-xl">
                  No threshold rules fired for this cart scenario.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Custom Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white">Create Custom Threshold Rule</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., High Shipping Drop-Off Alert"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Description</label>
                <input
                  type="text"
                  placeholder="Why does this trigger an opportunity?"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Evaluate Field</label>
                  <select
                    value={newRuleField}
                    onChange={(e) => setNewRuleField(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cart.totalValue">Cart Total Value ($)</option>
                    <option value="customer.totalOrders">Customer Total Orders</option>
                    <option value="cart.ageHours">Cart Abandoned Age (hrs)</option>
                    <option value="cart.itemCount">Cart Item Count</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Operator</label>
                  <select
                    value={newRuleOp}
                    onChange={(e) => setNewRuleOp(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GTE">&ge; Greater than or equal</option>
                    <option value="GT">&gt; Greater than</option>
                    <option value="LTE">&le; Less than or equal</option>
                    <option value="EQ">= Exactly equal to</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Threshold Value</label>
                  <input
                    type="text"
                    required
                    value={newRuleVal}
                    onChange={(e) => setNewRuleVal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Priority Weight (+pts)</label>
                  <input
                    type="number"
                    required
                    value={newRuleWeight}
                    onChange={(e) => setNewRuleWeight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow transition"
                >
                  Create & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
