import React, { useEffect, useState } from 'react';
import { DollarSign, AlertTriangle, ShieldCheck, Download, Layers, ExternalLink } from 'lucide-react';
import { fetchPrioritizationSummary, fetchSMEs } from '../../lib/api';
import { PrioritizationSummary, SMEListItem } from '../../types';
import { Link } from 'react-router-dom';

export const VolumeAtRiskPage: React.FC = () => {
  const [summary, setSummary] = useState<PrioritizationSummary | null>(null);
  const [topExposures, setTopExposures] = useState<SMEListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, smeRes] = await Promise.all([
        fetchPrioritizationSummary(),
        fetchSMEs({ page: 1, pageSize: 20, sortBy: 'charge_volume_at_risk', sortOrder: 'desc' })
      ]);
      setSummary(sumRes);
      setTopExposures(smeRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>Charge Volume at Risk Analysis</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800">
              Revenue Analytics
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Expected monthly processing volume exposed to potential customer churn across the portfolio.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/api/v1/exports/prioritized-customers.csv"
            download
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Exposure List</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Total Portfolio Monthly Exposure
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400 mt-1.5 block">
              ${summary.total_monthly_exposure_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-xs text-slate-400">
              Aggregated across all 6,000 active SME accounts
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Tier 1 High-Priority Exposure
            </span>
            <span className="text-2xl font-bold font-mono text-red-400 mt-1.5 block">
              ${summary.tiers[0].monthly_exposure_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-xs text-slate-400">
              {summary.tiers[0].exposure_percentage.toFixed(1)}% of total portfolio exposure
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              Total Historical Processing Volume
            </span>
            <span className="text-2xl font-bold font-mono text-slate-100 mt-1.5 block">
              ${summary.total_historical_charge_volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="mt-2 text-xs text-slate-400">
              Cumulative successful processing (M1–M9)
            </div>
          </div>
        </div>
      )}

      {/* Methodology Formula Banner */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Quantitative Financial Definition
        </h2>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
          <strong className="text-brand-400">Expected Charge Volume at Risk</strong> = Predicted Churn Probability &times; Monthly Reference Volume (Charge Vol Last 90D / 3.0)
        </div>
        <p className="text-xs text-slate-400">
          *Note: This metric reflects exposed historical merchant transaction processing volume, not guaranteed future revenue loss or platform fee take-rate.
        </p>
      </div>

      {/* Top Exposed Merchants Table */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100">
            Top 20 Accounts Ranked by Exposure at Risk
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Merchants with the highest financial impact if churn occurs.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">SME Identifier</th>
                <th className="py-2.5 px-3">Industry</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3 text-right">90D Volume</th>
                <th className="py-2.5 px-3 text-right">Churn Prob.</th>
                <th className="py-2.5 px-3 text-right font-bold text-amber-400">Exposure at Risk</th>
                <th className="py-2.5 px-3">Priority Tier</th>
                <th className="py-2.5 px-3">Primary Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {topExposures.map((item) => (
                <tr key={item.sme_id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-brand-300 font-medium">
                    <Link to={`/customers/${item.sme_id}`} className="hover:underline flex items-center space-x-1">
                      <span>{item.sme_id}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 inline" />
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{item.industry}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{item.region}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200">
                    ${(item.monthly_reference_volume * 3).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-red-400 font-bold">
                    {(item.churn_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400 font-bold">
                    ${item.charge_volume_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                      {item.priority_tier.split(' - ')[0]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans text-[11px]">
                    {item.primary_reason}
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
