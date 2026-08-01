/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Merchant Dashboard Navbar
 */

import React, { useState } from 'react';
import { 
  Store, 
  Bell, 
  ShieldCheck, 
  Cpu, 
  ChevronDown, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Download
} from 'lucide-react';
import { Store as StoreType, NotificationAlert } from '../types.ts';

interface NavbarProps {
  stores: StoreType[];
  activeStore: StoreType | null;
  onSelectStore: (storeId: string) => void;
  notifications: NotificationAlert[];
  onOpenNotifications: () => void;
  onTriggerTestWebhook: () => void;
  isSimulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  stores,
  activeStore,
  onSelectStore,
  notifications,
  onOpenNotifications,
  onTriggerTestWebhook,
  isSimulating
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [isExporting, setIsExporting] = React.useState(false);
  const [openStoreMenu, setOpenStoreMenu] = useState(false);

  const handleExportZip = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExporting) return;
    setIsExporting(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/download-zip';
      link.setAttribute('download', 'profit-tool-enterprise-source.zip');
      link.setAttribute('target', '_top');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('DOM link trigger fallback:', err);
      window.location.href = '/api/download-zip';
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & AI Indicator */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Cpu className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  PROFIT<span className="text-emerald-400">TOOL</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI Decision Support
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Shopify Revenue Recovery Engine</p>
            </div>
          </div>

          {/* Store Switcher */}
          <div className="flex items-center pl-6 border-l border-slate-800">
            <div className="relative group">
              <button
  onClick={() => setOpenStoreMenu(!openStoreMenu)}
  className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-3.5 py-1.5 rounded-lg border border-slate-700/60 transition text-sm font-medium"
>
                <Store className="w-4 h-4 text-emerald-400" />
                <span>{activeStore?.storeName || 'Select Store'}</span>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                  {activeStore?.currency || 'USD'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className={`absolute left-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 ${openStoreMenu ? 'block' : 'hidden'}`}>
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Connected Stores ({stores.length})
                </div>
                {stores.map((store) => (
  <button
    key={store.id}
    onClick={() => onSelectStore(store.id)}
    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-700/60 transition ${
      activeStore?.id === store.id ? 'text-emerald-400 font-medium bg-emerald-500/10' : 'text-slate-300'
    }`}
  >
                    <div>
                      <div>{store.storeName}</div>
                      <div className="text-xs text-slate-400 font-mono">{store.shopifyDomain}</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                      {store.activePlan}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Actions & Status */}
        <div className="flex items-center space-x-4">
          
          {/* Direct Export / Download ZIP Button */}
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/80 font-medium text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
            title="Export complete project source code (ZIP archive including SQL DDL, backend engines, tests, and Docker configs)"
          >
            <Download className={`w-3.5 h-3.5 text-emerald-400 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export Source (ZIP)'}</span>
          </button>

          {/* Simulate Abandoned Cart Webhook Button */}
          <button
            onClick={onTriggerTestWebhook}
            disabled={isSimulating}
            className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-lg font-medium text-xs shadow-sm transition disabled:opacity-50"
            title="Simulates an instant abandoned cart webhook from Shopify to demonstrate AI evaluation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Simulate Live Webhook</span>
          </button>

          {/* AI Engine Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/40 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Gemini 2.5 Active</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Notifications & Webhook Alerts"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Merchant Account info */}
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
            {activeStore?.storeName?.substring(0, 2).toUpperCase() || 'FB'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200">Merchant Admin</div>
              <div className="text-[10px] text-emerald-400 font-mono">{activeStore?.activePlan} Plan Active</div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
