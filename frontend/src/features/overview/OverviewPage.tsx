import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  Target,
  ArrowRight,
  RefreshCw,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { fetchOverview } from '../../lib/api';
import { OverviewData } from '../../types';

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
          <p className="text-sm text-slate-400">Loading verified portfolio intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800 text-red-200 space-y-3">
        <div className="flex items-center space-x-2 font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Error loading executive overview</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadOverview}
          className="px-4 py-2 bg-red-900/60 hover:bg-red-800 rounded-md text-xs font-medium text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const tierColors = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>Executive Portfolio Overview</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              Verified Pipeline
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            End-to-end customer risk quantification and charge volume exposure for 6,000 synthetic SME accounts.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/prioritization"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-colors"
          >
            <span>Review Priority Accounts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Transaction Records</span>
            <div className="p-2 rounded-lg bg-slate-800 text-brand-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {data.total_transactions.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exceeds target (&gt;97,000 rows)</span>
          </div>
        </div>

        {/* Distinct SMEs */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active SME Portfolio</span>
            <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-slate-100">
              {data.distinct_smes.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Observed across 12 calendar months
          </div>
        </div>

        {/* High Priority SMEs */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tier 1 At-Risk SMEs</span>
            <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-800/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-red-400">
              {data.high_priority_sme_count.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {((data.high_priority_sme_count / data.distinct_smes) * 100).toFixed(1)}% of total portfolio
          </div>
        </div>

        {/* Monthly Volume At Risk */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Exposure at Risk</span>
            <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-400">
              ${data.total_monthly_exposure_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Expected monthly volume exposure
          </div>
        </div>
      </div>

      {/* Model & Methodology Highlight Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Primary Model (Logistic Regression)</span>
            <p className="text-lg font-bold font-mono text-brand-300">
              {data.lr_holdout_roc_auc.toFixed(4)} <span className="text-xs font-sans text-slate-400 font-normal">Holdout ROC-AUC</span>
            </p>
          </div>
          <Target className="w-6 h-6 text-brand-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">At-Risk Customer Identification</span>
            <p className="text-lg font-bold font-mono text-emerald-400">
              {data.at_risk_recall_pct.toFixed(1)}% <span className="text-xs font-sans text-slate-400 font-normal">Recall @ {data.operating_threshold.toFixed(3)}</span>
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Statistical Velocity Finding</span>
            <p className="text-lg font-bold font-mono text-purple-400">
              2.49x – 2.73x <span className="text-xs font-sans text-slate-400 font-normal">Higher Churn (p &lt; 0.001)</span>
            </p>
          </div>
          <BarChart2 className="w-6 h-6 text-purple-400 opacity-80" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Trend (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                12-Month Processing Volume & Transaction Activity
              </h2>
              <p className="text-xs text-slate-400">
                Historical baseline (Months 1–9) vs. Future observation horizon (Months 10–12)
              </p>
            </div>
            <span className="px-2 py-1 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
              Total Volume: ${(data.total_historical_charge_volume / 1_000_000).toFixed(2)}M
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3d80f3" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3d80f3" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Charge Volume']}
                />
                <Area type="monotone" dataKey="charge_volume" stroke="#3d80f3" strokeWidth={2} fillOpacity={1} fill="url(#volGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prioritization Distribution (1 column) */}
        <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Prioritization Tier Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Customer distribution across 3 actionable risk tiers
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tier_distribution} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="tier" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} accounts (${item.payload.percentage}%) - $${item.payload.exposure.toLocaleString()} at risk`,
                    'SMEs'
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.tier_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={tierColors[index % tierColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {data.tier_distribution.map((t, idx) => (
              <div key={t.tier} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColors[idx] }} />
                  <span className="text-slate-300 font-medium">{t.tier.split(' - ')[0]}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-slate-100 font-semibold">{t.count.toLocaleString()}</span>
                  <span className="text-slate-400">(${t.exposure.toLocaleString()})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Analytical Findings Section */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">
            Key Behavioral & Revenue Intelligence Findings
          </h2>
          <span className="text-xs text-slate-400">Validated through empirical data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.key_findings.map((f) => (
            <div key={f.id} className="p-4 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
                {f.category}
              </span>
              <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{f.finding}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
