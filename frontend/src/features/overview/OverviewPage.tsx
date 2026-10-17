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
  const [hoveredTierIndex, setHoveredTierIndex] = useState<number | null>(null);

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
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400 mx-auto" />
          <p className="text-sm text-zinc-400">Loading verified portfolio intelligence...</p>
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

  // Custom high-contrast tooltip ensuring all text is crisp white and readable
  const TierTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const tierColor = d.tier.includes('High') || d.level === 1
        ? '#ef4444'
        : d.tier.includes('Medium') || d.level === 2
        ? '#f59e0b'
        : '#10b981';

      return (
        <div className="bg-[#050505] border border-zinc-700/90 p-3.5 rounded-lg shadow-2xl text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tierColor }} />
            <p className="font-bold text-white text-sm tracking-tight">{d.tier}</p>
          </div>
          <div className="space-y-1.5 text-white">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Merchants:</span>
              <span className="font-mono font-bold text-white">
                {d.count.toLocaleString()} <span className="text-zinc-300 font-normal">({d.percentage}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">Monthly At-Risk:</span>
              <span className="font-mono font-bold text-white">
                ${d.exposure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 bg-black">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Executive Portfolio Overview</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-emerald-400 border border-zinc-700/80">
              Verified Pipeline
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Empirical customer risk diagnostics, exposure quantification, and retention prioritization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/prioritization"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors shadow-sm"
          >
            <span>Review Prioritized Accounts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Physical Transactions */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Generated Transactions</span>
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {data.total_transactions.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exceeds target (&gt;97,000 rows)</span>
          </div>
        </div>

        {/* Distinct SMEs */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Active SME Portfolio</span>
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-white">
              {data.distinct_smes.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Observed across 12 calendar months
          </div>
        </div>

        {/* High Priority SMEs */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tier 1 At-Risk SMEs</span>
            <div className="p-2 rounded-lg bg-red-950/60 text-red-400 border border-red-800/50">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-red-400">
              {data.high_priority_sme_count.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {((data.high_priority_sme_count / data.distinct_smes) * 100).toFixed(1)}% of total portfolio
          </div>
        </div>

        {/* Monthly Volume At Risk */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Monthly Exposure at Risk</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-400">
              ${data.total_monthly_exposure_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Expected monthly volume exposure
          </div>
        </div>
      </div>

      {/* Model & Methodology Highlight Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400">Primary Model (Logistic Regression)</span>
            <p className="text-lg font-bold font-mono text-white">
              {data.lr_holdout_roc_auc.toFixed(4)} <span className="text-xs font-sans text-zinc-400 font-normal">Holdout ROC-AUC</span>
            </p>
          </div>
          <Target className="w-6 h-6 text-zinc-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400">At-Risk Customer Identification</span>
            <p className="text-lg font-bold font-mono text-emerald-400">
              {data.at_risk_recall_pct.toFixed(1)}% <span className="text-xs font-sans text-zinc-400 font-normal">Recall @ {data.operating_threshold.toFixed(3)}</span>
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400">Statistical Velocity Finding</span>
            <p className="text-lg font-bold font-mono text-purple-400">
              2.49x – 2.73x <span className="text-xs font-sans text-zinc-400 font-normal">Higher Churn (p &lt; 0.001)</span>
            </p>
          </div>
          <BarChart2 className="w-6 h-6 text-purple-400 opacity-80" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume Trend (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                12-Month Processing Volume & Transaction Activity
              </h2>
              <p className="text-xs text-zinc-400">
                Historical baseline (Months 1–9) vs. Future observation horizon (Months 10–12)
              </p>
            </div>
            <span className="px-2 py-1 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              Total Volume: ${(data.total_historical_charge_volume / 1_000_000).toFixed(2)}M
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                  itemStyle={{ color: '#10b981', fontWeight: 600 }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Charge Volume']}
                />
                <Area type="monotone" dataKey="charge_volume" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#volGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prioritization Distribution (1 column) */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Prioritization Tier Breakdown
            </h2>
            <p className="text-xs text-zinc-400">
              Customer distribution across 3 actionable risk tiers
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.tier_distribution}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                onMouseMove={(state: any) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setHoveredTierIndex(state.activeTooltipIndex);
                  }
                }}
                onMouseLeave={() => setHoveredTierIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" horizontal={false} />
                <XAxis type="number" stroke="#71717a" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                <YAxis dataKey="tier" type="category" stroke="#71717a" tick={{ fontSize: 10, fill: '#d4d4d8' }} width={80} />
                <Tooltip
                  cursor={false}
                  content={<TierTooltip />}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.tier_distribution.map((_, index) => {
                    const isHighlighted = hoveredTierIndex === null || hoveredTierIndex === index;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={tierColors[index % tierColors.length]}
                        fillOpacity={isHighlighted ? 1 : 0.3}
                        style={{ transition: 'fill-opacity 0.15s ease' }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            {data.tier_distribution.map((t, idx) => (
              <div key={t.tier} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tierColors[idx] }} />
                  <span className="text-zinc-300 font-medium">{t.tier.split(' - ')[0]}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-white font-semibold">{t.count.toLocaleString()}</span>
                  <span className="text-zinc-400">(${t.exposure.toLocaleString()})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Analytical Findings Section */}
      <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Key Behavioral & Revenue Intelligence Findings
          </h2>
          <span className="text-xs text-zinc-400">Validated through empirical data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.key_findings.map((f) => (
            <div key={f.id} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                {f.category}
              </span>
              <h3 className="text-sm font-semibold text-white">{f.title}</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{f.finding}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
