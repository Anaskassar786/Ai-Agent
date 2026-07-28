/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PROFIT TOOL — Cart & Customer Intelligence Hub
 */

import React, { useState } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Tag, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Cart, Customer, Store } from '../types.ts';

interface CartIntelligenceHubProps {
  carts: Cart[];
  customers: Customer[];
  activeStore: Store | null;
  onRefresh: () => void;
}

export const CartIntelligenceHub: React.FC<CartIntelligenceHubProps> = ({
  carts,
  customers,
  activeStore,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'carts' | 'customers'>('carts');
  const [searchTerm, setSearchTerm] = useState('');

  const currencySymbol = activeStore?.currency === 'EUR' ? '€' : activeStore?.currency === 'GBP' ? '£' : '$';

  const filteredCarts = carts.filter(c => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return c.customerName?.toLowerCase().includes(q) || 
           c.customerEmail?.toLowerCase().includes(q) || 
           c.items.some(i => i.title.toLowerCase().includes(q));
  });

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return c.firstName.toLowerCase().includes(q) || 
           c.lastName.toLowerCase().includes(q) || 
           c.email.toLowerCase().includes(q) ||
           c.tags.some(t => t.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Cart & Customer Intelligence Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization with Shopify Orders, Checkouts, and Customer Webhooks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search carts or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>

          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('carts')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'carts' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Abandoned Carts ({carts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'customers' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Synced Customers ({customers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CARTS TABLE */}
      {activeTab === 'carts' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Cart ID & Status</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Line Items</th>
                  <th className="py-3.5 px-6">Total Value</th>
                  <th className="py-3.5 px-6">Discount / Country</th>
                  <th className="py-3.5 px-6 text-right">Shopify Checkout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredCarts.map((cart) => (
                  <tr key={cart.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6">
                      <div className="font-mono text-white font-bold">{cart.id}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold mt-1 ${
                        cart.status === 'Recovered' ? 'bg-emerald-500/20 text-emerald-400' :
                        cart.status === 'Abandoned' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {cart.status}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{cart.customerName || 'Guest Customer'}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{cart.customerEmail || 'No email provided'}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="space-y-1 max-w-xs">
                        {cart.items.map((i, idx) => (
                          <div key={idx} className="text-slate-300 flex items-center justify-between">
                            <span className="truncate">{i.quantity}x {i.title}</span>
                            <span className="font-mono text-slate-500 ml-2">{currencySymbol}{i.price}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono font-black text-white text-sm">
                      {currencySymbol}{cart.totalValue.toFixed(2)}
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-300">
                      <div>{cart.discountCode ? `Tag: ${cart.discountCode}` : 'No code'}</div>
                      <div className="text-slate-500 text-[11px]">Country: {cart.shippingCountry || 'US'}</div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <a
                        href={cart.checkoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition"
                      >
                        <span>Checkout</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCarts.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">No abandoned carts matching filter</div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOMERS TABLE */}
      {activeTab === 'customers' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Customer Profile</th>
                  <th className="py-3.5 px-6">VIP Status</th>
                  <th className="py-3.5 px-6">Total Orders</th>
                  <th className="py-3.5 px-6">Lifetime Value (LTV)</th>
                  <th className="py-3.5 px-6">Behavior Tags</th>
                  <th className="py-3.5 px-6 text-right">Shopify ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{cust.firstName} {cust.lastName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{cust.email}</div>
                    </td>

                    <td className="py-4 px-6">
                      {cust.isVIP ? (
                        <span className="inline-flex items-center space-x-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-md font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Top Tier VIP</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Standard Buyer</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {cust.totalOrders} Orders
                    </td>

                    <td className="py-4 px-6 font-mono font-black text-emerald-400 text-sm">
                      {currencySymbol}{cust.totalSpent.toFixed(2)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags.map((tag, i) => (
                          <span key={i} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-500 text-right">
                      {cust.shopifyCustomerId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">No customer profiles matching filter</div>
          )}
        </div>
      )}

    </div>
  );
};
