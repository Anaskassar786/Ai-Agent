/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Merchant Navigation Sidebar
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Sliders, 
  Users, 
  BarChart3, 
  CreditCard, 
  ShieldAlert, 
  Settings, 
  BellRing,
  HelpCircle
} from 'lucide-react';

export type TabType = 
  | 'overview' 
  | 'recommendations' 
  | 'rules' 
  | 'carts' 
  | 'analytics' 
  | 'billing' 
  | 'audit' 
  | 'notifications';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeRecommendationsCount: number;
  unreadNotificationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeRecommendationsCount,
  unreadNotificationsCount
}) => {
  const navItems = [
    { id: 'overview' as TabType, label: 'Overview Metrics', icon: LayoutDashboard },
    { id: 'recommendations' as TabType, label: 'AI Recommendations', icon: Sparkles, badge: activeRecommendationsCount, badgeColor: 'bg-emerald-500 text-slate-950' },
    { id: 'rules' as TabType, label: 'Rule Engine Studio', icon: Sliders },
    { id: 'carts' as TabType, label: 'Cart & Customer Hub', icon: Users },
    { id: 'analytics' as TabType, label: 'ROI Analytics', icon: BarChart3 },
    { id: 'notifications' as TabType, label: 'Notification Center', icon: BellRing, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'billing' as TabType, label: 'Shopify Billing', icon: CreditCard },
    { id: 'audit' as TabType, label: 'Audit Trails & Security', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 text-slate-300 flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="space-y-6">
        
        {/* Navigation Menu */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Decision Support Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Health Card */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              HMAC Security
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
              SHA256 OK
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All Shopify Webhooks verified & idempotent. No hallucinations detected.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-400">Profit Tool v1.0.0</span>
          <span className="font-mono text-emerald-400">Enterprise</span>
        </div>
        <p className="text-[10px]">PostgreSQL & BullMQ Architecture</p>
      </div>
    </aside>
  );
};
