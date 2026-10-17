import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Download
} from 'lucide-react';
import { fetchSMEs } from '../../lib/api';
import { PaginatedSMEs } from '../../types';

export const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedSMEs | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [region, setRegion] = useState('All');
  const [sortBy, setSortBy] = useState('charge_volume_at_risk');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadData();
  }, [page, tier, industry, region, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchSMEs({
        page,
        pageSize: 20,
        priorityTier: tier,
        industry,
        region,
        search,
        sortBy,
        sortOrder
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const getTierBadge = (t: string) => {
    if (t.includes('Tier 1')) {
      return 'bg-red-950/80 text-red-400 border-red-800/60';
    } else if (t.includes('Tier 2')) {
      return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
    } else {
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">SME Portfolio Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Search, filter, and inspect risk probabilities and monthly exposure across the 6,000 SME portfolio.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/api/v1/exports/prioritized-customers.csv"
            download
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by SME ID (e.g. SME-0042) or business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Tier Filter */}
            <select
              value={tier}
              onChange={(e) => { setTier(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Priority Tiers</option>
              <option value="Tier 1">Tier 1 - High Priority</option>
              <option value="Tier 2">Tier 2 - Medium Priority</option>
              <option value="Tier 3">Tier 3 - Low Priority</option>
            </select>

            {/* Industry Filter */}
            <select
              value={industry}
              onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Industries</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale & Distribution">Wholesale & Distribution</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Healthcare Services">Healthcare Services</option>
              <option value="Construction & Trade">Construction & Trade</option>
              <option value="Logistics & Transport">Logistics & Transport</option>
            </select>

            {/* Region Filter */}
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">SME Identifier</th>
                <th className="py-3 px-4">Industry / Region</th>
                <th className="py-3 px-4 text-right">Hist. Volume</th>
                <th className="py-3 px-4 text-right">90D Activity</th>
                <th className="py-3 px-4 text-right">Recency (Days)</th>
                <th className="py-3 px-4 text-right">Churn Prob.</th>
                <th className="py-3 px-4 text-right">Exposure at Risk</th>
                <th className="py-3 px-4">Priority Tier</th>
                <th className="py-3 px-4">Primary Reason</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" />
                    <span>Loading accounts...</span>
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No SME accounts found matching the current filters.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr
                    key={item.sme_id}
                    onClick={() => navigate(`/customers/${item.sme_id}`)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-100">
                      {item.sme_id}
                      <span className="block font-sans text-[11px] text-slate-400 font-normal">
                        {item.business_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span>{item.industry}</span>
                      <span className="block text-[11px] text-slate-500">{item.region}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">
                      ${item.total_charge_volume.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {item.tx_count_last_90d} tx
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {item.days_since_last_tx} d
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={item.churn_probability >= 0.4 ? 'text-red-400' : (item.churn_probability >= 0.2 ? 'text-amber-400' : 'text-emerald-400')}>
                        {(item.churn_probability * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      ${item.charge_volume_at_risk.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getTierBadge(item.priority_tier)}`}>
                        {item.priority_tier.split(' - ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      {item.primary_reason}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <ExternalLink className="w-4 h-4 text-slate-400 hover:text-brand-400 inline" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing {data.items.length > 0 ? (data.page - 1) * data.page_size + 1 : 0} to{' '}
              {Math.min(data.page * data.page_size, data.total)} of {data.total.toLocaleString()} accounts
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="px-2 font-mono text-slate-300">
                Page {data.page} of {data.total_pages}
              </span>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
