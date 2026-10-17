"""
Hypothesis Testing Module for SME Customer Retention Analytics.
Performs:
1. Welch's Independent Samples t-test for continuous behavioral features (churned vs retained).
2. Chi-square tests of independence for categorical business segments.
3. Multiple testing correction using the Benjamini-Hochberg False Discovery Rate (FDR) procedure.
"""

import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.multitest import multipletests
from typing import Dict, Any, List

from analytics.feature_engineering.registry import CANONICAL_FEATURES

def run_continuous_feature_tests(
    features_df: pd.DataFrame,
    labels_df: pd.DataFrame
) -> List[Dict[str, Any]]:
    """
    Executes Welch's t-test (unequal variances assumed) across continuous features.
    Applies Benjamini-Hochberg adjustment to control false discovery rate.
    """
    merged = features_df.merge(labels_df[['sme_id', 'churn', 'is_eligible']], on='sme_id')
    eligible = merged[merged['is_eligible']].copy()
    
    churned = eligible[eligible['churn'] == 1]
    retained = eligible[eligible['churn'] == 0]
    
    n_churned = len(churned)
    n_retained = len(retained)
    
    raw_results = []
    
    for feat in CANONICAL_FEATURES:
        f_name = feat.name
        if f_name not in eligible.columns:
            continue
            
        vals_churned = churned[f_name].dropna().values
        vals_retained = retained[f_name].dropna().values
        
        if len(vals_churned) < 5 or len(vals_retained) < 5:
            continue
            
        mean_c = float(np.mean(vals_churned))
        mean_r = float(np.mean(vals_retained))
        std_c = float(np.std(vals_churned, ddof=1))
        std_r = float(np.std(vals_retained, ddof=1))
        
        diff = mean_c - mean_r
        
        # Welch's t-test
        t_stat, p_val = stats.ttest_ind(vals_churned, vals_retained, equal_var=False)
        
        # Degrees of freedom (Welch-Satterthwaite equation)
        s1_sq_n1 = (std_c ** 2) / len(vals_churned)
        s2_sq_n2 = (std_r ** 2) / len(vals_retained)
        dof = ((s1_sq_n1 + s2_sq_n2) ** 2) / ((s1_sq_n1 ** 2) / (len(vals_churned) - 1) + (s2_sq_n2 ** 2) / (len(vals_retained) - 1)) if (s1_sq_n1 + s2_sq_n2) > 0 else 1.0
        
        # 95% Confidence Interval for mean difference
        se_diff = np.sqrt(s1_sq_n1 + s2_sq_n2)
        t_crit = stats.t.ppf(0.975, df=dof)
        ci_lower = float(diff - t_crit * se_diff)
        ci_upper = float(diff + t_crit * se_diff)
        
        # Cohen's d effect size (pooled standard deviation)
        pooled_std = np.sqrt(((len(vals_churned) - 1) * (std_c ** 2) + (len(vals_retained) - 1) * (std_r ** 2)) / (len(vals_churned) + len(vals_retained) - 2))
        cohens_d = float(diff / (pooled_std + 1e-9))
        
        raw_results.append({
            "feature_name": f_name,
            "display_name": feat.display_name,
            "category": feat.category,
            "churned_mean": round(mean_c, 3),
            "retained_mean": round(mean_r, 3),
            "mean_difference": round(diff, 3),
            "ci_95_lower": round(ci_lower, 3),
            "ci_95_upper": round(ci_upper, 3),
            "t_statistic": round(float(t_stat), 3),
            "degrees_of_freedom": round(float(dof), 1),
            "p_value_raw": float(p_val),
            "cohens_d": round(cohens_d, 3),
            "sample_churned": len(vals_churned),
            "sample_retained": len(vals_retained),
        })
        
    # Benjamini-Hochberg False Discovery Rate correction
    p_values = [r["p_value_raw"] for r in raw_results]
    _, p_adjusted, _, _ = multipletests(p_values, alpha=0.05, method='fdr_bh')
    
    for i, r in enumerate(raw_results):
        r["p_value_adjusted"] = float(p_adjusted[i])
        r["is_statistically_significant"] = bool(p_adjusted[i] < 0.05)
        r["interpretation"] = (
            f"Statistically significant difference (adj p={p_adjusted[i]:.2e}, d={r['cohens_d']:.2f})"
            if r["is_statistically_significant"]
            else "No statistically significant difference after FDR control"
        )
        
    # Sort by absolute t-statistic descending
    raw_results.sort(key=lambda x: abs(x["t_statistic"]), reverse=True)
    return raw_results

def run_categorical_segment_tests(
    smes_df: pd.DataFrame,
    labels_df: pd.DataFrame
) -> List[Dict[str, Any]]:
    """
    Executes Chi-square test of independence for categorical segmentation dimensions
    (Industry, Region, Primary Channel) against future churn outcome.
    """
    merged = smes_df.merge(labels_df[['sme_id', 'churn', 'is_eligible']], on='sme_id')
    eligible = merged[merged['is_eligible']].copy()
    
    cat_columns = ['industry', 'region', 'primary_channel']
    results = []
    
    for col in cat_columns:
        if col not in eligible.columns:
            continue
            
        contingency = pd.crosstab(eligible[col], eligible['churn'])
        chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
        
        breakdown = []
        for cat_val in contingency.index:
            c_cnt = int(contingency.loc[cat_val, 1]) if 1 in contingency.columns else 0
            r_cnt = int(contingency.loc[cat_val, 0]) if 0 in contingency.columns else 0
            tot = c_cnt + r_cnt
            c_rate = float(c_cnt / tot) if tot > 0 else 0.0
            breakdown.append({
                "category_value": str(cat_val),
                "churned_count": c_cnt,
                "retained_count": r_cnt,
                "total_count": tot,
                "churn_rate": round(c_rate, 4),
            })
            
        results.append({
            "dimension": col,
            "display_name": col.replace('_', ' ').title(),
            "chi2_statistic": round(float(chi2), 2),
            "degrees_of_freedom": int(dof),
            "p_value": float(p_val),
            "is_significant": bool(p_val < 0.05),
            "contingency_table": breakdown
        })
        
    return results
