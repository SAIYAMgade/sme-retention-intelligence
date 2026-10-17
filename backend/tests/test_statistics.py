"""
Unit Tests for Statistical Methodology and Hypothesis Testing.
"""

import pytest
import numpy as np
import pandas as pd
from analytics.statistics.velocity_analysis import analyze_transaction_velocity_finding
from analytics.statistics.hypothesis_tests import run_continuous_feature_tests, run_categorical_segment_tests

def test_velocity_finding_calculation():
    # Construct a controlled contingency table
    # Group 1 (Declining): 1000 SMEs, 300 Churned (30%)
    # Group 0 (Non-declining): 2000 SMEs, 200 Churned (10%)
    # True Risk Ratio = 0.30 / 0.10 = 3.0
    sme_ids_d = [f"D-{i}" for i in range(1000)]
    sme_ids_nd = [f"ND-{i}" for i in range(2000)]
    
    feats = pd.DataFrame({
        'sme_id': sme_ids_d + sme_ids_nd,
        'prior_tx_velocity': [2.0] * 1000 + [2.0] * 2000,
        'velocity_change_ratio': [0.3] * 1000 + [1.0] * 2000
    })
    
    churn_d = [1] * 300 + [0] * 700
    churn_nd = [1] * 200 + [0] * 1800
    
    labels = pd.DataFrame({
        'sme_id': sme_ids_d + sme_ids_nd,
        'churn': churn_d + churn_nd,
        'is_eligible': [True] * 3000
    })
    
    result = analyze_transaction_velocity_finding(feats, labels, min_prior_velocity=0.8, decline_threshold_ratio=0.50)
    
    assert abs(result['risk_ratio'] - 3.0) < 0.05
    assert result['ci_95_lower'] > 1.0
    assert result['p_value'] < 0.0001
    assert result['sample_counts']['declining_smes_count'] == 1000
    assert result['sample_counts']['non_declining_smes_count'] == 2000

def test_katz_confidence_interval_bounds():
    # Katz CI lower bound must be <= RR and upper bound >= RR
    feats = pd.DataFrame({
        'sme_id': [f"SME-{i}" for i in range(500)],
        'prior_tx_velocity': [1.5] * 500,
        'velocity_change_ratio': [0.4] * 150 + [1.1] * 350
    })
    labels = pd.DataFrame({
        'sme_id': [f"SME-{i}" for i in range(500)],
        'churn': [1] * 50 + [0] * 100 + [1] * 35 + [0] * 315,
        'is_eligible': [True] * 500
    })
    res = analyze_transaction_velocity_finding(feats, labels, min_prior_velocity=0.8, decline_threshold_ratio=0.50)
    assert res['ci_95_lower'] <= res['risk_ratio'] <= res['ci_95_upper']
