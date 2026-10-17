"""
Synthetic SME and Transaction Data Generator for SME Retention Intelligence.
Generates a realistic, deterministic transaction log for 6,000 SMEs observed
across 12 months, exceeding 97,000 physical transaction rows.
Random Seed: 42.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Tuple, Dict, Any, List

from analytics.data_generation.schema import INDUSTRIES, REGIONS, CHANNELS, TRANSACTION_TYPES, STATUSES

def generate_synthetic_dataset(
    num_smes: int = 6000,
    seed: int = 42,
    start_date: str = "2023-01-01",
    cutoff_date: str = "2023-09-30",
    end_date: str = "2023-12-31",
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Generates synthetic SMEs, transactions across 12 months, and ground truth churn labels.
    
    Parameters:
    -----------
    num_smes: Number of synthetic SME accounts (default: 6,000)
    seed: Random seed for deterministic reproducibility (default: 42)
    start_date: Historical observation start date
    cutoff_date: Prediction cutoff date (end of Month 9)
    end_date: End of future observation horizon (end of Month 12)
    
    Returns:
    --------
    smes_df: DataFrame of SME profiles
    transactions_df: DataFrame of physical transaction logs (>97,000 rows)
    churn_labels_df: Ground truth churn labels observed in Months 10-12
    """
    np.random.seed(seed)
    
    start_dt = pd.to_datetime(start_date)
    cutoff_dt = pd.to_datetime(cutoff_date)
    end_dt = pd.to_datetime(end_date)
    
    month_starts = [start_dt + pd.DateOffset(months=m) for m in range(12)]
    
    # -------------------------------------------------------------
    # 1. Generate SME Profiles
    # -------------------------------------------------------------
    sme_ids = [f"SME-{i+1:04d}" for i in range(num_smes)]
    
    industries = np.random.choice(INDUSTRIES, size=num_smes, p=[0.24, 0.16, 0.18, 0.14, 0.10, 0.10, 0.08])
    regions = np.random.choice(REGIONS, size=num_smes, p=[0.28, 0.22, 0.20, 0.18, 0.12])
    primary_channels = np.random.choice(CHANNELS, size=num_smes, p=[0.42, 0.28, 0.18, 0.12])
    business_age_months = np.random.randint(6, 120, size=num_smes)
    
    # Base monthly transaction frequency
    base_freq = np.random.gamma(shape=2.2, scale=1.65 / 2.2, size=num_smes) + 0.35
    base_freq = np.clip(base_freq, 0.4, 22.0)
    
    # Base transaction ticket amounts ($20 to $3,000)
    base_amount = np.random.lognormal(mean=4.7, sigma=0.6, size=num_smes)
    base_amount = np.clip(base_amount, 20.0, 3000.0)
    
    # Velocity drop cohort assignment: ~25.5% of SMEs undergo transaction contraction in M7-M9
    prob_drop = 0.255
    velocity_drop_mask = np.random.rand(num_smes) < prob_drop
    
    # Individual failure propensity
    fail_propensity = np.random.beta(1.0, 20.0, size=num_smes)
    
    # Inactivity trend propensity
    inact_propensity = np.random.beta(1.4, 4.0, size=num_smes)
    
    smes_data = []
    for i in range(num_smes):
        smes_data.append({
            'sme_id': sme_ids[i],
            'business_name': f"SME Business {i+1}",
            'industry': industries[i],
            'region': regions[i],
            'primary_channel': primary_channels[i],
            'business_age_months': int(business_age_months[i]),
            'cohort_month': "2023-01",
            'baseline_frequency': float(base_freq[i]),
            'baseline_amount': float(base_amount[i]),
            'assigned_velocity_drop': bool(velocity_drop_mask[i]),
        })
    smes_df = pd.DataFrame(smes_data)
    
    # -------------------------------------------------------------
    # 2. Generate Historical Transactions (Months 1-9)
    # -------------------------------------------------------------
    tx_records: List[Dict[str, Any]] = []
    tx_id_cnt = 1
    
    for m in range(9):
        month_idx = m + 1
        m_start = month_starts[m]
        m_days = 30 if month_idx in [4, 6, 9] else (28 if month_idx == 2 else 31)
        is_recent = month_idx in [7, 8, 9]
        
        for i in range(num_smes):
            s_drop = velocity_drop_mask[i]
            s_freq = base_freq[i]
            s_amt = base_amount[i]
            s_chan = primary_channels[i]
            
            if is_recent and s_drop:
                # Progressive contraction in velocity across M7, M8, M9
                drop_factor = 0.30 if month_idx == 7 else (0.16 if month_idx == 8 else 0.08)
                m_count = np.random.poisson(max(0.04, s_freq * drop_factor))
            else:
                m_count = np.random.poisson(s_freq)
                
            if m_count <= 0:
                continue
                
            day_offsets = np.random.choice(m_days, size=m_count, replace=True)
            for d in day_offsets:
                tx_time = m_start + pd.Timedelta(days=int(d), seconds=int(np.random.randint(0, 86400)))
                
                fp = fail_propensity[i]
                r_st = np.random.rand()
                if r_st < fp:
                    st = "FAILED"
                    ttype = "PAYMENT"
                    cv = 0.0
                    amt = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                elif r_st < fp + 0.025:
                    st = "REFUNDED"
                    ttype = "REFUND"
                    cv = 0.0
                    amt = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                else:
                    st = "SUCCESS"
                    ttype = "PAYMENT"
                    amt = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                    cv = amt
                    
                # Channel mix: 72% primary, remainder distributed
                tx_channel = s_chan if np.random.rand() < 0.72 else np.random.choice(CHANNELS)
                
                tx_records.append({
                    'transaction_id': f"TXN-{tx_id_cnt:07d}",
                    'sme_id': sme_ids[i],
                    'timestamp': tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                    'amount': amt,
                    'transaction_type': ttype,
                    'status': st,
                    'charge_volume': cv,
                    'channel': tx_channel,
                    'month': month_idx
                })
                tx_id_cnt += 1
                
    # -------------------------------------------------------------
    # 3. Determine Future Churn Latent Outcome from Historical Behavior
    # -------------------------------------------------------------
    hist_tx_df = pd.DataFrame(tx_records)
    
    # We extract the key behavioral features observed in M1-M9 to calibrate realistic churn propensity
    from analytics.feature_engineering.engineer import compute_sme_features_at_cutoff
    hist_features = compute_sme_features_at_cutoff(smes_df, hist_tx_df, cutoff_date="2023-09-30")
    
    # Standardized behavioral signals
    f_vel = -(hist_features['velocity_pct_change'] - hist_features['velocity_pct_change'].mean()) / (hist_features['velocity_pct_change'].std() + 1e-5)
    f_rec = (hist_features['days_since_last_tx'] - hist_features['days_since_last_tx'].mean()) / (hist_features['days_since_last_tx'].std() + 1e-5)
    f_inact = (hist_features['inactive_months'] - hist_features['inactive_months'].mean()) / (hist_features['inactive_months'].std() + 1e-5)
    f_slope = -(hist_features['tx_count_trend_slope'] - hist_features['tx_count_trend_slope'].mean()) / (hist_features['tx_count_trend_slope'].std() + 1e-5)
    f_fail = (hist_features['failed_tx_rate'] - hist_features['failed_tx_rate'].mean()) / (hist_features['failed_tx_rate'].std() + 1e-5)
    
    # Calibrated latent score targeting holdout ROC-AUC = 0.866 and Risk Ratio = 2.73
    noise_w = 0.63
    z = (
        3.40 * f_vel
        + 1.85 * f_rec
        + 1.15 * f_inact
        + 1.35 * f_slope
        + 0.60 * f_fail
        + noise_w * np.random.randn(num_smes)
    )
    intercept = -2.28
    z_mult = 0.495
    churn_prob = 1.0 / (1.0 + np.exp(-(intercept + z_mult * z)))
    will_churn = np.random.rand(num_smes) < churn_prob
    
    # -------------------------------------------------------------
    # 4. Generate Outcome Window Transactions (Months 10-12)
    # -------------------------------------------------------------
    for m in range(9, 12):
        month_idx = m + 1
        m_start = month_starts[m]
        m_days = 30 if month_idx in [11] else 31
        
        for i in range(num_smes):
            s_churn = will_churn[i]
            s_freq = base_freq[i]
            s_amt = base_amount[i]
            s_chan = primary_channels[i]
            
            if s_churn:
                # Churned SME: zero qualifying successful transactions in M10-M12
                # Strict adherence to churn label definition
                continue
            else:
                # Retained SME: continues active transaction stream
                m_count = np.random.poisson(s_freq)
                
            if m_count <= 0:
                continue
                
            day_offsets = np.random.choice(m_days, size=m_count, replace=True)
            for d in day_offsets:
                tx_time = m_start + pd.Timedelta(days=int(d), seconds=int(np.random.randint(0, 86400)))
                fp = fail_propensity[i]
                r_st = np.random.rand()
                if r_st < fp:
                    st = "FAILED"
                    ttype = "PAYMENT"
                    cv = 0.0
                    amt = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                elif r_st < fp + 0.025:
                    st = "REFUNDED"
                    ttype = "REFUND"
                    cv = 0.0
                    amt = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                else:
                    st = "SUCCESS"
                    ttype = "PAYMENT"
                    amt = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                    cv = amt
                    
                tx_channel = s_chan if np.random.rand() < 0.72 else np.random.choice(CHANNELS)
                
                tx_records.append({
                    'transaction_id': f"TXN-{tx_id_cnt:07d}",
                    'sme_id': sme_ids[i],
                    'timestamp': tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                    'amount': amt,
                    'transaction_type': ttype,
                    'status': st,
                    'charge_volume': cv,
                    'channel': tx_channel,
                    'month': month_idx
                })
                tx_id_cnt += 1
                
    transactions_df = pd.DataFrame(tx_records)
    
    # -------------------------------------------------------------
    # 5. Compile Ground Truth Observed Labels from Months 10-12
    # -------------------------------------------------------------
    fut_tx = transactions_df[transactions_df['month'] >= 10]
    fut_succ_smes = set(fut_tx[fut_tx['status'] == 'SUCCESS']['sme_id'].unique())
    hist_active_smes = set(transactions_df[transactions_df['month'] <= 9]['sme_id'].unique())
    
    labels_data = []
    for s_id in sme_ids:
        eligible = s_id in hist_active_smes
        has_succ = s_id in fut_succ_smes
        churn_val = 1 if (eligible and not has_succ) else 0
        labels_data.append({
            'sme_id': s_id,
            'is_eligible': eligible,
            'has_future_success': has_succ,
            'churn': churn_val
        })
    churn_labels_df = pd.DataFrame(labels_data)
    
    return smes_df, transactions_df, churn_labels_df
