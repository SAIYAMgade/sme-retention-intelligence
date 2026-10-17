# CANONICAL FEATURE REGISTRY: 44 BEHAVIORAL FEATURES
**Product:** SME Retention Intelligence
**Prediction Cutoff:** 2023-09-30 (Day 273 / End of Month 9)
**Leakage Protection:** Strict enforcement ($t \le 273$ days)

---

## 1. Summary of Behavioral Dimensions

The 44 engineered predictive features are categorized into 5 behavioral dimensions:

1. **Transaction Frequency & Activity (Features 1–10)**: Account activity density, inter-transaction intervals, and recency.
2. **Transaction Amount & Charge Volume (Features 11–20)**: Monetary volume scale, ticket size variability, and recent processing volume.
3. **Trend & Velocity (Features 21–30)**: Contraction or expansion in processing frequency and volume across quarterly windows.
4. **Reliability & Variability (Features 31–38)**: Payment failure rates, refund/reversal rates, and volatility in monthly transactions.
5. **Business Activity & Channel Mix (Features 39–44)**: Payment channel diversification, concentration (Herfindahl-Hirschman Index), and seasonal peaks.

---

## 2. Complete Data Dictionary

| # | Feature Name | Dimension | Formula / SQL Expression | Window | Missing Policy | Leakage Guard |
|---|---|---|---|---|---|---|
| 1 | `total_tx_count` | Frequency | `COUNT(tx_id)` | M1–M9 | Fill 0 | $t \le T_{cutoff}$ |
| 2 | `successful_tx_count` | Frequency | `COUNT(tx_id) WHERE status = 'SUCCESS'` | M1–M9 | Fill 0 | $t \le T_{cutoff}$ |
| 3 | `avg_monthly_tx_count` | Frequency | `total_tx_count / 9.0` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 4 | `median_monthly_tx_count` | Frequency | `MEDIAN(monthly_counts)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 5 | `active_months` | Frequency | `COUNT(DISTINCT month) WHERE status = 'SUCCESS'` | M1–M9 | Fill 0 | $t \le T_{cutoff}$ |
| 6 | `inactive_months` | Frequency | `9 - active_months` | M1–M9 | Fill 9 | $t \le T_{cutoff}$ |
| 7 | `tx_count_last_30d` | Frequency | `COUNT(tx_id) WHERE t >= cutoff - 30d` | Days 244–273 | Fill 0 | $t \le T_{cutoff}$ |
| 8 | `tx_count_last_90d` | Frequency | `COUNT(tx_id) WHERE t >= cutoff - 90d` | Days 184–273 | Fill 0 | $t \le T_{cutoff}$ |
| 9 | `avg_days_between_tx` | Frequency | `(t_max - t_min) / (count - 1)` | M1–M9 | Fill 273.0 | $t \le T_{cutoff}$ |
| 10 | `days_since_last_tx` | Frequency | `cutoff_date - MAX(timestamp)` | M1–M9 | Fill 273.0 | $t \le T_{cutoff}$ |
| 11 | `total_charge_volume` | Volume | `SUM(amount) WHERE status = 'SUCCESS'` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 12 | `avg_monthly_charge_volume` | Volume | `total_charge_volume / 9.0` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 13 | `median_tx_amount` | Volume | `MEDIAN(amount) WHERE status = 'SUCCESS'` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 14 | `mean_tx_amount` | Volume | `total_charge_volume / (successful_tx_count + 1e-5)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 15 | `std_tx_amount` | Volume | `STD(amount) WHERE status = 'SUCCESS'` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 16 | `cv_tx_amount` | Volume | `std_tx_amount / (mean_tx_amount + 1e-5)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 17 | `charge_vol_last_30d` | Volume | `SUM(amount) WHERE status = 'SUCCESS' AND t >= cutoff - 30d` | Days 244–273 | Fill 0.0 | $t \le T_{cutoff}$ |
| 18 | `charge_vol_last_90d` | Volume | `SUM(amount) WHERE status = 'SUCCESS' AND t >= cutoff - 90d` | Days 184–273 | Fill 0.0 | $t \le T_{cutoff}$ |
| 19 | `avg_monthly_success_vol` | Volume | `total_charge_volume / MAX(active_months, 1)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 20 | `amount_change_trend` | Volume | `mean_amount_m7_m9 - mean_amount_m4_m6` | M4–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 21 | `tx_count_change_recent_vs_prior` | Velocity | `tx_count_m7_m9 - tx_count_m4_m6` | M4–M9 | Fill 0 | $t \le T_{cutoff}$ |
| 22 | `charge_vol_change_recent_vs_prior` | Velocity | `vol_m7_m9 - vol_m4_m6` | M4–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 23 | `recent_tx_velocity` | Velocity | `tx_count_m7_m9 / 3.0` | M7–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 24 | `prior_tx_velocity` | Velocity | `tx_count_m4_m6 / 3.0` | M4–M6 | Fill 0.0 | $t \le T_{cutoff}$ |
| 25 | `velocity_change_ratio` | Velocity | `recent_tx_velocity / (prior_tx_velocity + 1e-5)` | M4–M9 | Fill 1.0 | $t \le T_{cutoff}$ |
| 26 | `velocity_pct_change` | Velocity | `(recent_vel - prior_vel) / (prior_vel + 1e-5)` | M4–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 27 | `recent_to_hist_tx_ratio` | Velocity | `tx_count_m7_m9 / (total_tx_count + 1e-5)` | M1–M9 | Fill 0.33 | $t \le T_{cutoff}$ |
| 28 | `recent_to_hist_vol_ratio` | Velocity | `vol_m7_m9 / (total_charge_volume + 1e-5)` | M1–M9 | Fill 0.33 | $t \le T_{cutoff}$ |
| 29 | `tx_count_trend_slope` | Velocity | `OLS_SLOPE(monthly_counts, x=[1..9])` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 30 | `charge_vol_trend_slope` | Velocity | `OLS_SLOPE(monthly_vols, x=[1..9])` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 31 | `failed_tx_count` | Reliability | `COUNT(tx_id) WHERE status = 'FAILED'` | M1–M9 | Fill 0 | $t \le T_{cutoff}$ |
| 32 | `failed_tx_rate` | Reliability | `failed_tx_count / (total_tx_count + 1e-5)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 33 | `refund_count` | Reliability | `COUNT(tx_id) WHERE status = 'REFUNDED' OR type = 'REFUND'` | M1–M9 | Fill 0 | $t \le T_{cutoff}$ |
| 34 | `refund_rate` | Reliability | `refund_count / (total_tx_count + 1e-5)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 35 | `m2m_tx_count_std` | Reliability | `STD(monthly_counts)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 36 | `m2m_charge_vol_std` | Reliability | `STD(monthly_vols)` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
| 37 | `max_inactive_gap_days` | Reliability | `MAX(interval_between_success_tx)` | M1–M9 | Fill 273.0 | $t \le T_{cutoff}$ |
| 38 | `recency_ratio` | Reliability | `days_since_last_tx / 273.0` | M1–M9 | Fill 1.0 | $t \le T_{cutoff}$ |
| 39 | `distinct_channels_used` | Business Mix | `COUNT(DISTINCT channel)` | M1–M9 | Fill 1 | $t \le T_{cutoff}$ |
| 40 | `dominant_channel_share` | Business Mix | `MAX_COUNT(channel) / total_tx_count` | M1–M9 | Fill 1.0 | $t \le T_{cutoff}$ |
| 41 | `channel_herfindahl_index` | Business Mix | `SUM(channel_share_i^2)` | M1–M9 | Fill 1.0 | $t \le T_{cutoff}$ |
| 42 | `active_tx_types` | Business Mix | `COUNT(DISTINCT transaction_type)` | M1–M9 | Fill 1 | $t \le T_{cutoff}$ |
| 43 | `peak_month_tx_share` | Business Mix | `MAX(monthly_tx) / total_tx_count` | M1–M9 | Fill 1.0 | $t \le T_{cutoff}$ |
| 44 | `historical_active_month_ratio` | Business Mix | `active_months / 9.0` | M1–M9 | Fill 0.0 | $t \le T_{cutoff}$ |
