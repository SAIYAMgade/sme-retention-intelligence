"""
Unit Tests for Synthetic Dataset Generation.
"""

import pytest
import pandas as pd
from analytics.data_generation.generator import generate_synthetic_dataset

def test_dataset_generation_volume_and_schema():
    smes_df, tx_df, labels_df = generate_synthetic_dataset(num_smes=6000, seed=42)
    
    # 1. Total transactions must exceed 97,000
    assert len(tx_df) > 97000, f"Expected >97,000 transactions, got {len(tx_df)}"
    
    # 2. SME count must equal 6,000
    assert len(smes_df) == 6000
    assert len(labels_df) == 6000
    
    # 3. Check columns
    assert "transaction_id" in tx_df.columns
    assert "amount" in tx_df.columns
    assert "charge_volume" in tx_df.columns
    assert "status" in tx_df.columns
    
    # 4. Check status values
    statuses = set(tx_df['status'].unique())
    assert "SUCCESS" in statuses
    assert "FAILED" in statuses
    
    # 5. Charge volume rule: only SUCCESS transactions have positive charge_volume
    failed_charge_vol = tx_df[tx_df['status'] != 'SUCCESS']['charge_volume'].sum()
    assert failed_charge_vol == 0.0, "Failed and refunded transactions must have 0 charge volume"

def test_dataset_determinism():
    _, tx1, _ = generate_synthetic_dataset(num_smes=500, seed=42)
    _, tx2, _ = generate_synthetic_dataset(num_smes=500, seed=42)
    assert len(tx1) == len(tx2)
    assert tx1['amount'].iloc[0] == tx2['amount'].iloc[0]
