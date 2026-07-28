/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Overview Dashboard Component
 * Displays real-time metrics, recoverable revenue ($), trend charts, and quick actions
 */

import React from 'react';
import { 
  DollarSign, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  RefreshCw, 
  Layers, 
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { DashboardMetrics, Recommendation, Store } from '../types.ts';

interface OverviewDashboardProps {
  metrics: DashboardMetrics | null;
  activeStore: Store | null;
  recentRecommendations: Recommendation[];
  onSelectRecommendation: (rec: Recommendation) => void;
  onNavigateToTab: (tab: 'recommendations' | 'rules') => void;
  onTriggerTestWebhook: () => void;
  isSimulating: boolean;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  activeStore,
  recentRecommendations,
  onSelectRecommendation,
  onNavigateToTab,
  onTriggerTestWebhook,
  isSimulating
}) => {
  const currencySymbol = activeStore?.currency === 'EUR' ? '€' : activeStore?.currency === 'GBP' ? '£' : '$';
  
  const priorityColors: Record<string, string> = {
    Critical: '#f43f5e',
    High: '#f97316',
    Medium: '#eab308',
    Low: '#3b82f6'
  };

  const pieData = metrics ? [
    { name: 'Critical Priority', value: metrics.priorityDistribution.Critical, color: priorityColors.Critical },
    { name: 'High Priority', value: metrics.priorityDistribution.High, color: priorityColors.High },
    { name: 'Medium Priority', value: metrics.priorityDistribution.Medium, color: priorityColors.Medium },
    { name: 'Low Priority', value: metrics.priorityDistribution.Low, color: priorityColors.Low }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Top Banner / Hero Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950/60 rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Decision Support Active for {activeStore?.storeName || 'Shopify'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Unlock High-Value Revenue Opportunities
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Profit Tool evaluates cart abandonments, repeat customer intent, and inventory rules in real-time. Never miss a VIP buyer with explainable, immutable evidence trails.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={onTriggerTestWebhook}
              disabled={isSimulating}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Simulate Abandoned Cart</span>
            </button>
            <button
              onClick={() => onNavigateToTab('recommendations')}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 font-semibold px-5 py-3 rounded-xl transition text-sm"
            >
              <span>View AI Queue</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Recoverable Revenue */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recoverable Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {currencySymbol}{metrics?.totalRecoverableRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" /> +18.4%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Locked in active abandoned carts</p>
        </div>

        {/* Active Recommendations */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active AI Insights</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics?.activeRecommendationsCount || 0}
            </span>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              {metrics?.priorityDistribution.Critical || 0} Critical
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">One active recommendation per cart</p>
        </div>

        {/* Recovery Conversion Rate */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recovery Rate</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics?.recoveryRatePercent || 0}%
            </span>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {metrics?.completedRecommendationsCount || 0} Recovered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Successfully closed recommendations</p>
        </div>

        {/* Average AI Confidence */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Confidence Score</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {metrics?.averageConfidenceScore || 0}%
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {metrics?.usefulFeedbackPercent || 100}% Useful
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Zero hallucinations & verifiable rules</p>
        </div>

      </div>

      {/* Charts Section: 7-Day Revenue Trend & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Revenue Trend */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Revenue Opportunity vs. Recovery (7 Days)</span>
              </h2>
              <p className="text-xs text-slate-400">Total potential cart opportunity compared against successfully recovered orders</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-400 mr-1.5"></span> Recoverable Opportunity
              </span>
              <span className="flex items-center text-teal-300">
                <span className="w-3 h-3 rounded-full bg-teal-500 mr-1.5"></span> Recovered Revenue
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.revenueTrend || []}>
                <defs>
                  <linearGradient id="colorRecoverable" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any) => [`${currencySymbol}${value}`, '']}
                />
                <Area type="monotone" dataKey="recoverable" name="Recoverable Opportunity" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecoverable)" />
                <Area type="monotone" dataKey="recovered" name="Recovered Revenue" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Priority Distribution */}
        <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Priority Distribution</h2>
            <p className="text-xs text-slate-400">Active recommendations by urgency</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-500 text-sm">No active recommendations</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/40">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300 font-medium">{item.name.replace(' Priority', '')}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Critical Recommendations Feed */}
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
              <span>Priority AI Decision Queue</span>
            </h2>
            <p className="text-xs text-slate-400">One active recommendation per cart. Click any item to inspect explainable evidence & rules fired.</p>
          </div>
          <button
            onClick={() => onNavigateToTab('recommendations')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>View all recommendations</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentRecommendations.slice(0, 4).map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectRecommendation(rec)}
              className="bg-slate-800/60 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/60 hover:border-emerald-500/50 cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md tracking-wider ${
                    rec.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    rec.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {rec.priority} Opportunity
                  </span>
                  <span className="text-sm font-extrabold text-white bg-slate-900 px-3 py-1 rounded-lg font-mono">
                    {currencySymbol}{rec.opportunityValue.toFixed(2)}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition mb-1">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {rec.reason}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center font-semibold text-emerald-400">
                    <Cpu className="w-3.5 h-3.5 mr-1" />
                    {rec.confidenceScore}% Confidence
                  </span>
                  <span>•</span>
                  <span>{rec.rulesFiredCount} Rules Fired</span>
                </div>
                <span className="font-semibold text-slate-300 group-hover:translate-x-1 transition flex items-center">
                  Inspect Evidence →
                </span>
              </div>
            </div>
          ))}

          {recentRecommendations.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-medium text-slate-400">No active recommendations in queue</p>
              <p className="text-xs text-slate-500 mt-1">Click "Simulate Live Webhook" above to trigger an abandoned cart evaluation</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
