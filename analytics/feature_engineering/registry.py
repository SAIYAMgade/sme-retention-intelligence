"""
Canonical Feature Registry for SME Customer Retention Analytics.
Defines EXACTLY 44 engineered behavioral features calculated strictly at the
prediction cutoff date (Month 9 / Day 273), completely free of future data leakage.
"""

from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass(frozen=True)
class FeatureDefinition:
    name: str
    category: str
    display_name: str
    definition: str
    formula: str
    calculation_window: str
    data_type: str
    missing_policy: str
    leakage_guard: str

CANONICAL_FEATURES: List[FeatureDefinition] = [
    # -------------------------------------------------------------
    # Group A: Transaction Frequency and Activity (1 - 10)
    # -------------------------------------------------------------
    FeatureDefinition(
        name="total_tx_count",
        category="Frequency & Activity",
        display_name="Total Historical Transactions",
        definition="Total count of all recorded transactions (successful, failed, refunded) during historical period",
        formula="COUNT(tx_id) WHERE timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="successful_tx_count",
        category="Frequency & Activity",
        display_name="Successful Transaction Count",
        definition="Count of transactions with status = SUCCESS",
        formula="COUNT(tx_id) WHERE status = 'SUCCESS' AND timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="avg_monthly_tx_count",
        category="Frequency & Activity",
        display_name="Average Monthly Transaction Count",
        definition="Average count of transactions per month across all 9 historical months",
        formula="total_tx_count / 9.0",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="median_monthly_tx_count",
        category="Frequency & Activity",
        display_name="Median Monthly Transaction Count",
        definition="Median of monthly transaction counts across months 1 through 9",
        formula="MEDIAN([tx_m1, tx_m2, ..., tx_m9])",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="active_months",
        category="Frequency & Activity",
        display_name="Active Months Count",
        definition="Number of distinct calendar months with >= 1 successful transaction",
        formula="COUNT(DISTINCT month) WHERE status = 'SUCCESS'",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="inactive_months",
        category="Frequency & Activity",
        display_name="Inactive Months Count",
        definition="Number of historical months with 0 successful transactions",
        formula="9 - active_months",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 9",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="tx_count_last_30d",
        category="Frequency & Activity",
        display_name="Transactions in Latest 30 Days",
        definition="Count of transactions occurring in the 30 days immediately preceding cutoff",
        formula="COUNT(tx_id) WHERE timestamp BETWEEN cutoff - 30d AND cutoff",
        calculation_window="Days 244-273",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="tx_count_last_90d",
        category="Frequency & Activity",
        display_name="Transactions in Latest 90 Days",
        definition="Count of transactions occurring in the 90 days immediately preceding cutoff",
        formula="COUNT(tx_id) WHERE timestamp BETWEEN cutoff - 90d AND cutoff",
        calculation_window="Days 184-273",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="avg_days_between_tx",
        category="Frequency & Activity",
        display_name="Average Days Between Transactions",
        definition="Mean duration in days between successive successful transactions",
        formula="MEAN(diff(tx_timestamps))",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 273.0 (inactive duration)",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="days_since_last_tx",
        category="Frequency & Activity",
        display_name="Days Since Last Transaction",
        definition="Elapsed days between the most recent successful transaction and cutoff",
        formula="cutoff_date - MAX(timestamp WHERE status = 'SUCCESS')",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 273.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),

    # -------------------------------------------------------------
    # Group B: Transaction Amount & Charge Volume (11 - 20)
    # -------------------------------------------------------------
    FeatureDefinition(
        name="total_charge_volume",
        category="Amount & Volume",
        display_name="Total Historical Charge Volume",
        definition="Cumulative currency amount of all successful transactions",
        formula="SUM(amount) WHERE status = 'SUCCESS' AND timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="avg_monthly_charge_volume",
        category="Amount & Volume",
        display_name="Average Monthly Charge Volume",
        definition="Total successful charge volume normalized across 9 historical months",
        formula="total_charge_volume / 9.0",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="median_tx_amount",
        category="Amount & Volume",
        display_name="Median Transaction Amount",
        definition="Median monetary value of successful transactions",
        formula="MEDIAN(amount) WHERE status = 'SUCCESS'",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="mean_tx_amount",
        category="Amount & Volume",
        display_name="Mean Transaction Amount",
        definition="Arithmetic mean monetary value of successful transactions",
        formula="total_charge_volume / (successful_tx_count + 1e-5)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="std_tx_amount",
        category="Amount & Volume",
        display_name="Transaction Amount Standard Deviation",
        definition="Standard deviation of transaction amounts for successful transactions",
        formula="STD(amount) WHERE status = 'SUCCESS'",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="cv_tx_amount",
        category="Amount & Volume",
        display_name="Coefficient of Variation of Tx Amount",
        definition="Relative variability of transaction values: std_tx_amount / mean_tx_amount",
        formula="std_tx_amount / (mean_tx_amount + 1e-5)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="charge_vol_last_30d",
        category="Amount & Volume",
        display_name="Charge Volume in Latest 30 Days",
        definition="Sum of successful transaction amounts in latest 30 days before cutoff",
        formula="SUM(amount) WHERE status = 'SUCCESS' AND timestamp >= cutoff - 30d",
        calculation_window="Days 244-273",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="charge_vol_last_90d",
        category="Amount & Volume",
        display_name="Charge Volume in Latest 90 Days",
        definition="Sum of successful transaction amounts in latest 90 days before cutoff",
        formula="SUM(amount) WHERE status = 'SUCCESS' AND timestamp >= cutoff - 90d",
        calculation_window="Days 184-273",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="avg_monthly_success_vol",
        category="Amount & Volume",
        display_name="Avg Volume in Active Months",
        definition="Average monthly charge volume calculated only over active months",
        formula="total_charge_volume / MAX(active_months, 1)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="amount_change_trend",
        category="Amount & Volume",
        display_name="Change in Average Ticket Size",
        definition="Difference between mean transaction amount in recent 90d vs prior 90d",
        formula="mean_amount_m7_m9 - mean_amount_m4_m6",
        calculation_window="Months 4-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),

    # -------------------------------------------------------------
    # Group C: Trend and Velocity (21 - 30)
    # -------------------------------------------------------------
    FeatureDefinition(
        name="tx_count_change_recent_vs_prior",
        category="Trend & Velocity",
        display_name="Tx Count Change (Recent vs Prior)",
        definition="Change in count of transactions from Months 4-6 to Months 7-9",
        formula="tx_count_m7_m9 - tx_count_m4_m6",
        calculation_window="Months 4-9",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="charge_vol_change_recent_vs_prior",
        category="Trend & Velocity",
        display_name="Charge Volume Change (Recent vs Prior)",
        definition="Change in charge volume from Months 4-6 to Months 7-9",
        formula="vol_m7_m9 - vol_m4_m6",
        calculation_window="Months 4-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="recent_tx_velocity",
        category="Trend & Velocity",
        display_name="Recent Monthly Transaction Velocity",
        definition="Average monthly transactions in the recent 3-month window (M7-M9)",
        formula="tx_count_m7_m9 / 3.0",
        calculation_window="Months 7-9 (Days 184-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="prior_tx_velocity",
        category="Trend & Velocity",
        display_name="Prior Monthly Transaction Velocity",
        definition="Average monthly transactions in the prior 3-month window (M4-M6)",
        formula="tx_count_m4_m6 / 3.0",
        calculation_window="Months 4-6 (Days 92-183)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="velocity_change_ratio",
        category="Trend & Velocity",
        display_name="Velocity Change Ratio",
        definition="Ratio of recent monthly velocity to prior monthly velocity",
        formula="recent_tx_velocity / (prior_tx_velocity + 1e-5)",
        calculation_window="Months 4-9",
        data_type="float",
        missing_policy="Fill 1.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="velocity_pct_change",
        category="Trend & Velocity",
        display_name="Velocity Percentage Change",
        definition="Percentage expansion or contraction in monthly transaction velocity",
        formula="(recent_tx_velocity - prior_tx_velocity) / (prior_tx_velocity + 1e-5)",
        calculation_window="Months 4-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="recent_to_hist_tx_ratio",
        category="Trend & Velocity",
        display_name="Recent to Historical Tx Count Ratio",
        definition="Proportion of historical transaction count occurring in latest 90 days",
        formula="tx_count_last_90d / (total_tx_count + 1e-5)",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 0.33",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="recent_to_hist_vol_ratio",
        category="Trend & Velocity",
        display_name="Recent to Historical Volume Ratio",
        definition="Proportion of historical charge volume occurring in latest 90 days",
        formula="charge_vol_last_90d / (total_charge_volume + 1e-5)",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 0.33",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="tx_count_trend_slope",
        category="Trend & Velocity",
        display_name="Monthly Tx Count Trend Slope",
        definition="Ordinary least squares slope of monthly transaction count over M1-M9",
        formula="OLS_SLOPE(y=monthly_tx, x=[1..9])",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="charge_vol_trend_slope",
        category="Trend & Velocity",
        display_name="Monthly Charge Volume Trend Slope",
        definition="Ordinary least squares slope of monthly charge volume over M1-M9",
        formula="OLS_SLOPE(y=monthly_vol, x=[1..9])",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),

    # -------------------------------------------------------------
    # Group D: Reliability and Variability (31 - 38)
    # -------------------------------------------------------------
    FeatureDefinition(
        name="failed_tx_count",
        category="Reliability & Variability",
        display_name="Failed Transaction Count",
        definition="Count of transactions with status = 'FAILED'",
        formula="COUNT(tx_id) WHERE status = 'FAILED' AND timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="failed_tx_rate",
        category="Reliability & Variability",
        display_name="Failed Transaction Rate",
        definition="Proportion of historical transactions that failed",
        formula="failed_tx_count / (total_tx_count + 1e-5)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="refund_count",
        category="Reliability & Variability",
        display_name="Refund / Reversal Count",
        definition="Count of transactions with status = 'REFUNDED' or type = 'REFUND'",
        formula="COUNT(tx_id) WHERE (status = 'REFUNDED' OR tx_type = 'REFUND') AND timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="refund_rate",
        category="Reliability & Variability",
        display_name="Refund / Reversal Rate",
        definition="Proportion of historical transactions that were refunded or reversed",
        formula="refund_count / (total_tx_count + 1e-5)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="m2m_tx_count_std",
        category="Reliability & Variability",
        display_name="Month-to-Month Tx Count Volatility",
        definition="Standard deviation of monthly transaction counts across M1-M9",
        formula="STD([tx_m1, tx_m2, ..., tx_m9])",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="m2m_charge_vol_std",
        category="Reliability & Variability",
        display_name="Month-to-Month Volume Volatility",
        definition="Standard deviation of monthly charge volumes across M1-M9",
        formula="STD([vol_m1, vol_m2, ..., vol_m9])",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="max_inactive_gap_days",
        category="Reliability & Variability",
        display_name="Maximum Inactive Gap (Days)",
        definition="Longest observed elapsed interval between consecutive successful transactions",
        formula="MAX(diff(tx_timestamps))",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 273.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="recency_ratio",
        category="Reliability & Variability",
        display_name="Relative Inactivity Recency Ratio",
        definition="Days since last transaction divided by the total historical window (273 days)",
        formula="days_since_last_tx / 273.0",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 1.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),

    # -------------------------------------------------------------
    # Group E: Business Activity and Mix (39 - 44)
    # -------------------------------------------------------------
    FeatureDefinition(
        name="distinct_channels_used",
        category="Business Mix",
        display_name="Distinct Channels Count",
        definition="Number of distinct payment/transaction channels utilized in historical period",
        formula="COUNT(DISTINCT channel) WHERE timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 1",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="dominant_channel_share",
        category="Business Mix",
        display_name="Dominant Channel Share",
        definition="Proportion of transactions occurring on the single most frequent channel",
        formula="MAX_COUNT(channel) / (total_tx_count + 1e-5)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 1.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="channel_herfindahl_index",
        category="Business Mix",
        display_name="Channel Concentration (HHI)",
        definition="Herfindahl-Hirschman index of channel usage concentration (sum of squared shares)",
        formula="SUM((channel_count_i / total_tx_count)^2)",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 1.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="active_tx_types",
        category="Business Mix",
        display_name="Active Transaction Types Count",
        definition="Number of distinct transaction types processed (Payment, Refund, Fee)",
        formula="COUNT(DISTINCT tx_type) WHERE timestamp <= cutoff",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="int",
        missing_policy="Fill 1",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="peak_month_tx_share",
        category="Business Mix",
        display_name="Peak Month Activity Share",
        definition="Proportion of total historical transactions concentrated in the single highest month",
        formula="MAX(monthly_tx) / (total_tx_count + 1e-5)",
        calculation_window="Months 1-9",
        data_type="float",
        missing_policy="Fill 1.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
    FeatureDefinition(
        name="historical_active_month_ratio",
        category="Business Mix",
        display_name="Historical Active Months Ratio",
        definition="Ratio of active months to the total 9 historical months",
        formula="active_months / 9.0",
        calculation_window="Months 1-9 (Days 1-273)",
        data_type="float",
        missing_policy="Fill 0.0",
        leakage_guard="Strict timestamp filter <= cutoff"
    ),
]

assert len(CANONICAL_FEATURES) == 44, f"Canonical feature registry must have exactly 44 features, found {len(CANONICAL_FEATURES)}"

FEATURE_NAMES: List[str] = [f.name for f in CANONICAL_FEATURES]
FEATURE_DICT: Dict[str, FeatureDefinition] = {f.name: f for f in CANONICAL_FEATURES}

def get_feature_metadata() -> List[Dict[str, Any]]:
    """Return dictionary representations for API and reporting endpoints."""
    return [
        {
            "id": idx + 1,
            "name": f.name,
            "category": f.category,
            "display_name": f.display_name,
            "definition": f.definition,
            "formula": f.formula,
            "calculation_window": f.calculation_window,
            "data_type": f.data_type,
            "missing_policy": f.missing_policy,
            "leakage_guard": f.leakage_guard,
        }
        for idx, f in enumerate(CANONICAL_FEATURES)
    ]
