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
import { fetchModelEvaluation } from '../../lib/api';
import { ModelEvaluation } from '../../types';

export const ModelPerformancePage: React.FC = () => {
  const [lrEval, setLrEval] = useState<ModelEvaluation | null>(null);
  const [knnEval, setKnnEval] = useState<ModelEvaluation | null>(null);
  const [activeModel, setActiveModel] = useState<'lr' | 'knn'>('lr');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const [lr, knn] = await Promise.all([
        fetchModelEvaluation('logistic_regression'),
        fetchModelEvaluation('knn')
      ]);
      setLrEval(lr);
      setKnnEval(knn);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const current = activeModel === 'lr' ? lrEval : knnEval;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
            <span>Model Performance & Holdout Evaluation</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800">
              Leakage-Free Holdout
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Strict out-of-sample evaluation on locked 25% test partition (1,500 SMEs). Preprocessing fit on train split only.
          </p>
        </div>

        {/* Model Selector Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveModel('lr')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeModel === 'lr'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logistic Regression (Primary)
          </button>
          <button
            onClick={() => setActiveModel('knn')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeModel === 'knn'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            K-Nearest Neighbors (KNN)
          </button>
        </div>
      </div>

      {current && (
        <>
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Holdout ROC-AUC</span>
              <span className="text-2xl font-bold font-mono text-brand-300 mt-1.5 block">
                {current.roc_auc.toFixed(4)}
              </span>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
                <span>Resume Target: <strong>{current.target_roc_auc_claim.toFixed(3)}</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">At-Risk Recall</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 block">
                {(current.recall_at_operating_threshold * 100).toFixed(1)}%
              </span>
              <div className="mt-2 text-[11px] text-slate-400">
                Operating threshold: <strong className="text-slate-200 font-mono">{current.operating_threshold.toFixed(3)}</strong>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Precision @ Threshold</span>
              <span className="text-2xl font-bold font-mono text-slate-100 mt-1.5 block">
                {(current.precision * 100).toFixed(1)}%
              </span>
              <div className="mt-2 text-[11px] text-slate-400">
                F1-Score: <strong className="text-slate-200 font-mono">{current.f1_score.toFixed(3)}</strong>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Specificity</span>
              <span className="text-2xl font-bold font-mono text-slate-100 mt-1.5 block">
                {(current.specificity * 100).toFixed(1)}%
              </span>
              <div className="mt-2 text-[11px] text-slate-400">
                Holdout Accuracy: <strong className="text-slate-200 font-mono">{(current.accuracy * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          {/* Curves & Confusion Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ROC Curve (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Holdout Receiver Operating Characteristic (ROC) Curve
                  </h2>
                  <p className="text-xs text-slate-400">
                    True Positive Rate vs. False Positive Rate across all decision cutoffs.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-brand-950 text-brand-300 border border-brand-800 text-xs font-mono font-bold">
                  AUC = {current.roc_auc.toFixed(4)}
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={current.roc_points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="fpr"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      type="number"
                      domain={[0, 1]}
                      tickFormatter={(v) => v.toFixed(1)}
                    />
                    <YAxis
                      dataKey="tpr"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      type="number"
                      domain={[0, 1]}
                      tickFormatter={(v) => v.toFixed(1)}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any, name: any) => [
                        `${(Number(val) * 100).toFixed(1)}%`,
                        name === 'tpr' ? 'True Positive Rate' : 'False Positive Rate'
                      ]}
                    />
                    <ReferenceLine x={0} stroke="#334155" />
                    <Line type="monotone" dataKey="tpr" stroke="#3d80f3" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Confusion Matrix (1 col) */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Holdout Confusion Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Evaluated at operating threshold <strong className="text-slate-200">{current.operating_threshold.toFixed(3)}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-center pt-2">
                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/80">
                  <span className="text-[10px] text-emerald-400 uppercase font-sans font-semibold block">True Positive (TP)</span>
                  <span className="text-2xl font-bold text-slate-100 mt-1 block">
                    {current.confusion_matrix.true_positives.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">Identified Churn</span>
                </div>

                <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/80">
                  <span className="text-[10px] text-red-400 uppercase font-sans font-semibold block">False Positive (FP)</span>
                  <span className="text-2xl font-bold text-slate-100 mt-1 block">
                    {current.confusion_matrix.false_positives.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">False Alarm</span>
                </div>

                <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/80">
                  <span className="text-[10px] text-red-400 uppercase font-sans font-semibold block">False Negative (FN)</span>
                  <span className="text-2xl font-bold text-slate-100 mt-1 block">
                    {current.confusion_matrix.false_negatives.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">Missed Churn</span>
                </div>

                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/80">
                  <span className="text-[10px] text-emerald-400 uppercase font-sans font-semibold block">True Negative (TN)</span>
                  <span className="text-2xl font-bold text-slate-100 mt-1 block">
                    {current.confusion_matrix.true_negatives.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">Correct Retained</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 flex items-center justify-between">
                <span>Holdout Total: <strong className="text-slate-200">{current.confusion_matrix.total_holdout} SMEs</strong></span>
                <span>Actual Churned: <strong className="text-slate-200">{current.confusion_matrix.actual_churned}</strong></span>
              </div>
            </div>
          </div>

          {/* Feature Importances Table (if available) */}
          {current.feature_importance && current.feature_importance.length > 0 && (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  Top Predictive Behavioral Signals (Model Coefficients & Odds Ratios)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Learned standardized weights indicating directional impact on customer churn risk.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Feature Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Coefficient (&beta;)</th>
                      <th className="py-2.5 px-3 text-right">Odds Ratio (e^&beta;)</th>
                      <th className="py-2.5 px-3 text-center">Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {current.feature_importance.slice(0, 15).map((f, idx) => (
                      <tr key={f.feature_name} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-slate-500">#{idx + 1}</td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-200">
                          {f.display_name}
                          <span className="block font-mono text-[10px] text-slate-500">{f.feature_name}</span>
                        </td>
                        <td className="py-2 px-3 font-sans text-[11px] text-slate-400">{f.category}</td>
                        <td className="py-2 px-3 text-right text-slate-100 font-bold">{f.coefficient.toFixed(3)}</td>
                        <td className="py-2 px-3 text-right text-brand-300 font-bold">{f.odds_ratio.toFixed(2)}x</td>
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
        </>
      )}
    </div>
  );
};
