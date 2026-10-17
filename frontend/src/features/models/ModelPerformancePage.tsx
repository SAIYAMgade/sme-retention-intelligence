import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { RefreshCw, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { fetchModelEvaluation } from '../../lib/api';
import { ModelEvaluation } from '../../types';

export const ModelPerformancePage: React.FC = () => {
  const [lrEval, setLrEval] = useState<ModelEvaluation | null>(null);
  const [knnEval, setKnnEval] = useState<ModelEvaluation | null>(null);
  const [activeModel, setActiveModel] = useState<'lr' | 'knn'>('lr');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lr, knn] = await Promise.all([
        fetchModelEvaluation('logistic_regression'),
        fetchModelEvaluation('knn')
      ]);
      setLrEval(lr);
      setKnnEval(knn);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load model evaluation artifacts');
    } finally {
      setLoading(false);
    }
  };

  const current = activeModel === 'lr' ? lrEval : knnEval;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-zinc-400 mx-auto" />
          <p className="text-sm text-zinc-400">Loading verified model evaluation artifacts...</p>
        </div>
      </div>
    );
  }

  if (error || !current) {
    return (
      <div className="p-6 rounded-xl bg-red-950/40 border border-red-800 text-red-200 space-y-3">
        <div className="flex items-center space-x-2 font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span>Error loading model performance data</span>
        </div>
        <p className="text-sm">{error || 'Unable to parse model metrics.'}</p>
        <button
          onClick={loadModels}
          className="px-4 py-2 bg-red-900/60 hover:bg-red-800 rounded-md text-xs font-medium text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-black text-white">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Model Performance & Holdout Evaluation</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-emerald-400 border border-zinc-700/80">
              Leakage-Free Holdout
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Strict out-of-sample evaluation on locked 25% holdout partition (1,499 SMEs). Preprocessing fit on train split only.
          </p>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setActiveModel('lr')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeModel === 'lr'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Logistic Regression (Primary)
          </button>
          <button
            onClick={() => setActiveModel('knn')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeModel === 'knn'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            K-Nearest Neighbors (KNN)
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Holdout ROC-AUC</span>
          <span className="text-2xl font-bold font-mono text-white mt-1.5 block">
            {current.roc_auc.toFixed(4)}
          </span>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center space-x-1">
            <span>Resume Benchmark: <strong className="text-white">{current.target_roc_auc_claim.toFixed(3)}</strong></span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">At-Risk Recall</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 block">
            {(current.recall_at_operating_threshold * 100).toFixed(1)}%
          </span>
          <div className="mt-2 text-[11px] text-zinc-400">
            Operating Cutoff: <strong className="text-white font-mono">{current.operating_threshold.toFixed(3)}</strong>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Precision @ Cutoff</span>
          <span className="text-2xl font-bold font-mono text-white mt-1.5 block">
            {(current.precision * 100).toFixed(1)}%
          </span>
          <div className="mt-2 text-[11px] text-zinc-400">
            F1-Score: <strong className="text-white font-mono">{current.f1_score.toFixed(3)}</strong>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Specificity</span>
          <span className="text-2xl font-bold font-mono text-white mt-1.5 block">
            {(current.specificity * 100).toFixed(1)}%
          </span>
          <div className="mt-2 text-[11px] text-zinc-400">
            Holdout Accuracy: <strong className="text-white font-mono">{(current.accuracy * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Curves & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROC Curve (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Holdout Receiver Operating Characteristic (ROC) Curve
              </h2>
              <p className="text-xs text-zinc-400">
                True Positive Rate vs. False Positive Rate across all decision cutoffs.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-zinc-900 text-emerald-400 border border-zinc-700 text-xs font-mono font-bold">
              AUC = {current.roc_auc.toFixed(4)}
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={current.roc_points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                <XAxis
                  dataKey="fpr"
                  stroke="#71717a"
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis
                  dataKey="tpr"
                  stroke="#71717a"
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050505', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#ffffff' }}
                  itemStyle={{ color: '#ffffff' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                  formatter={(val: any, name: any) => [
                    `${(Number(val) * 100).toFixed(1)}%`,
                    name === 'tpr' ? 'True Positive Rate' : 'False Positive Rate'
                  ]}
                />
                <ReferenceLine x={0} stroke="#27272a" />
                <Line type="monotone" dataKey="tpr" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (1 col) */}
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
              Holdout Confusion Matrix
            </h2>
            <p className="text-xs text-zinc-400">
              Evaluated at operating threshold <strong className="text-white">{current.operating_threshold.toFixed(3)}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-center pt-2">
            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/80">
              <span className="text-[10px] text-emerald-400 uppercase font-sans font-semibold block">True Positive (TP)</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {current.confusion_matrix.true_positives.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">Identified Churn</span>
            </div>

            <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/80">
              <span className="text-[10px] text-red-400 uppercase font-sans font-semibold block">False Positive (FP)</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {current.confusion_matrix.false_positives.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">False Alarm</span>
            </div>

            <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/80">
              <span className="text-[10px] text-red-400 uppercase font-sans font-semibold block">False Negative (FN)</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {current.confusion_matrix.false_negatives.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">Missed Churn</span>
            </div>

            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/80">
              <span className="text-[10px] text-emerald-400 uppercase font-sans font-semibold block">True Negative (TN)</span>
              <span className="text-2xl font-bold text-white mt-1 block">
                {current.confusion_matrix.true_negatives.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">Correct Retained</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 border-t border-zinc-800 pt-3 flex items-center justify-between">
            <span>Holdout Size: <strong className="text-white">{current.confusion_matrix.total_holdout} SMEs</strong></span>
            <span>Actual Churned: <strong className="text-white">{current.confusion_matrix.actual_churned}</strong></span>
          </div>
        </div>
      </div>

      {/* Feature Importances Table (if available) */}
      {current.feature_importance && current.feature_importance.length > 0 && (
        <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Top Predictive Behavioral Signals (Model Coefficients & Odds Ratios)
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Standardized logistic regression coefficients indicating directional impact on customer churn risk.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-800 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black text-zinc-400 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Coefficient (&beta;)</th>
                  <th className="py-2.5 px-3 text-right">Odds Ratio (e^&beta;)</th>
                  <th className="py-2.5 px-3 text-center">Direction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 font-mono">
                {current.feature_importance.slice(0, 15).map((f, idx) => (
                  <tr key={f.feature_name} className="hover:bg-zinc-900/40">
                    <td className="py-2 px-3 text-zinc-500">#{idx + 1}</td>
                    <td className="py-2 px-3 font-sans font-medium text-white">
                      {f.display_name}
                      <span className="block font-mono text-[10px] text-zinc-500">{f.feature_name}</span>
                    </td>
                    <td className="py-2 px-3 font-sans text-[11px] text-zinc-400">{f.category}</td>
                    <td className="py-2 px-3 text-right text-white font-bold">{f.coefficient.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">{f.odds_ratio.toFixed(2)}x</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          f.direction === 'Increases Risk'
                            ? 'bg-red-950 text-red-400 border border-red-800/60'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        }`}
                      >
                        {f.direction}
                      </span>
                    </td>
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
