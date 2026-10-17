import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  TrendingDown,
  Layers,
  Activity,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { fetchSMEDetail } from '../../lib/api';
import { SMEDetail } from '../../types';

export const CustomerDetailPage: React.FC = () => {
  const { smeId } = useParams<{ smeId: string }>();
  const [data, setData] = useState<SMEDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (smeId) {
      loadDetail(smeId);
    }
  }, [smeId]);

  const loadDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchSMEDetail(id);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load SME details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
          <p className="text-sm text-slate-400">Loading profile for {smeId}...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800 text-red-200 space-y-3">
        <p className="font-semibold">{error || 'SME profile not found'}</p>
        <Link to="/customers" className="text-xs text-brand-400 underline">
          &larr; Back to Portfolio Directory
        </Link>
      </div>
    );
  }

  const { sme, features, prioritization, churn_label, recent_transactions, monthly_activity } = data;

  const isTier1 = prioritization.priority_level === 1;
  const isTier2 = prioritization.priority_level === 2;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/customers" className="hover:text-slate-200 transition-colors flex items-center space-x-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>SME Portfolio</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-200">{sme.sme_id}</span>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold font-mono text-slate-100">{sme.sme_id}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isTier1
                  ? 'bg-red-950 text-red-300 border-red-800'
                  : isTier2
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}
            >
              {prioritization.priority_tier}
            </span>
          </div>
          <p className="text-sm text-slate-300">{sme.business_name}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span>Industry: <strong className="text-slate-200">{sme.industry}</strong></span>
            <span>Region: <strong className="text-slate-200">{sme.region}</strong></span>
            <span>Channel: <strong className="text-slate-200">{sme.primary_channel}</strong></span>
            <span>Age: <strong className="text-slate-200">{sme.business_age_months} mos</strong></span>
            <span>Cohort: <strong className="text-slate-200">{sme.cohort_month}</strong></span>
          </div>
        </div>

        {/* Financial Exposure KPI Pill */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Model Churn Probability</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
              {(prioritization.churn_probability * 100).toFixed(1)}%
            </div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div>
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-medium">Monthly Volume At Risk</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              ${prioritization.charge_volume_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan & Reason Code Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Retention Diagnostics & Prescribed Action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-400">Identified Behavioral Triggers:</span>
            <p className="font-mono text-brand-300">{prioritization.all_reasons}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="font-semibold text-slate-400">Prescribed Intervention Workflow:</span>
            <p className="text-emerald-300">{prioritization.recommended_action}</p>
          </div>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Historical & Future Processing Activity
          </h2>
          <p className="text-xs text-slate-400">
            Monthly transaction frequency across all 12 observed months.
          </p>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly_activity} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any, name: any) => [
                  `${val} ${name === 'tx_count' ? 'Transactions' : 'Failed'}`,
                  name === 'tx_count' ? 'Activity' : 'Failures'
                ]}
              />
              <Bar dataKey="tx_count" fill="#3d80f3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed_count" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 44 Feature Snapshot Grid */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Behavioral Feature Values at Cutoff (Day 273)
            </h2>
            <p className="text-xs text-slate-400">
              Snapshot of all 44 canonical behavioral inputs computed with zero future leakage.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">44 features verified</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {Object.entries(features).map(([key, val]) => (
            <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block truncate" title={key}>
                {key}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-100 block mt-0.5">
                {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Recent Physical Transactions Log
          </h2>
          <p className="text-xs text-slate-400">
            Up to 50 most recent recorded transaction entries for this account.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Tx ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recent_transactions.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-200">{tx.transaction_id}</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">{tx.timestamp}</td>
                  <td className="py-2 px-3 text-slate-300 font-sans">{tx.transaction_type}</td>
                  <td className="py-2 px-3 text-slate-300 font-sans">{tx.channel}</td>
                  <td className="py-2 px-3 text-right text-slate-100">${tx.amount.toFixed(2)}</td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.status === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : tx.status === 'FAILED'
                          ? 'bg-red-950 text-red-400 border border-red-800/60'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
