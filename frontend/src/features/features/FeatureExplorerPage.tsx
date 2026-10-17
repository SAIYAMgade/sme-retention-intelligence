import React, { useEffect, useState } from 'react';
import { Sliders, Search, ShieldCheck, Database, Layers } from 'lucide-react';
import { fetchFeatureRegistry, fetchFeatureDistributions } from '../../lib/api';
import { FeatureDefinition } from '../../types';

export const FeatureExplorerPage: React.FC = () => {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [distributions, setDistributions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const [reg, dist] = await Promise.all([
        fetchFeatureRegistry(),
        fetchFeatureDistributions()
      ]);
      setFeatures(reg);
      const distMap: Record<string, any> = {};
      dist.forEach((d) => { distMap[d.feature_name] = d; });
      setDistributions(distMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Frequency & Activity',
    'Amount & Volume',
    'Trend & Velocity',
    'Reliability & Variability',
    'Business Mix'
  ];

  const filtered = features.filter((f) => {
    const matchCat = category === 'All' || f.category === category;
    const matchSearch =
      search === '' ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.display_name.toLowerCase().includes(search.toLowerCase()) ||
      f.definition.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>Behavioral Feature Explorer</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800">
              Exactly 44 Verified Features
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Canonical data dictionary of engineered behavioral features calculated strictly at Month 9 cutoff with zero data leakage.
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Cutoff: Timestamp &le; 2023-09-30</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search 44 features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((f) => {
          const stats = distributions[f.name];
          return (
            <div key={f.name} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-100">{f.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      #{f.id}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-brand-300 mt-0.5">{f.display_name}</h3>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 whitespace-nowrap">
                  {f.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{f.definition}</p>

              {/* Formula & Window */}
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] space-y-1">
                <div className="text-brand-400 truncate">
                  <span className="text-slate-500 select-none">Formula: </span>
                  {f.formula}
                </div>
                <div className="text-slate-400 flex items-center justify-between text-[10px]">
                  <span>Window: <strong className="text-slate-300">{f.calculation_window}</strong></span>
                  <span>Missing: <strong className="text-slate-300">{f.missing_policy}</strong></span>
                </div>
              </div>

              {/* Statistical Contrast (Churned vs Retained) */}
              {stats && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Mean Contrast:</span>
                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-red-400">Churned: {stats.churned_mean}</span>
                    <span className="text-emerald-400">Retained: {stats.retained_mean}</span>
                    <span className="text-slate-500">d={stats.cohens_d}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
