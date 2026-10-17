import React from 'react';
import { ShieldCheck, Database, GitCommit, Activity } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 bg-black border-b border-zinc-800 text-white px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white font-bold text-lg">
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-tight text-base text-white">SME Retention Intelligence</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700/80">
              REVENUE ANALYTICS
            </span>
          </div>
          <p className="text-xs text-zinc-400">Identify customer risk. Quantify revenue exposure. Prioritize action.</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs">
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300">
          <Database className="w-3.5 h-3.5 text-zinc-400" />
          <span>Synthetic Cohort: <strong className="text-white">6,000 SMEs (130K+ tx)</strong></span>
        </div>
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300">
          <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
          <span>Seed: <strong className="text-white">42 (Deterministic)</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-zinc-900 text-emerald-400 border border-zinc-800 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit Verified</span>
        </div>
      </div>
    </header>
  );
};
