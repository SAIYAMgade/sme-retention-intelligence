"""
Feature Engineering Engine for SME Customer Retention Analytics.
Computes exactly 44 documented behavioral features at the prediction cutoff date.
Guarantees absolute leakage prevention:
- Only transactions with timestamp <= Cutoff are used for features.
- No future transaction counts, volumes, or outcome variables are accessed.
Vectorized implementation for ultra-fast, robust computation across thousands of SMEs.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime

from analytics.feature_engineering.registry import CANONICAL_FEATURES, FEATURE_NAMES

def compute_sme_features_at_cutoff(
    smes_df: pd.DataFrame,
    transactions_df: pd.DataFrame,
    cutoff_date: str = "2023-09-30"
) -> pd.DataFrame:
    """
    Computes exactly 44 canonical features for each SME using transactions
    strictly on or before cutoff_date.
    
    Parameters:
    -----------
    smes_df: DataFrame containing SME entities (sme_id, etc.)
    transactions_df: DataFrame containing all transactions
    cutoff_date: Prediction cutoff date (ISO format string 'YYYY-MM-DD')
    
    Returns:
    --------
    DataFrame with sme_id and exactly 44 canonical behavioral features.
    """
    cutoff_dt = pd.to_datetime(cutoff_date)
    start_dt = cutoff_dt - pd.Timedelta(days=273) # 9 months historical window
    
    all_sme_ids = smes_df['sme_id'].unique()
    features = pd.DataFrame({'sme_id': all_sme_ids}).set_index('sme_id')
    
    # 1. STRICT DATA LEAKAGE FILTER: only historical transactions
    hist_tx = transactions_df[pd.to_datetime(transactions_df['timestamp']) <= cutoff_dt].copy()
    hist_tx['timestamp'] = pd.to_datetime(hist_tx['timestamp'])
    
    # Pre-calculate windows
    d30_cutoff = cutoff_dt - pd.Timedelta(days=30)
    d90_cutoff = cutoff_dt - pd.Timedelta(days=90)
    
    # Hist month (1 to 9)
    hist_tx['hist_month'] = ((hist_tx['timestamp'] - start_dt).dt.days // 30.5).clip(0, 8).astype(int) + 1
    
    success_tx = hist_tx[hist_tx['status'] == 'SUCCESS']
    failed_tx = hist_tx[hist_tx['status'] == 'FAILED']
    refund_tx = hist_tx[(hist_tx['status'] == 'REFUNDED') | (hist_tx['transaction_type'] == 'REFUND')]
    
    # -------------------------------------------------------------
    # Group A: Frequency & Activity
    # -------------------------------------------------------------
    tot_counts = hist_tx.groupby('sme_id').size()
    succ_counts = success_tx.groupby('sme_id').size()
    
    features['total_tx_count'] = features.index.map(tot_counts).fillna(0).astype(int)
    features['successful_tx_count'] = features.index.map(succ_counts).fillna(0).astype(int)
    features['avg_monthly_tx_count'] = features['total_tx_count'] / 9.0
    
    # Monthly transaction count matrix (sme_id x 9 months)
    m_counts = hist_tx.pivot_table(
        index='sme_id', columns='hist_month', values='transaction_id', aggfunc='count', fill_value=0
    ).reindex(index=features.index, columns=range(1, 10), fill_value=0)
    
    features['median_monthly_tx_count'] = m_counts.median(axis=1).values
    
    # Monthly charge volume matrix (sme_id x 9 months)
    m_vols = success_tx.pivot_table(
        index='sme_id', columns='hist_month', values='amount', aggfunc='sum', fill_value=0.0
    ).reindex(index=features.index, columns=range(1, 10), fill_value=0.0)
    
    # Active months: months with > 0 successful transactions
    features['active_months'] = (m_vols > 0).sum(axis=1).astype(int)
    features['inactive_months'] = 9 - features['active_months']
    
    # Latest 30d and 90d transactions
    tx_30 = hist_tx[hist_tx['timestamp'] >= d30_cutoff].groupby('sme_id').size()
    tx_90 = hist_tx[hist_tx['timestamp'] >= d90_cutoff].groupby('sme_id').size()
    features['tx_count_last_30d'] = features.index.map(tx_30).fillna(0).astype(int)
    features['tx_count_last_90d'] = features.index.map(tx_90).fillna(0).astype(int)
    
    # Days since last transaction
    last_tx_time = success_tx.groupby('sme_id')['timestamp'].max()
    elapsed = (cutoff_dt - last_tx_time).dt.total_seconds() / 86400.0
    features['days_since_last_tx'] = features.index.map(elapsed).fillna(273.0)
    
    # Inter-transaction interval calculations
    # Vectorized calculation per SME
    def calc_gaps(df):
        if len(df) <= 1:
            return pd.Series({'avg_gap': 273.0 if len(df) == 0 else 136.5, 'max_gap': 273.0})
        sorted_ts = df['timestamp'].sort_values()
        gaps = sorted_ts.diff().dt.total_seconds() / 86400.0
        return pd.Series({'avg_gap': gaps.mean(), 'max_gap': gaps.max()})
        
    gap_stats = success_tx.groupby('sme_id').apply(calc_gaps)
    if not gap_stats.empty:
        features['avg_days_between_tx'] = features.index.map(gap_stats['avg_gap']).fillna(273.0)
        features['max_inactive_gap_days'] = features.index.map(gap_stats['max_gap']).fillna(273.0)
    else:
        features['avg_days_between_tx'] = 273.0
        features['max_inactive_gap_days'] = 273.0
        
    # -------------------------------------------------------------
    # Group B: Amount & Charge Volume
    # -------------------------------------------------------------
    tot_vol = success_tx.groupby('sme_id')['amount'].sum()
    features['total_charge_volume'] = features.index.map(tot_vol).fillna(0.0)
    features['avg_monthly_charge_volume'] = features['total_charge_volume'] / 9.0
    
    amt_stats = success_tx.groupby('sme_id')['amount'].agg(['median', 'mean', 'std'])
    features['median_tx_amount'] = features.index.map(amt_stats['median']).fillna(0.0)
    features['mean_tx_amount'] = features.index.map(amt_stats['mean']).fillna(0.0)
    features['std_tx_amount'] = features.index.map(amt_stats['std']).fillna(0.0)
    features['cv_tx_amount'] = features['std_tx_amount'] / (features['mean_tx_amount'] + 1e-5)
    
    vol_30 = success_tx[success_tx['timestamp'] >= d30_cutoff].groupby('sme_id')['amount'].sum()
    vol_90 = success_tx[success_tx['timestamp'] >= d90_cutoff].groupby('sme_id')['amount'].sum()
    features['charge_vol_last_30d'] = features.index.map(vol_30).fillna(0.0)
    features['charge_vol_last_90d'] = features.index.map(vol_90).fillna(0.0)
    features['avg_monthly_success_vol'] = features['total_charge_volume'] / np.maximum(features['active_months'], 1)
    
    # Mean ticket size change: M7-M9 vs M4-M6
    succ_m4_6 = success_tx[success_tx['hist_month'].isin([4, 5, 6])].groupby('sme_id')['amount'].mean()
    succ_m7_9 = success_tx[success_tx['hist_month'].isin([7, 8, 9])].groupby('sme_id')['amount'].mean()
    features['amount_change_trend'] = (features.index.map(succ_m7_9).fillna(0.0) - features.index.map(succ_m4_6).fillna(0.0))
    
    # -------------------------------------------------------------
    # Group C: Trend and Velocity
    # -------------------------------------------------------------
    cnt_m4_6 = m_counts[[4, 5, 6]].sum(axis=1)
    cnt_m7_9 = m_counts[[7, 8, 9]].sum(axis=1)
    vol_m4_6 = m_vols[[4, 5, 6]].sum(axis=1)
    vol_m7_9 = m_vols[[7, 8, 9]].sum(axis=1)
    
    features['tx_count_change_recent_vs_prior'] = (cnt_m7_9 - cnt_m4_6).astype(int)
    features['charge_vol_change_recent_vs_prior'] = vol_m7_9 - vol_m4_6
    
    features['recent_tx_velocity'] = cnt_m7_9 / 3.0
    features['prior_tx_velocity'] = cnt_m4_6 / 3.0
    features['velocity_change_ratio'] = features['recent_tx_velocity'] / (features['prior_tx_velocity'] + 1e-5)
    features['velocity_pct_change'] = (features['recent_tx_velocity'] - features['prior_tx_velocity']) / (features['prior_tx_velocity'] + 1e-5)
    
    features['recent_to_hist_tx_ratio'] = cnt_m7_9 / (features['total_tx_count'] + 1e-5)
    features['recent_to_hist_vol_ratio'] = vol_m7_9 / (features['total_charge_volume'] + 1e-5)
    
    # Linear trend slopes over 9 months using vectorized dot product: (x - 5) / sum((x-5)^2)
    # sum((x-5)^2) for x=1..9 is 60.
    features['tx_count_trend_slope'] = (m_counts.values @ np.arange(-4, 5)) / 60.0
    features['charge_vol_trend_slope'] = (m_vols.values @ np.arange(-4, 5)) / 60.0
    
    # -------------------------------------------------------------
    # Group D: Reliability and Variability
    # -------------------------------------------------------------
    fail_cnt = failed_tx.groupby('sme_id').size()
    ref_cnt = refund_tx.groupby('sme_id').size()
    features['failed_tx_count'] = features.index.map(fail_cnt).fillna(0).astype(int)
    features['failed_tx_rate'] = features['failed_tx_count'] / (features['total_tx_count'] + 1e-5)
    features['refund_count'] = features.index.map(ref_cnt).fillna(0).astype(int)
    features['refund_rate'] = features['refund_count'] / (features['total_tx_count'] + 1e-5)
    
    features['m2m_tx_count_std'] = m_counts.std(axis=1).values
    features['m2m_charge_vol_std'] = m_vols.std(axis=1).values
    features['recency_ratio'] = features['days_since_last_tx'] / 273.0
    
    # -------------------------------------------------------------
    # Group E: Business Mix
    # -------------------------------------------------------------
    ch_unique = hist_tx.groupby('sme_id')['channel'].nunique()
    features['distinct_channels_used'] = features.index.map(ch_unique).fillna(0).astype(int)
    
    ch_piv = hist_tx.pivot_table(
        index='sme_id', columns='channel', values='transaction_id', aggfunc='count', fill_value=0
    ).reindex(index=features.index, fill_value=0)
    ch_shares = ch_piv.div(ch_piv.sum(axis=1) + 1e-5, axis=0)
    features['dominant_channel_share'] = ch_shares.max(axis=1).fillna(1.0).values
    features['channel_herfindahl_index'] = (ch_shares ** 2).sum(axis=1).fillna(1.0).values
    
    types_unique = hist_tx.groupby('sme_id')['transaction_type'].nunique()
    features['active_tx_types'] = features.index.map(types_unique).fillna(0).astype(int)
    features['peak_month_tx_share'] = m_counts.max(axis=1) / (features['total_tx_count'] + 1e-5)
    features['historical_active_month_ratio'] = features['active_months'] / 9.0
    
    # Reset index to make sme_id a column
    features_df = features.reset_index()
    
    # Assert exact 44 features
    actual_features = [col for col in features_df.columns if col != 'sme_id']
    assert len(actual_features) == 44, f"Engineered {len(actual_features)} features, expected exactly 44!"
    for f in FEATURE_NAMES:
        assert f in features_df.columns, f"Missing canonical feature: {f}"
        
    return features_df
