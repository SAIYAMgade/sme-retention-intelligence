"""
Three-Tier Retention Prioritization & Revenue Exposure Engine.
Combines predicted churn probabilities with historical charge volume exposure
to assign SMEs to actionable priority tiers:
- Tier 1: High Priority (Immediate intervention required)
- Tier 2: Medium Priority (Targeted monitoring & investigation)
- Tier 3: Low Priority (Standard operational retention)
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

DEFAULT_PRIORITIZATION_CONFIG = {
    "tier1_prob_threshold": 0.45,
    "tier1_exposure_threshold": 1500.0,
    "tier2_prob_threshold": 0.25,
    "tier2_exposure_threshold": 600.0,
    "reference_window_days": 90,
}

def compute_customer_prioritization(
    smes_df: pd.DataFrame,
    features_df: pd.DataFrame,
    scores_df: pd.DataFrame,
    config: Optional[Dict[str, Any]] = None
) -> pd.DataFrame:
    """
    Computes charge volume at risk, priority tier assignments, reason codes,
    and investigation recommendations for all SMEs.
    """
    cfg = DEFAULT_PRIORITIZATION_CONFIG.copy()
    if config:
        cfg.update(config)
        
    t1_prob = float(cfg["tier1_prob_threshold"])
    t1_exp = float(cfg["tier1_exposure_threshold"])
    t2_prob = float(cfg["tier2_prob_threshold"])
    t2_exp = float(cfg["tier2_exposure_threshold"])
    
    # Merge SME profiles, features, and scores on sme_id
    df = smes_df.merge(features_df, on='sme_id').copy()
    if 'lr_churn_prob' in scores_df.columns:
        df = df.merge(scores_df[['sme_id', 'lr_churn_prob']], on='sme_id', how='left')
        df['churn_probability'] = df['lr_churn_prob'].fillna(0.0)
    elif 'churn_probability' in scores_df.columns:
        df = df.merge(scores_df[['sme_id', 'churn_probability']], on='sme_id', how='left')
        df['churn_probability'] = df['churn_probability'].fillna(0.0)
    else:
        df['churn_probability'] = 0.0
        
    # -------------------------------------------------------------
    # 1. Charge Volume at Risk Calculation
    # -------------------------------------------------------------
    # Reference period: Average monthly successful charge volume over latest 90 days
    # Monthly reference volume = charge_vol_last_90d / 3.0
    df['monthly_reference_volume'] = df['charge_vol_last_90d'] / 3.0
    
    # Expected Charge Volume at Risk = Predicted Churn Probability * Monthly Reference Volume
    df['charge_volume_at_risk'] = df['churn_probability'] * df['monthly_reference_volume']
    
    # -------------------------------------------------------------
    # 2. Priority Tier Assignment
    # -------------------------------------------------------------
    # Tier 1 (High Priority):
    # High probability (>= t1_prob) OR (moderate prob >= t2_prob AND high exposure >= t1_exp)
    tier1_mask = (df['churn_probability'] >= t1_prob) | (
        (df['churn_probability'] >= t2_prob) & (df['charge_volume_at_risk'] >= t1_exp)
    )
    
    # Tier 2 (Medium Priority):
    # Moderate risk (>= t2_prob) OR (lower prob but significant exposure >= t2_exp)
    tier2_mask = (~tier1_mask) & (
        (df['churn_probability'] >= t2_prob) | (df['charge_volume_at_risk'] >= t2_exp)
    )
    
    # Tier 3 (Low Priority): Remainder
    df['priority_tier'] = np.where(
        tier1_mask, "Tier 1 - High Priority",
        np.where(tier2_mask, "Tier 2 - Medium Priority", "Tier 3 - Low Priority")
    )
    df['priority_level'] = np.where(tier1_mask, 1, np.where(tier2_mask, 2, 3))
    
    # -------------------------------------------------------------
    # 3. Reason Code Generation & Explainability
    # -------------------------------------------------------------
    def assign_reasons_and_action(row):
        reasons = []
        # Velocity decline
        if row['velocity_change_ratio'] < 0.55 and row['prior_tx_velocity'] >= 0.8:
            reasons.append("Declining Transaction Velocity")
        # Extended Inactivity Gap
        if row['days_since_last_tx'] >= 45.0:
            reasons.append("Extended Inactivity (>45 days)")
        # Contracting Charge Volume
        if row['charge_vol_change_recent_vs_prior'] < -500.0:
            reasons.append("Material Charge Volume Drop")
        # Elevated Failed Rate
        if row['failed_tx_rate'] >= 0.08:
            reasons.append("Elevated Payment Failures")
        # High Risk / Exposure
        if row['churn_probability'] >= 0.50:
            reasons.append("High Statistical Churn Risk")
        if row['charge_volume_at_risk'] >= 1000.0:
            reasons.append("Significant Volume Exposure")
            
        if not reasons:
            reasons.append("Standard Baseline Activity")
            
        primary_reason = reasons[0]
        
        # Action recommendation
        if row['priority_level'] == 1:
            if "Elevated Payment Failures" in reasons:
                recommendation = "Technical Investigation: Audit payment terminal / gateway errors and contact account owner."
            elif "Declining Transaction Velocity" in reasons:
                recommendation = "Executive Outreach: Merchant relationship manager call to review pricing and competitive displacement."
            else:
                recommendation = "High-Priority Account Review: Evaluate transaction friction and deploy retention fee relief."
        elif row['priority_level'] == 2:
            recommendation = "Targeted Surveillance: Monitor next 30-day processing volume and send automated engagement survey."
        else:
            recommendation = "Standard Processing: No proactive intervention required; maintain automated lifecycle communications."
            
        return pd.Series({
            "primary_reason": primary_reason,
            "all_reasons": "; ".join(reasons),
            "recommended_action": recommendation
        })
        
    reason_df = df.apply(assign_reasons_and_action, axis=1)
    df['primary_reason'] = reason_df['primary_reason']
    df['all_reasons'] = reason_df['all_reasons']
    df['recommended_action'] = reason_df['recommended_action']
    
    # Sort by priority level ascending, then charge volume at risk descending
    df.sort_values(by=['priority_level', 'charge_volume_at_risk'], ascending=[True, False], inplace=True)
    return df

def generate_prioritization_summary(prioritized_df: pd.DataFrame) -> Dict[str, Any]:
    """Generates executive aggregate metrics across the three priority tiers."""
    t1 = prioritized_df[prioritized_df['priority_level'] == 1]
    t2 = prioritized_df[prioritized_df['priority_level'] == 2]
    t3 = prioritized_df[prioritized_df['priority_level'] == 3]
    
    tot_smes = len(prioritized_df)
    tot_hist_vol = float(prioritized_df['total_charge_volume'].sum())
    tot_exp = float(prioritized_df['charge_volume_at_risk'].sum())
    
    return {
        "total_smes": tot_smes,
        "total_historical_charge_volume": round(tot_hist_vol, 2),
        "total_monthly_exposure_at_risk": round(tot_exp, 2),
        "tiers": [
            {
                "tier": "Tier 1 - High Priority",
                "level": 1,
                "badge_color": "red",
                "sme_count": len(t1),
                "sme_percentage": round((len(t1) / tot_smes) * 100, 2),
                "monthly_exposure_at_risk": round(float(t1['charge_volume_at_risk'].sum()), 2),
                "exposure_percentage": round((t1['charge_volume_at_risk'].sum() / (tot_exp + 1e-9)) * 100, 2),
                "avg_churn_probability": round(float(t1['churn_probability'].mean()), 4) if len(t1) > 0 else 0.0,
                "description": "High churn risk and material monthly charge volume at risk."
            },
            {
                "tier": "Tier 2 - Medium Priority",
                "level": 2,
                "badge_color": "amber",
                "sme_count": len(t2),
                "sme_percentage": round((len(t2) / tot_smes) * 100, 2),
                "monthly_exposure_at_risk": round(float(t2['charge_volume_at_risk'].sum()), 2),
                "exposure_percentage": round((t2['charge_volume_at_risk'].sum() / (tot_exp + 1e-9)) * 100, 2),
                "avg_churn_probability": round(float(t2['churn_probability'].mean()), 4) if len(t2) > 0 else 0.0,
                "description": "Moderate churn risk or material volume exposure requiring investigation."
            },
            {
                "tier": "Tier 3 - Low Priority",
                "level": 3,
                "badge_color": "emerald",
                "sme_count": len(t3),
                "sme_percentage": round((len(t3) / tot_smes) * 100, 2),
                "monthly_exposure_at_risk": round(float(t3['charge_volume_at_risk'].sum()), 2),
                "exposure_percentage": round((t3['charge_volume_at_risk'].sum() / (tot_exp + 1e-9)) * 100, 2),
                "avg_churn_probability": round(float(t3['churn_probability'].mean()), 4) if len(t3) > 0 else 0.0,
                "description": "Lower estimated risk and limited volume exposure."
            }
        ]
    }
