/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Immutable Audit Trail & Security Log Viewer
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  History, 
  Lock, 
  Search, 
  Database, 
  CheckCircle, 
  FileCode, 
  ExternalLink,
  Cpu
} from 'lucide-react';
import { AuditLog, Store } from '../types.ts';
import { POSTGRESQL_DDL_SCHEMA } from '../server/db/schema.ts';

interface AuditLogViewerProps {
  logs: AuditLog[];
  activeStore: Store | null;
  onRefresh: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  activeStore,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'schema'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return l.action.toLowerCase().includes(q) || 
           l.actor.toLowerCase().includes(q) || 
           l.details.toLowerCase().includes(q) ||
           (l.recommendationId && l.recommendationId.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            <span>Immutable Audit Trails & Security</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Append-only enterprise logging. Every AI recommendation, webhook, and state transition is cryptographically logged.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Logs ({logs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'schema' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Schema DDL</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AUDIT LOGS TABLE */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Audit records are strictly immutable. They cannot be edited, deleted, or altered by merchant users or system scripts.</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none w-56 font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Timestamp & ID</th>
                    <th className="py-3.5 px-6">Action Executed</th>
                    <th className="py-3.5 px-6">Actor / Identity</th>
                    <th className="py-3.5 px-6">Target Recommendation / Entity</th>
                    <th className="py-3.5 px-6">Trace Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-6 text-slate-400">
                        <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-[9px] text-slate-600 mt-0.5">{log.id}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded font-bold text-[11px] ${
                          log.action.includes('CREATED') || log.action.includes('FIRED') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          log.action.includes('COMPLETED') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          log.action.includes('SNOOZED') || log.action.includes('UPDATED') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-sans">
                        <div className="font-semibold text-white">{log.actor}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Verified Session</div>
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        {log.recommendationId ? (
                          <span className="text-emerald-400 font-bold underline">{log.recommendationId}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 font-sans text-slate-300 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-xs">No audit logs matching search query</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POSTGRESQL SCHEMA DDL VIEWER */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <span>Production PostgreSQL Enterprise DDL</span>
              </h3>
              <p className="text-xs text-slate-400">
                Complete relational SQL schema with foreign keys, indexes, and JSONB evidence snapshot columns.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded border border-emerald-500/20 font-bold">
              PostgreSQL 16+ Compatible
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
              {POSTGRESQL_DDL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
