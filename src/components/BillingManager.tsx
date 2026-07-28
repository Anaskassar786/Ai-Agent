/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Shopify Billing API Subscription Manager
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { BillingPlan, Store } from '../types.ts';

interface BillingManagerProps {
  plans: BillingPlan[];
  activeStore: Store | null;
  onSubscribe: (planId: 'Starter' | 'Growth' | 'Scale') => Promise<void>;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  plans,
  activeStore,
  onSubscribe
}) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectPlan = async (planId: 'Starter' | 'Growth' | 'Scale') => {
    setLoadingPlan(planId);
    try {
      await onSubscribe(planId);
      setSuccessMessage(`Successfully switched to ${planId} Plan via Shopify Billing API!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Official Shopify Billing Integration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Transparent ROI-Driven Plans for Your Shopify Store
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          Charges are billed directly through your Shopify invoice. Upgrade or downgrade seamlessly with automated usage metering and zero contracts.
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-2xl max-w-2xl mx-auto flex items-center justify-between text-xs text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = activeStore?.activePlan === plan.id;
          const isGrowth = plan.id === 'Growth';
          
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 lg:p-8 border transition flex flex-col justify-between relative shadow-xl ${
                isGrowth
                  ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-emerald-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {isGrowth && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow">
                  Most Popular for Shopify Plus
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-4xl font-extrabold text-white font-mono">${plan.priceMonthly}</span>
                    <span className="text-xs text-slate-400 ml-1.5">/ month USD</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Billed directly on your Shopify statement</p>
                </div>

                <div className="border-t border-slate-800 pt-6 space-y-3">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Included Capabilities
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start space-x-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isGrowth ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full bg-slate-800 text-emerald-400 font-bold py-3 rounded-xl border border-emerald-500/30 text-xs flex items-center justify-center space-x-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id as any)}
                    disabled={loadingPlan === plan.id}
                    className={`w-full font-bold py-3.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg ${
                      isGrowth
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <span>Redirecting to Shopify Billing...</span>
                    ) : (
                      <>
                        <span>Switch to {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* FAQ / Shopify Compliance Note */}
      <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 max-w-4xl mx-auto flex items-start space-x-4">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white">Shopify App Store Billing Compliance</h4>
          <p className="text-slate-400 leading-relaxed">
            All recurring charges and plan upgrades adhere strictly to Shopify’s Application Billing API. You will always receive a Shopify confirmation prompt before any charge is applied to your merchant account.
          </p>
        </div>
      </div>

    </div>
  );
};
