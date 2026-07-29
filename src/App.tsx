/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Main Application Dashboard
 * AI Decision Support System for Shopify Merchants
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, TabType } from './components/Sidebar.tsx';
import { OverviewDashboard } from './components/OverviewDashboard.tsx';
import { RecommendationsView } from './components/RecommendationsView.tsx';
import { ExplainabilityModal } from './components/ExplainabilityModal.tsx';
import { RuleEngineStudio } from './components/RuleEngineStudio.tsx';
import { CartIntelligenceHub } from './components/CartIntelligenceHub.tsx';
import { BillingManager } from './components/BillingManager.tsx';
import { AuditLogViewer } from './components/AuditLogViewer.tsx';
import { NotificationCenter } from './components/NotificationCenter.tsx';
import { 
  Store, 
  Recommendation, 
  DashboardMetrics, 
  RuleVersion, 
  Cart, 
  Customer, 
  AuditLog, 
  NotificationAlert,
  BillingPlan,
  RecommendationStatus
} from './types.ts';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [rules, setRules] = useState<RuleVersion[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  
  // Explainability Modal state
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  
  // Simulating webhook
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Data Fetching from Express API
  const fetchAllData = async (storeId?: string) => {
    try {
      const headers = {
        'Authorization': 'Bearer sample_jwt_token',
        'x-demo-store-id': storeId || activeStore?.id || 'store_fashionista'
      };

      const [
        storesRes,
        recsRes,
        metricsRes,
        rulesRes,
        cartsCustsRes,
        auditRes,
        notifRes,
        billingRes
      ] = await Promise.all([
        fetch('/api/stores', { headers }).then(r => r.json()),
        fetch('/api/recommendations', { headers }).then(r => r.json()),
        fetch('/api/analytics/metrics', { headers }).then(r => r.json()),
        fetch('/api/rules', { headers }).then(r => r.json()),
        fetch('/api/analytics/carts-customers', { headers }).then(r => r.json()),
        fetch('/api/audit-logs', { headers }).then(r => r.json()),
        fetch('/api/notifications', { headers }).then(r => r.json()),
        fetch('/api/billing/plans', { headers }).then(r => r.json())
      ]);

      if (Array.isArray(storesRes)) {
        setStores(storesRes);
        if (!activeStore || storeId) {
          const found = storesRes.find((s: Store) => s.id === (storeId || 'store_fashionista')) || storesRes[0];
          setActiveStore(found);
        }
      }
      if (Array.isArray(recsRes)) setRecommendations(recsRes);
      if (metricsRes && !metricsRes.error) setMetrics(metricsRes);
      if (Array.isArray(rulesRes)) setRules(rulesRes);
      if (cartsCustsRes && cartsCustsRes.carts) {
        setCarts(cartsCustsRes.carts);
        setCustomers(cartsCustsRes.customers || []);
      }
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
      if (Array.isArray(notifRes)) setNotifications(notifRes);
      if (Array.isArray(billingRes)) setBillingPlans(billingRes);

    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleSelectStore = async (storeId: string) => {
    await fetchAllData(storeId);
  };

  const handleUpdateRecommendationStatus = async (id: string, status: RecommendationStatus, snoozedUntil?: string) => {
    try {
      const res = await fetch(`/api/recommendations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sample_jwt_token' },
        body: JSON.stringify({ status, snoozedUntil })
      }).then(r => r.json());

      if (res && !res.error) {
        setRecommendations(prev => prev.map(r => r.id === id ? res : r));
        if (selectedRecommendation?.id === id) setSelectedRecommendation(res);
        await fetchAllData();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSubmitFeedback = async (id: string, isUseful: boolean, comments?: string) => {
    try {
      await fetch(`/api/recommendations/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sample_jwt_token' },
        body: JSON.stringify({ isUseful, comments, reason: isUseful ? 'Merchant verified helpful' : 'Merchant marked inaccurate' })
      });
      await fetchAllData();
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      await fetch(`/api/rules/${ruleId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer sample_jwt_token' }
      });
      await fetchAllData();
    } catch (err) {
      console.error('Toggle rule failed:', err);
    }
  };

  const handleCreateRule = async (ruleData: any) => {
    try {
      await fetch(`/api/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sample_jwt_token' },
        body: JSON.stringify(ruleData)
      });
      await fetchAllData();
    } catch (err) {
      console.error('Create rule failed:', err);
    }
  };

  const handleSimulateRule = async (params: any) => {
    return fetch(`/api/rules/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sample_jwt_token' },
      body: JSON.stringify(params)
    }).then(r => r.json());
  };

  const handleSubscribePlan = async (planId: 'Starter' | 'Growth' | 'Scale') => {
    try {
      await fetch(`/api/billing/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sample_jwt_token' },
        body: JSON.stringify({ planId, returnUrl: '/dashboard' })
      });
      await fetchAllData();
    } catch (err) {
      console.error('Subscribe failed:', err);
    }
  };

  const handleMarkNotifAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer sample_jwt_token' }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleMarkAllNotifsAsRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer sample_jwt_token' }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const handleTriggerTestWebhook = async () => {
    setIsSimulating(true);
    try {
      await fetch(`/api/test/trigger-abandoned-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sample_jwt_token' },
        body: JSON.stringify({
          shopDomain: activeStore?.shopifyDomain,
          totalValue: Math.floor(Math.random() * 800) + 200,
          isVIP: Math.random() > 0.4
        })
      });
      await fetchAllData();
      setActiveTab('recommendations');
    } catch (err) {
      console.error('Test webhook trigger failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const activeRecsCount = recommendations.filter(r => r.status !== 'Completed' && r.status !== 'Archived').length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        stores={stores}
        activeStore={activeStore}
        onSelectStore={handleSelectStore}
        notifications={notifications}
        onOpenNotifications={() => setActiveTab('notifications')}
        onTriggerTestWebhook={handleTriggerTestWebhook}
        isSimulating={isSimulating}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeRecommendationsCount={activeRecsCount}
          unreadNotificationsCount={unreadNotifsCount}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950">
          
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              activeStore={activeStore}
              recentRecommendations={recommendations}
              onSelectRecommendation={setSelectedRecommendation}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onTriggerTestWebhook={handleTriggerTestWebhook}
              isSimulating={isSimulating}
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsView
              recommendations={recommendations}
              activeStore={activeStore}
              onSelectRecommendation={setSelectedRecommendation}
              onUpdateStatus={handleUpdateRecommendationStatus}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'rules' && (
            <RuleEngineStudio
              rules={rules}
              activeStore={activeStore}
              onToggleRule={handleToggleRule}
              onCreateRule={handleCreateRule}
              onSimulate={handleSimulateRule}
            />
          )}

          {activeTab === 'carts' && (
            <CartIntelligenceHub
              carts={carts}
              customers={customers}
              activeStore={activeStore}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
              <div className="bg-slate-900/80 rounded-3xl p-8 border border-slate-800 text-center space-y-3">
                <h2 className="text-2xl font-bold text-white">ROI & Attribution Analytics</h2>
                <p className="text-slate-400 text-sm max-w-xl mx-auto">
                  Profit Tool attributes revenue recovery exclusively when a customer checks out within 30 days of an AI recommendation being marked completed.
                </p>
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold">Total Evaluated Carts</div>
                    <div className="text-2xl font-black text-white mt-1">{carts.length * 14}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold">AI Accuracy Rate</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">98.4%</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold">Net ROI Multiplier</div>
                    <div className="text-2xl font-black text-purple-400 mt-1">14.2x</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationCenter
              notifications={notifications}
              activeStore={activeStore}
              onMarkAsRead={handleMarkNotifAsRead}
              onMarkAllAsRead={handleMarkAllNotifsAsRead}
            />
          )}

          {activeTab === 'billing' && (
            <BillingManager
              plans={billingPlans}
              activeStore={activeStore}
              onSubscribe={handleSubscribePlan}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogViewer
              logs={auditLogs}
              activeStore={activeStore}
              onRefresh={fetchAllData}
            />
          )}

        </main>
      </div>

      {/* Explainability Deep-Dive Modal */}
      {selectedRecommendation && (
        <ExplainabilityModal
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          onUpdateStatus={handleUpdateRecommendationStatus}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

    </div>
  );
}

export default App;
