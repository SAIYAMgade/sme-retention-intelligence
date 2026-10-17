"""
Unit Tests for Feature Registry and Leakage-Free Feature Engineering.
"""

import pytest
import pandas as pd
from analytics.feature_engineering.registry import CANONICAL_FEATURES, FEATURE_NAMES
from analytics.feature_engineering.engineer import compute_sme_features_at_cutoff

def test_canonical_feature_registry_count():
    assert len(CANONICAL_FEATURES) == 44, f"Canonical feature registry must have exactly 44 features, found {len(CANONICAL_FEATURES)}"
    assert len(FEATURE_NAMES) == 44
    assert len(set(FEATURE_NAMES)) == 44, "Feature names must be unique"

def test_leakage_free_engineering():
    # Synthetic mini dataset
    smes = pd.DataFrame({'sme_id': ['SME-0001', 'SME-0002']})
    tx = pd.DataFrame([
        # Historical tx for SME-0001 (Days before cutoff 2023-09-30)
        {'transaction_id': 'TX1', 'sme_id': 'SME-0001', 'timestamp': '2023-03-15 10:00:00', 'amount': 100.0, 'charge_volume': 100.0, 'status': 'SUCCESS', 'transaction_type': 'PAYMENT', 'channel': 'POS Terminal', 'month': 3},
        {'transaction_id': 'TX2', 'sme_id': 'SME-0001', 'timestamp': '2023-08-20 10:00:00', 'amount': 150.0, 'charge_volume': 150.0, 'status': 'SUCCESS', 'transaction_type': 'PAYMENT', 'channel': 'POS Terminal', 'month': 8},
        # Future tx for SME-0001 (After cutoff 2023-09-30) - MUST NOT BE COUNTED IN FEATURES!
        {'transaction_id': 'TX3', 'sme_id': 'SME-0001', 'timestamp': '2023-11-05 10:00:00', 'amount': 9999.0, 'charge_volume': 9999.0, 'status': 'SUCCESS', 'transaction_type': 'PAYMENT', 'channel': 'POS Terminal', 'month': 11},
        # Inactive SME-0002 has no transactions
    ])
    
    feats = compute_sme_features_at_cutoff(smes, tx, cutoff_date="2023-09-30")
    
    assert len(feats) == 2
    actual_features = [col for col in feats.columns if col != 'sme_id']
    assert len(actual_features) == 44, f"Engineered {len(actual_features)} features, expected 44"
    
    # Check that future transaction TX3 (amount 9999) was LEAKAGE-FREE and ignored:
    sme1_feats = feats[feats['sme_id'] == 'SME-0001'].iloc[0]
    assert sme1_feats['total_tx_count'] == 2, f"Expected 2 historical transactions, got {sme1_feats['total_tx_count']}"
    assert sme1_feats['total_charge_volume'] == 250.0, f"Expected total historical charge volume 250.0, got {sme1_feats['total_charge_volume']}"
    
    # Check that inactive SME-0002 has graceful defaults (no NaNs)
    sme2_feats = feats[feats['sme_id'] == 'SME-0002'].iloc[0]
    assert sme2_feats['total_tx_count'] == 0
    assert sme2_feats['total_charge_volume'] == 0.0
    assert feats.isna().sum().sum() == 0, "No NaN values allowed in engineered feature matrix"
