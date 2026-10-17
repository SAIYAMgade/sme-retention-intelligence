import React, { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, Terminal, Copy } from 'lucide-react';
import { fetchVerificationSummaryReport } from '../../lib/api';

export const ReportsExportsPage: React.FC = () => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await fetchVerificationSummaryReport();
      setReport(res.markdown);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>Analytical Reports & Data Exports</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800">
              Audit Ready
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export priority lists, inspect automated verification logs, and download auditable evidence artifacts.
          </p>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prioritized Customers CSV */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Actionable Operations List
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                CSV Format
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mt-1">
              Prioritized At-Risk Customer Export
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Contains all 6,000 accounts ranked by priority tier, expected monthly charge volume at risk, primary reason codes, and prescribed actions.
            </p>
          </div>

          <a
            href="/api/v1/exports/prioritized-customers.csv"
            download
            className="mt-4 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (prioritized_retention_accounts.csv)</span>
          </a>
        </div>

        {/* Feature Registry JSON */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Data Dictionary & Lineage
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                JSON Format
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mt-1">
              Canonical 44-Feature Registry
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Formal data dictionary with mathematical formulas, observation windows, missing-value policies, and leakage prevention documentation.
            </p>
          </div>

          <a
            href="/api/v1/features/registry"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>View Feature Registry JSON</span>
          </a>
        </div>
      </div>

      {/* Verification Report Markdown Viewer */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-slate-100">
              Live Automated Verification Report
            </h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-[500px]">
          {report || 'Loading verification report...'}
        </div>
      </div>
    </div>
  );
};
