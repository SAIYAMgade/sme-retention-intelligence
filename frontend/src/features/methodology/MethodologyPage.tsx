import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, Clock, Layers, Calculator, HelpCircle } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center space-x-2">
          <span>Methodology, Definitions & Analytical Governance</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Formal mathematical definitions, observational caveats, and experimental design standards.
        </p>
      </div>

      {/* Observational Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold block text-amber-300">Analytical Decision-Support Caveat: Correlation vs. Causality</strong>
          <p className="leading-relaxed">
            This platform models statistical associations and historical behavioral patterns to quantify risk and prioritize operational investigation. It does <strong>not</strong> claim to identify the true root causal driver of customer churn from observational transaction data alone. Prescribed action recommendations represent rules-based merchant intervention hypotheses.
          </p>
        </div>
      </div>

      {/* 1. Observation Windows & Churn Definition */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-slate-100">
            1. Temporal Windows & Formal Churn Definition
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            To prevent target leakage and ensure temporal realism, data is divided strictly across time:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2 text-slate-400">
            <li>
              <strong className="text-slate-200">Historical Feature Calculation Window:</strong> Days 1 through 273 (Months 1–9, 2023-01-01 to 2023-09-30). All 44 behavioral features are computed strictly from events occurring on or before this cutoff.
            </li>
            <li>
              <strong className="text-slate-200">Prediction Cutoff Date:</strong> 2023-09-30 (Day 273). Models predict risk using only data available on or before this date.
            </li>
            <li>
              <strong className="text-slate-200">Future Outcome Horizon:</strong> Days 274 through 365 (Months 10–12, 92 days).
            </li>
            <li>
              <strong className="text-slate-200">Formal Churn Definition:</strong> An eligible SME is defined as churned (<code className="text-brand-300">churn = 1</code>) if it processes <strong className="text-slate-100">zero qualifying successful transactions</strong> during Months 10 through 12. If the SME completes &ge; 1 successful transaction, it is classified as retained (<code className="text-emerald-300">churn = 0</code>).
            </li>
            <li>
              <strong className="text-slate-200">Population Eligibility Rule:</strong> Accounts must have recorded at least 1 transaction during the historical period (M1–M9) to be evaluated for retention. Inactive accounts with zero lifetime processing are categorized separately.
            </li>
          </ul>
        </div>
      </section>

      {/* 2. Declining Velocity Finding */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-slate-100">
            2. Declining Transaction Velocity Finding Specification
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Resume Claim: <em>"Declining transaction velocity was associated with 2.73 times higher churn, p &lt; 0.001."</em>
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 space-y-1">
            <div><span className="text-slate-500">Decline Definition: </span>(prior_velocity &ge; 0.8) AND (recent_velocity / prior_velocity &lt; 0.50)</div>
            <div><span className="text-slate-500">Risk Ratio Formula: </span>RR = P(Churn = 1 | Declining = 1) / P(Churn = 1 | Declining = 0)</div>
            <div><span className="text-slate-500">Confidence Interval: </span>Katz 95% Log-normal: exp(ln(RR) &plusmn; 1.96 &times; SE(ln RR))</div>
          </div>
          <p>
            <strong>Distinction:</strong> This metric represents a <em>Risk Ratio</em> (relative risk) between empirical group churn rates, not an odds ratio or a ratio of raw transaction counts. The statistical significance is formally tested using Pearson's Chi-square test of independence (df = 1, p &lt; 0.0001).
          </p>
        </div>
      </section>

      {/* 3. Three-Tier Prioritization & Exposure */}
      <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">
            3. Prioritization Framework & Charge Volume at Risk
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            The prioritization engine translates statistical churn probability into financial exposure:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
            Expected Monthly Exposure at Risk = Predicted Churn Probability &times; (Charge Volume Last 90D / 3.0)
          </div>
          <ul className="list-disc list-inside space-y-2 pl-2 text-slate-400">
            <li>
              <strong className="text-red-400">Tier 1 (High Priority):</strong> Churn probability &ge; 0.45 OR (probability &ge; 0.25 AND monthly volume exposure &ge; $1,500). Assigned immediate account review.
            </li>
            <li>
              <strong className="text-amber-400">Tier 2 (Medium Priority):</strong> Churn probability &ge; 0.25 OR monthly volume exposure &ge; $600. Assigned proactive surveillance and automated outreach.
            </li>
            <li>
              <strong className="text-emerald-400">Tier 3 (Low Priority):</strong> Lower probability and limited charge volume exposure. Standard automated retention cadence.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
