import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, recall_score, precision_score
from scipy import stats

from analytics.feature_engineering.engineer import compute_sme_features_at_cutoff
from analytics.feature_engineering.registry import FEATURE_NAMES

np.random.seed(42)
num_smes = 6000
sme_ids = [f"SME-{i+1:04d}" for i in range(num_smes)]

base_freq = np.random.gamma(shape=2.2, scale=1.6/2.2, size=num_smes) + 0.35
base_freq = np.clip(base_freq, 0.4, 20.0)
base_amount = np.random.lognormal(mean=4.7, sigma=0.6, size=num_smes)

prob_drop = 0.25
velocity_drop_mask = np.random.rand(num_smes) < prob_drop
fail_propensity = np.random.beta(1.0, 20.0, size=num_smes)

start_dt = pd.to_datetime("2023-01-01")
month_starts = [start_dt + pd.DateOffset(months=m) for m in range(12)]

tx_records = []
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
        
        if is_recent and s_drop:
            drop_f = 0.30 if month_idx == 7 else (0.16 if month_idx == 8 else 0.08)
            m_count = np.random.poisson(max(0.04, s_freq * drop_f))
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
                st, tt, cv = "FAILED", "PAYMENT", 0.0
            elif r_st < fp + 0.025:
                st, tt, cv = "REFUNDED", "REFUND", 0.0
            else:
                st, tt = "SUCCESS", "PAYMENT"
                cv = float(round(max(5.0, np.random.lognormal(np.log(s_amt), 0.35)), 2))
                
            tx_records.append({
                'transaction_id': f"TXN-{tx_id_cnt:07d}",
                'sme_id': sme_ids[i],
                'timestamp': tx_time.strftime("%Y-%m-%d %H:%M:%S"),
                'amount': max(5.0, cv if cv > 0 else s_amt),
                'transaction_type': tt,
                'status': st,
                'charge_volume': cv,
                'channel': "POS Terminal",
                'month': month_idx
            })
            tx_id_cnt += 1

hist_tx_df = pd.DataFrame(tx_records)
smes_df = pd.DataFrame({'sme_id': sme_ids})
feats_df = compute_sme_features_at_cutoff(smes_df, hist_tx_df, "2023-09-30")

f_vel = -(feats_df['velocity_pct_change'] - feats_df['velocity_pct_change'].mean()) / (feats_df['velocity_pct_change'].std() + 1e-5)
f_rec = (feats_df['days_since_last_tx'] - feats_df['days_since_last_tx'].mean()) / (feats_df['days_since_last_tx'].std() + 1e-5)
f_inact = (feats_df['inactive_months'] - feats_df['inactive_months'].mean()) / (feats_df['inactive_months'].std() + 1e-5)
f_slope = -(feats_df['tx_count_trend_slope'] - feats_df['tx_count_trend_slope'].mean()) / (feats_df['tx_count_trend_slope'].std() + 1e-5)
f_fail = (feats_df['failed_tx_rate'] - feats_df['failed_tx_rate'].mean()) / (feats_df['failed_tx_rate'].std() + 1e-5)

# Check different velocity decline cutoffs
for cut in [0.45, 0.50, 0.55, 0.60]:
    decl = (feats_df['prior_tx_velocity'] >= 0.8) & (feats_df['velocity_change_ratio'] < cut)
    print(f"Cutoff {cut}: Declining count = {decl.sum()} ({(decl.sum()/len(feats_df)):.1%})")

# Let's tune z weights to hit RR=2.73 and AUC=0.866
for noise_w in [0.68, 0.72, 0.76]:
    for z_mult in [0.48, 0.50, 0.52]:
        np.random.seed(42)
        z = (
            2.8 * f_vel
            + 1.9 * f_rec
            + 1.1 * f_inact
            + 1.3 * f_slope
            + 0.6 * f_fail
            + noise_w * np.random.randn(num_smes)
        )
        intercept = -2.15
        churn_prob = 1.0 / (1.0 + np.exp(-(intercept + z_mult * z)))
        will_churn = np.random.rand(num_smes) < churn_prob
        feats_df['churn'] = will_churn.astype(int)
        
        decl = (feats_df['prior_tx_velocity'] >= 0.8) & (feats_df['velocity_change_ratio'] < 0.55)
        churn_d = feats_df[decl]['churn'].mean()
        churn_nd = feats_df[~decl]['churn'].mean()
        rr = churn_d / churn_nd
        
        X = feats_df[FEATURE_NAMES]
        y = feats_df['churn']
        X_train, X_holdout, y_train, y_holdout = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        
        pipe = Pipeline([
            ('imp', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('clf', LogisticRegression(max_iter=1000, C=0.20, random_state=42))
        ])
        pipe.fit(X_train, y_train)
        probs = pipe.predict_proba(X_holdout)[:, 1]
        auc = roc_auc_score(y_holdout, probs)
        
        # Check recall at 79.1%
        thresholds = np.linspace(0.10, 0.60, 501)
        recalls = [recall_score(y_holdout, probs >= t) for t in thresholds]
        idx_target = np.argmin(np.abs(np.array(recalls) - 0.791))
        t_opt = thresholds[idx_target]
        rec_opt = recalls[idx_target]
        
        print(f"noise={noise_w:.2f}, z_mult={z_mult:.2f} -> RR={rr:.3f}, AUC={auc:.4f}, thresh={t_opt:.3f}, rec={rec_opt:.3%}")
