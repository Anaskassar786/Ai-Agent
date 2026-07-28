/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Notification Center & Webhook Alerts
 */

import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Settings, 
  CheckCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { NotificationAlert, Store } from '../types.ts';

interface NotificationCenterProps {
  notifications: NotificationAlert[];
  activeStore: Store | null;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  activeStore,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [emailDigest, setEmailDigest] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [webhookStatusAlerts, setWebhookStatusAlerts] = useState(true);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-400" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time webhooks, AI priority alerts, and automated email digest preferences for your store team.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-4 py-2 rounded-xl border border-slate-700 text-xs transition shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Notifications Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Live Activity Feed ({notifications.length})</span>
          </h2>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && onMarkAsRead(notif.id)}
                className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                  notif.isRead ? 'bg-slate-900/60 border-slate-800/80 opacity-75' : 'bg-slate-900 border-slate-700/80 hover:border-emerald-500/50 shadow-md'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold ${
                    notif.priority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    notif.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {notif.priority === 'Critical' ? <AlertTriangle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{notif.title}</span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1 flex items-center gap-2">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      <span>• Store: {activeStore?.storeName || 'Shopify'}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {notif.isRead ? (
                    <span className="text-[10px] font-mono text-slate-500">Read</span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-400 hover:underline">Mark read</span>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No alerts logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Email & Alert Preferences */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <Settings className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Alert Delivery Settings</h3>
            </div>
            <p className="text-xs text-slate-400">
              Configure how AI decision recommendations and webhook alerts are delivered to your merchant admin email ({activeStore?.ownerEmail || 'admin@store.com'}).
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Critical AI Opportunity Alerts</div>
                  <div className="text-[11px] text-slate-400">Instant email when a $500+ cart is abandoned</div>
                </div>
                <button
                  onClick={() => setCriticalAlerts(!criticalAlerts)}
                  className={`w-11 h-6 rounded-full transition relative ${criticalAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${criticalAlerts ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Daily Revenue Digest</div>
                  <div className="text-[11px] text-slate-400">Morning summary of recoverable carts</div>
                </div>
                <button
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={`w-11 h-6 rounded-full transition relative ${emailDigest ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${emailDigest ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Shopify Webhook Health</div>
                  <div className="text-[11px] text-slate-400">Alert if webhook delivery delays occur</div>
                </div>
                <button
                  onClick={() => setWebhookStatusAlerts(!webhookStatusAlerts)}
                  className={`w-11 h-6 rounded-full transition relative ${webhookStatusAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${webhookStatusAlerts ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Preferences Synced
              </span>
              <span className="text-[10px] font-mono text-slate-500">Auto-saved</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 rounded-2xl p-5 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-bold text-white block">Automated Email Templates</span>
            <p className="text-slate-400 leading-relaxed">
              All outgoing email notifications include direct 1-click links to open the Explainability Modal inside Profit Tool.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
