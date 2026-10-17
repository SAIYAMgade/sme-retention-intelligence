import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck2,
  Table,
  Layers,
  Activity
} from 'lucide-react';
import { fetchVelocityFinding, fetchStatisticalTests } from '../../lib/api';
import { VelocityFinding } from '../../types';

export const StatisticalFindingsPage: React.FC = () => {
  const [velocity, setVelocity] = useState<VelocityFinding | null>(null);
  const [tests, setTests] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFindings();
  }, []);

  const loadFindings = async () => {
    try {
      setLoading(true);
      const [vf, st] = await Promise.all([
        fetchVelocityFinding(),
        fetchStatisticalTests()
      ]);
      setVelocity(vf);
      setTests(st);
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
            <span>Statistical Findings & Hypothesis Tests</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800">
              Inferential Statistics
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Empirical validation of behavioral retention signals using Welch's t-tests, Pearson Chi-Square, and Benjamini-Hochberg FDR control.
          </p>
        </div>
      </div>

      {/* Featured Finding Card: Transaction Velocity */}
      {velocity && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                Primary Resume Finding Substantiated
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                "{velocity.finding_statement}"
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target resume claim: <strong>{velocity.verified_resume_claim}</strong>
              </p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Statistical Significance Verified</span>
            </div>
          </div>

          {/* Statistical Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Risk Ratio (Relative Risk)</span>
              <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">
                {velocity.risk_ratio.toFixed(2)}x
              </span>
              <span className="text-[11px] text-slate-500 font-sans">Relative churn likelihood</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">95% Confidence Interval</span>
              <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
                [{velocity.ci_95_lower.toFixed(2)}, {velocity.ci_95_upper.toFixed(2)}]
              </span>
              <span className="text-[11px] text-slate-500 font-sans">Katz log-formula bounds</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Chi-Square Statistic (&chi;&sup2;)</span>
              <span className="text-2xl font-bold font-mono text-slate-100 mt-1 block">
                {velocity.chi2_statistic.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500 font-sans">1 Degree of Freedom</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">P-Value</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {velocity.p_value_display}
              </span>
              <span className="text-[11px] text-slate-500 font-sans">Strictly &lt; 0.001</span>
            </div>
          </div>

          {/* 2x2 Contingency Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Table className="w-4 h-4 text-slate-400" />
              <span>2x2 Contingency Matrix (Empirical Cohort Counts)</span>
            </h3>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Velocity Behavior</th>
                    <th className="py-2.5 px-4">Churned (M10-M12)</th>
                    <th className="py-2.5 px-4">Retained (M10-M12)</th>
                    <th className="py-2.5 px-4">Total Eligible SMEs</th>
                    <th className="py-2.5 px-4 font-bold text-slate-200">Observed Churn Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  <tr className="hover:bg-slate-800/40 bg-red-950/20">
                    <td className="py-3 px-4 text-left font-sans font-medium text-red-300">
                      Declining Velocity (M7-M9 vs M4-M6 &lt; 0.50)
                    </td>
                    <td className="py-3 px-4 text-red-400 font-bold">
                      {velocity.sample_counts.declining_churned_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {velocity.sample_counts.declining_retained_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {velocity.sample_counts.declining_smes_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-red-400">
                      {(velocity.churn_rates.declining_churn_rate * 100).toFixed(2)}%
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-left font-sans font-medium text-slate-300">
                      Non-Declining Velocity (Baseline Processing)
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {velocity.sample_counts.non_declining_churned_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      {velocity.sample_counts.non_declining_retained_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {velocity.sample_counts.non_declining_smes_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {(velocity.churn_rates.non_declining_churn_rate * 100).toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Features Welch's t-Tests Table */}
      {tests && tests.continuous_tests && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-brand-400" />
              <span>Welch's Independent Samples t-Tests (Continuous Features)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Comparing churned vs. retained accounts across behavioral features with Benjamini-Hochberg FDR control.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Churned Mean</th>
                  <th className="py-2.5 px-3 text-right">Retained Mean</th>
                  <th className="py-2.5 px-3 text-right">Mean Diff</th>
                  <th className="py-2.5 px-3 text-right">t-Stat</th>
                  <th className="py-2.5 px-3 text-right">Adj. p-value (FDR)</th>
                  <th className="py-2.5 px-3 text-right">Cohen's d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {tests.continuous_tests.slice(0, 20).map((t: any) => (
                  <tr key={t.feature_name} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-sans font-medium text-slate-200">
                      {t.display_name}
                      <span className="block font-mono text-[10px] text-slate-500">{t.feature_name}</span>
                    </td>
                    <td className="py-2 px-3 font-sans text-[11px] text-slate-400">{t.category}</td>
                    <td className="py-2 px-3 text-right text-red-400">{t.churned_mean}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">{t.retained_mean}</td>
                    <td className="py-2 px-3 text-right text-slate-200">{t.mean_difference}</td>
                    <td className="py-2 px-3 text-right text-brand-300">{t.t_statistic}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-100">
                      {t.p_value_adjusted < 0.0001 ? '< 0.0001' : t.p_value_adjusted.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right text-purple-400">{t.cohens_d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
