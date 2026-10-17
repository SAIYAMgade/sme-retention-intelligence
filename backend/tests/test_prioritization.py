"""
Unit Tests for Three-Tier Customer Prioritization Engine.
"""

import pytest
import pandas as pd
from analytics.prioritization.engine import compute_customer_prioritization, generate_prioritization_summary

def test_prioritization_tiers_and_exposure():
    smes = pd.DataFrame({
        'sme_id': ['S1', 'S2', 'S3'],
        'business_name': ['Biz 1', 'Biz 2', 'Biz 3'],
        'industry': ['Retail', 'Services', 'Tech'],
        'region': ['North', 'South', 'East']
    })
    features = pd.DataFrame({
        'sme_id': ['S1', 'S2', 'S3'],
        'total_charge_volume': [10000.0, 5000.0, 1000.0],
        'charge_vol_last_90d': [3000.0, 1500.0, 300.0], # Monthly reference: 1000, 500, 100
        'velocity_change_ratio': [0.4, 0.9, 1.2],
        'prior_tx_velocity': [2.0, 1.0, 0.5],
        'days_since_last_tx': [50.0, 10.0, 2.0],
        'charge_vol_change_recent_vs_prior': [-600.0, 0.0, 100.0],
        'failed_tx_rate': [0.10, 0.02, 0.01]
    })
    scores = pd.DataFrame({
        'sme_id': ['S1', 'S2', 'S3'],
        'lr_churn_prob': [0.65, 0.30, 0.05]
    })
    
    prio_df = compute_customer_prioritization(smes, features, scores)
    
    # S1: prob=0.65 (>= 0.45) -> Tier 1
    # S2: prob=0.30 (>= 0.25) -> Tier 2
    # S3: prob=0.05 (< 0.25) -> Tier 3
    s1 = prio_df[prio_df['sme_id'] == 'S1'].iloc[0]
    s2 = prio_df[prio_df['sme_id'] == 'S2'].iloc[0]
    s3 = prio_df[prio_df['sme_id'] == 'S3'].iloc[0]
    
    assert s1['priority_tier'] == "Tier 1 - High Priority"
    assert s2['priority_tier'] == "Tier 2 - Medium Priority"
    assert s3['priority_tier'] == "Tier 3 - Low Priority"
    
    # Check charge volume at risk: churn_probability * (charge_vol_last_90d / 3.0)
    # S1: 0.65 * 1000.0 = 650.0
    assert abs(s1['charge_volume_at_risk'] - 650.0) < 1.0
    
    # Check reason codes
    assert "Declining Transaction Velocity" in s1['all_reasons']
    assert "Extended Inactivity" in s1['all_reasons']
    
    # Check summary
    summary = generate_prioritization_summary(prio_df)
    assert len(summary['tiers']) == 3
    assert summary['total_smes'] == 3
