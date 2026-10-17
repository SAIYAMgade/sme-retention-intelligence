import React from 'react';
import { ShieldCheck, Database, GitCommit, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-bold text-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-tight text-base text-slate-100">SME Retention Intelligence</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-950 text-brand-300 border border-brand-800/60">
              REVENUE ANALYTICS
            </span>
          </div>
          <p className="text-xs text-slate-400">Identify customer risk. Quantify revenue exposure. Prioritize action.</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
          <Database className="w-3.5 h-3.5 text-brand-400" />
          <span>Synthetic Cohort: <strong className="text-slate-100">6,000 SMEs (130K+ tx)</strong></span>
        </div>
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
          <span>Seed: <strong className="text-slate-100">42 (Deterministic)</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Verified</span>
        </div>
      </div>
    </header>
  );
};
