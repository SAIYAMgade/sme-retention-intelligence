import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Sliders,
  DollarSign,
  Download,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { fetchPrioritizationSummary, recalculatePrioritization, fetchSMEs } from '../../lib/api';
import { PrioritizationSummary, SMEListItem } from '../../types';
import { Link } from 'react-router-dom';

export const PrioritizationPage: React.FC = () => {
  const [summary, setSummary] = useState<PrioritizationSummary | null>(null);
  const [customers, setCustomers] = useState<SMEListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  // Dynamic Threshold Controls
  const [t1Prob, setT1Prob] = useState(0.45);
  const [t1Exp, setT1Exp] = useState(1500);
  const [t2Prob, setT2Prob] = useState(0.25);
  const [t2Exp, setT2Exp] = useState(600);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sumRes, custRes] = await Promise.all([
        fetchPrioritizationSummary(),
        fetchSMEs({ page: 1, pageSize: 25, priorityTier: 'Tier 1', sortBy: 'charge_volume_at_risk', sortOrder: 'desc' })
      ]);
      setSummary(sumRes);
      setCustomers(custRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecalculating(true);
      setMessage(null);
      const newSummary = await recalculatePrioritization({
        tier1_prob_threshold: t1Prob,
        tier1_exposure_threshold: t1Exp,
        tier2_prob_threshold: t2Prob,
        tier2_exposure_threshold: t2Exp
      });
      setSummary(newSummary);
      // Reload top tier
      const custRes = await fetchSMEs({ page: 1, pageSize: 25, priorityTier: 'Tier 1', sortBy: 'charge_volume_at_risk', sortOrder: 'desc' });
      setCustomers(custRes.items);
      setMessage('Prioritization tiers successfully recomputed across all 6,000 accounts.');
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Recalculation failed'}`);
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>Retention Prioritization Engine</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800">
              Three-Tier Framework
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Prioritize customer intervention by combining predicted churn probability with expected charge volume exposure.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/api/v1/exports/prioritized-customers.csv"
            download
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Priority CSV</span>
          </a>
        </div>
      </div>

      {/* Tier Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.tiers.map((t) => {
            const isRed = t.badge_color === 'red';
            const isAmber = t.badge_color === 'amber';
            return (
              <div
                key={t.tier}
                className={`p-5 rounded-xl bg-slate-900 border ${
                  isRed
                    ? 'border-red-900/60 shadow-lg shadow-red-950/20'
                    : isAmber
                    ? 'border-amber-900/60 shadow-lg shadow-amber-950/20'
                    : 'border-emerald-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isRed ? 'text-red-400' : isAmber ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {t.tier}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {t.sme_percentage.toFixed(1)}% of Portfolio
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-mono text-slate-100">
                    {t.sme_count.toLocaleString()}{' '}
                    <span className="text-xs font-sans text-slate-400 font-normal">SMEs</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-amber-400 block">
                      ${t.monthly_exposure_at_risk.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">Monthly Exposure</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2.5">
                  {t.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Threshold Sensitivity Controls */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Configurable Prioritization Thresholds & Sensitivity
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Interactive analytical simulation
          </span>
        </div>

        <form onSubmit={handleRecalculate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-slate-400 font-medium block">
              Tier 1 Churn Probability Cutoff: <strong className="text-slate-100 font-mono">{(t1Prob * 100).toFixed(0)}%</strong>
            </label>
            <input
              type="range"
              min="0.25"
              max="0.70"
              step="0.05"
              value={t1Prob}
              onChange={(e) => setT1Prob(parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-slate-400 font-medium block">
              Tier 1 Volume at Risk Cutoff: <strong className="text-slate-100 font-mono">${t1Exp.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="800"
              max="3500"
              step="100"
              value={t1Exp}
              onChange={(e) => setT1Exp(parseInt(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-slate-400 font-medium block">
              Tier 2 Churn Probability Cutoff: <strong className="text-slate-100 font-mono">{(t2Prob * 100).toFixed(0)}%</strong>
            </label>
            <input
              type="range"
              min="0.10"
              max="0.40"
              step="0.05"
              value={t2Prob}
              onChange={(e) => setT2Prob(parseFloat(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-slate-400 font-medium block">
              Tier 2 Volume at Risk Cutoff: <strong className="text-slate-100 font-mono">${t2Exp.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="300"
              max="1200"
              step="50"
              value={t2Exp}
              onChange={(e) => setT2Exp(parseInt(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>

          <div className="lg:col-span-4 flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-slate-400">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Reference Period: Average monthly successful volume over past 90 days.</span>
            </div>
            <button
              type="submit"
              disabled={recalculating}
              className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center space-x-2 shadow-md shadow-brand-600/20 transition-colors"
            >
              {recalculating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Recalculate Portfolio Tiers</span>
            </button>
          </div>
        </form>

        {message && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Ranked High-Priority Accounts Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Top Tier 1 High-Priority At-Risk Accounts
            </h2>
            <p className="text-xs text-slate-400">
              Ranked by estimated monthly charge volume at risk and predicted probability.
            </p>
          </div>
          <Link to="/customers?priorityTier=Tier+1" className="text-xs text-brand-400 hover:underline">
            View All Tier 1 Accounts &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">SME Identifier</th>
                <th className="py-2.5 px-3">Industry</th>
                <th className="py-2.5 px-3 text-right">Risk Prob.</th>
                <th className="py-2.5 px-3 text-right">Monthly Ref. Vol</th>
                <th className="py-2.5 px-3 text-right">Exposure at Risk</th>
                <th className="py-2.5 px-3">Primary Reason Code</th>
                <th className="py-2.5 px-3">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Loading accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No accounts found in Tier 1.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.sme_id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-brand-300 font-medium">
                      <Link to={`/customers/${c.sme_id}`} className="hover:underline flex items-center space-x-1">
                        <span>{c.sme_id}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 inline" />
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{c.industry}</td>
                    <td className="py-2.5 px-3 text-right text-red-400 font-bold">
                      {(c.churn_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      ${c.monthly_reference_volume.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                      ${c.charge_volume_at_risk.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans text-[11px]">
                      {c.primary_reason}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      High-Priority Outreach
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
