import React, { useState } from 'react';
import {
  X,
  Globe,
  Github,
  Layers,
  CheckCircle2,
  ExternalLink,
  Copy,
  Shield,
  Bike,
  ShoppingBag,
  Crown,
  Database,
  Terminal,
  Zap,
  Check,
  Server,
  Cloud
} from 'lucide-react';
import { PORTAL_METADATA, PortalMode, getDetectedPortalMode } from '../utils/portalConfig';

interface MultiSiteDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPortal?: (portal: PortalMode) => void;
}

export const MultiSiteDeploymentModal: React.FC<MultiSiteDeploymentModalProps> = ({
  isOpen,
  onClose,
  onSelectPortal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quickpal_dns' | 'vercel' | 'github' | 'firebase'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const portalsList: {
    id: PortalMode;
    icon: React.ReactNode;
    title: string;
    domain: string;
    envVar: string;
    desc: string;
    badgeColor: string;
  }[] = [
    {
      id: 'customer',
      icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
      title: '1. Customer Storefront App',
      domain: 'https://quickpal.in (or https://customer.quickpal.in)',
      envVar: 'VITE_PORTAL_MODE=customer',
      desc: 'Clean 10-minute grocery shopping experience, UPI/COD checkout, coupon application, and live visual map order tracking.',
      badgeColor: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300'
    },
    {
      id: 'partner',
      icon: <Bike className="w-5 h-5 text-blue-500" />,
      title: '2. Delivery Rider Fleet App',
      domain: 'https://rider.quickpal.in (or https://partner.quickpal.in)',
      envVar: 'VITE_PORTAL_MODE=partner',
      desc: 'Mobile-first rider app with real-time order dispatch notifications, accept/reject controls, live navigation, and OTP delivery completion.',
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300'
    },
    {
      id: 'admin',
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      title: '3. Store Operations & Admin',
      domain: 'https://admin.quickpal.in',
      envVar: 'VITE_PORTAL_MODE=admin',
      desc: 'Store backoffice for managing product catalog, inventory stock, incoming order dispatch, support tickets, and rider performance.',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
    },
    {
      id: 'owner',
      icon: <Crown className="w-5 h-5 text-purple-500" />,
      title: '4. Executive Owner Control Hub',
      domain: 'https://owner.quickpal.in',
      envVar: 'VITE_PORTAL_MODE=owner',
      desc: 'Executive analytics suite, daily net revenue calculation, UPI payment QR gateway management, staff provisioning, and serviceable PIN code controls.',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-gray-900 via-stone-900 to-amber-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  quickpal.in • 4 Websites Setup
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  1 Repo • 1 Firebase • 4 Subdomains
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Customer Store, Delivery Rider App, Store Admin & Owner Suite under <strong>quickpal.in</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 dark:bg-gray-800/80 px-5 pt-3 border-b border-gray-200 dark:border-gray-700 flex gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" /> 4 Portals & Live Test
          </button>
          <button
            onClick={() => setActiveTab('quickpal_dns')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'quickpal_dns'
                ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-500" /> quickpal.in DNS Setup
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'vercel'
                ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Server className="w-4 h-4" /> Vercel Projects Setup
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Github className="w-4 h-4" /> GitHub 1-Repo Sync
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs flex items-center gap-2 border-t border-x transition-all whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 border-gray-200 dark:border-gray-700 shadow-xs'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Database className="w-4 h-4" /> Shared Real-Time Firebase
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: 4 PORTALS OVERVIEW & INSTANT SWITCH */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">
                    Your 4 Portals on quickpal.in
                  </h4>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    You can host all 4 distinct portals under <strong>quickpal.in</strong> using 4 subdomains connected to the same GitHub repository and live Firebase database.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portalsList.map(portal => (
                  <div
                    key={portal.id}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                            {portal.icon}
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                            {portal.title}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                          {portal.id.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {portal.desc}
                      </p>

                      <div className="space-y-1 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 font-mono text-[11px]">
                        <div className="text-gray-400 text-[10px]">Your Live URL:</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
                          {portal.domain}
                        </div>
                        <div className="text-gray-400 text-[10px] pt-1">Vercel Env Var:</div>
                        <div className="text-gray-700 dark:text-gray-300 font-bold flex items-center justify-between">
                          <span>{portal.envVar}</span>
                          <button
                            onClick={() => handleCopy(portal.envVar, portal.id)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Copy Env Var"
                          >
                            {copiedKey === portal.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`?portal=${portal.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Test In New Tab
                      </a>
                      {onSelectPortal && (
                        <button
                          onClick={() => {
                            onSelectPortal(portal.id);
                            onClose();
                          }}
                          className="py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          Switch Here
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: QUICKPAL.IN DNS SETUP */}
          {activeTab === 'quickpal_dns' && (
            <div className="space-y-5 text-xs text-gray-600 dark:text-gray-300">
              <div className="bg-gradient-to-r from-emerald-950/60 via-stone-900 to-emerald-950/60 p-4 rounded-2xl border border-emerald-800/60 space-y-2 text-white">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Exact DNS Records for quickpal.in (Registrar: GoDaddy / Hostinger / Namecheap / Cloudflare)
                </div>
                <p className="text-xs text-gray-300">
                  Add these 5 simple DNS records in your domain control panel where you purchased <strong>quickpal.in</strong>:
                </p>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="p-3">Type</th>
                        <th className="p-3">Name / Host</th>
                        <th className="p-3">Value / Target</th>
                        <th className="p-3">Target Portal</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                      <tr>
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">A</td>
                        <td className="p-3 font-bold">@ (or quickpal.in)</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">76.76.21.21</td>
                        <td className="p-3 font-sans font-medium text-xs">Customer Storefront</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleCopy('76.76.21.21', 'dns-a')} className="p-1 hover:text-orange-500">
                            {copiedKey === 'dns-a' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">CNAME</td>
                        <td className="p-3 font-bold">www</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">cname.vercel-dns.com</td>
                        <td className="p-3 font-sans font-medium text-xs">Redirects to quickpal.in</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleCopy('cname.vercel-dns.com', 'dns-www')} className="p-1 hover:text-orange-500">
                            {copiedKey === 'dns-www' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">CNAME</td>
                        <td className="p-3 font-bold">rider (or partner)</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">cname.vercel-dns.com</td>
                        <td className="p-3 font-sans font-medium text-xs">Rider App (rider.quickpal.in)</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleCopy('cname.vercel-dns.com', 'dns-rider')} className="p-1 hover:text-orange-500">
                            {copiedKey === 'dns-rider' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">CNAME</td>
                        <td className="p-3 font-bold">admin</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">cname.vercel-dns.com</td>
                        <td className="p-3 font-sans font-medium text-xs">Store Admin (admin.quickpal.in)</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleCopy('cname.vercel-dns.com', 'dns-admin')} className="p-1 hover:text-orange-500">
                            {copiedKey === 'dns-admin' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-amber-600 dark:text-amber-400">CNAME</td>
                        <td className="p-3 font-bold">owner</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">cname.vercel-dns.com</td>
                        <td className="p-3 font-sans font-medium text-xs">Owner Suite (owner.quickpal.in)</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleCopy('cname.vercel-dns.com', 'dns-owner')} className="p-1 hover:text-orange-500">
                            {copiedKey === 'dns-owner' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Auto-Renewing SSL (HTTPS)
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-[11px]">
                  Vercel automatically provisions and renews free Let's Encrypt SSL certificates for <strong>https://quickpal.in</strong>, <strong>https://rider.quickpal.in</strong>, <strong>https://admin.quickpal.in</strong>, and <strong>https://owner.quickpal.in</strong> within 2 minutes of adding the DNS records.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VERCEL DEPLOYMENT STEP-BY-STEP */}
          {activeTab === 'vercel' && (
            <div className="space-y-5 text-xs text-gray-600 dark:text-gray-300">
              <div className="bg-stone-950 text-stone-200 p-4 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Server className="w-4 h-4 text-emerald-400" />
                  How to Deploy 4 Vercel Projects from 1 GitHub Repo:
                </div>
                <p className="text-gray-400">
                  Follow these 4 simple steps in your Vercel Dashboard (https://vercel.com):
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">1</span>
                    Push Code to GitHub
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-8">
                    Push this codebase to a private or public GitHub repository (e.g. <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded font-mono">https://github.com/yourusername/quickpal-app</code>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">2</span>
                    Create 4 Projects in Vercel
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-8">
                    In Vercel, click <strong>"Add New..." → "Project"</strong> and select your GitHub repo 4 times, giving each project a clear name:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-[11px]">
                      <strong>Project 1:</strong> quickpal-customer
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-[11px]">
                      <strong>Project 2:</strong> quickpal-rider
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-[11px]">
                      <strong>Project 3:</strong> quickpal-admin
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-[11px]">
                      <strong>Project 4:</strong> quickpal-owner
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">3</span>
                    Set Environment Variables in Each Vercel Project
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-8">
                    In each Vercel project settings (<strong>Settings → Environment Variables</strong>), add the respective <code className="font-mono text-orange-600 font-bold">VITE_PORTAL_MODE</code>:
                  </p>
                  <div className="space-y-2 pl-8">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-[11px]">
                      <span>quickpal-customer ➜ <strong>VITE_PORTAL_MODE=customer</strong></span>
                      <button onClick={() => handleCopy('VITE_PORTAL_MODE=customer', 'v1')} className="text-gray-400 hover:text-orange-500">
                        {copiedKey === 'v1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-[11px]">
                      <span>quickpal-rider ➜ <strong>VITE_PORTAL_MODE=partner</strong></span>
                      <button onClick={() => handleCopy('VITE_PORTAL_MODE=partner', 'v2')} className="text-gray-400 hover:text-orange-500">
                        {copiedKey === 'v2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-[11px]">
                      <span>quickpal-admin ➜ <strong>VITE_PORTAL_MODE=admin</strong></span>
                      <button onClick={() => handleCopy('VITE_PORTAL_MODE=admin', 'v3')} className="text-gray-400 hover:text-orange-500">
                        {copiedKey === 'v3' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-[11px]">
                      <span>quickpal-owner ➜ <strong>VITE_PORTAL_MODE=owner</strong></span>
                      <button onClick={() => handleCopy('VITE_PORTAL_MODE=owner', 'v4')} className="text-gray-400 hover:text-orange-500">
                        {copiedKey === 'v4' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">4</span>
                    Attach Custom Domains (Optional)
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-8">
                    Attach your custom domain subdomains in Vercel (<strong>Domains</strong> tab):
                    <br />
                    • <code className="font-mono font-bold">quickpal.in</code> or <code className="font-mono font-bold">customer.quickpal.in</code>
                    <br />
                    • <code className="font-mono font-bold">rider.quickpal.in</code>
                    <br />
                    • <code className="font-mono font-bold">admin.quickpal.in</code>
                    <br />
                    • <code className="font-mono font-bold">owner.quickpal.in</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB 1-REPO FLOW */}
          {activeTab === 'github' && (
            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Github className="w-4 h-4 text-white" />
                  Single GitHub Repository Benefits:
                </div>
                <p className="text-gray-400 text-xs">
                  Why 1 Repository is far superior to maintaining 4 separate codebases:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h5 className="font-bold text-gray-900 dark:text-gray-100">Single Source of Truth</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    All types (`Order`, `Product`, `User`), components, and database models are updated in one place with zero duplication.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h5 className="font-bold text-gray-900 dark:text-gray-100">Instant Simultaneous Updates</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    When you push a commit to `main`, Vercel automatically deploys the update across Customer, Rider, Admin, and Owner websites simultaneously.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h5 className="font-bold text-gray-900 dark:text-gray-100">Zero Code Drift</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Firestore schemas, payment flows, and OTP verification algorithms never fall out of sync between portals.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                <span className="font-bold text-gray-900 dark:text-gray-100 block">
                  Copyable Git Push Workflow:
                </span>
                <div className="bg-gray-950 text-gray-200 font-mono text-[11px] p-3 rounded-xl space-y-1">
                  <div>git add .</div>
                  <div>git commit -m "Deploy latest QuickPal multi-portal update"</div>
                  <div>git push origin main</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHARED REAL-TIME FIREBASE SYNC */}
          {activeTab === 'firebase' && (
            <div className="space-y-4 text-xs text-gray-600 dark:text-gray-300">
              <div className="bg-orange-950/40 text-orange-200 p-4 rounded-2xl border border-orange-900/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-orange-300">
                  <Database className="w-4 h-4 text-orange-400" />
                  How the 4 Websites Talk to the Exact Same Firebase Firestore Database:
                </div>
                <p className="text-xs text-orange-200/80">
                  All 4 websites connect to the identical Firestore collections (`orders`, `products`, `users`, `partners`, `pincodes`, `payment_settings`):
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 font-bold shrink-0">
                    🛒 ➜ 🛡️
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">1. Customer Places Order</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      When a customer buys on <strong>quickpal.vercel.app</strong>, it is instantly written to Firestore collection `orders`. Store Admin on <strong>admin-quickpal.vercel.app</strong> hears an instant chime and sees the new order.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-bold shrink-0">
                    🛡️ ➜ 🛵
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">2. Admin Assigns Delivery Rider</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Admin assigns the order to a rider. The delivery partner on <strong>rider-quickpal.vercel.app</strong> receives an instant order dispatch alert with pickup address and item details.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 font-bold shrink-0">
                    🛵 ➜ 🛒
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">3. Rider Completes Delivery with OTP</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Rider arrives, requests customer's 4-digit OTP, and submits it in the Rider app. Order status changes to `delivered` in real-time across Customer, Admin, and Owner suites.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 font-bold shrink-0">
                    👑 ➜ 🌐
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">4. Owner Updates UPI QR or Prices</h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      When the Owner modifies UPI IDs or delivery radius in <strong>owner-quickpal.vercel.app</strong>, the changes immediately reflect on the Customer checkout screen without needing a redeploy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">
            Current Detected Mode: <strong className="text-orange-500 uppercase">{PORTAL_METADATA[getDetectedPortalMode()?.mode || 'unified']?.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
