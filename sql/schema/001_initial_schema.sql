-- SME Retention Intelligence Database Schema
-- Compatible with PostgreSQL 14+ and SQLite 3

CREATE TABLE IF NOT EXISTS dataset_metadata (
    id SERIAL PRIMARY KEY,
    dataset_version VARCHAR(50) NOT NULL UNIQUE,
    random_seed INTEGER NOT NULL,
    generator_version VARCHAR(50) NOT NULL,
    num_smes INTEGER NOT NULL,
    num_transactions INTEGER NOT NULL,
    start_date DATE NOT NULL,
    cutoff_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS smes (
    sme_id VARCHAR(50) PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    primary_channel VARCHAR(100) NOT NULL,
    business_age_months INTEGER NOT NULL,
    cohort_month VARCHAR(20) NOT NULL,
    baseline_frequency NUMERIC(10, 4) NOT NULL,
    baseline_amount NUMERIC(12, 2) NOT NULL,
    assigned_velocity_drop BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_smes_industry ON smes(industry);
CREATE INDEX IF NOT EXISTS idx_smes_region ON smes(region);
CREATE INDEX IF NOT EXISTS idx_smes_cohort ON smes(cohort_month);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    sme_id VARCHAR(50) NOT NULL REFERENCES smes(sme_id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    charge_volume NUMERIC(12, 2) NOT NULL,
    channel VARCHAR(100) NOT NULL,
    month INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tx_sme_id ON transactions(sme_id);
CREATE INDEX IF NOT EXISTS idx_tx_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_tx_month ON transactions(month);

CREATE TABLE IF NOT EXISTS churn_labels (
    sme_id VARCHAR(50) PRIMARY KEY REFERENCES smes(sme_id) ON DELETE CASCADE,
    is_eligible BOOLEAN NOT NULL,
    has_future_success BOOLEAN NOT NULL,
    churn INTEGER NOT NULL,
    cutoff_date DATE NOT NULL,
    observation_end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_snapshots (
    sme_id VARCHAR(50) PRIMARY KEY REFERENCES smes(sme_id) ON DELETE CASCADE,
    total_tx_count INTEGER NOT NULL,
    successful_tx_count INTEGER NOT NULL,
    avg_monthly_tx_count NUMERIC(10, 4) NOT NULL,
    median_monthly_tx_count NUMERIC(10, 4) NOT NULL,
    active_months INTEGER NOT NULL,
    inactive_months INTEGER NOT NULL,
    tx_count_last_30d INTEGER NOT NULL,
    tx_count_last_90d INTEGER NOT NULL,
    avg_days_between_tx NUMERIC(10, 4) NOT NULL,
    days_since_last_tx NUMERIC(10, 4) NOT NULL,
    total_charge_volume NUMERIC(14, 2) NOT NULL,
    avg_monthly_charge_volume NUMERIC(14, 2) NOT NULL,
    median_tx_amount NUMERIC(12, 2) NOT NULL,
    mean_tx_amount NUMERIC(12, 2) NOT NULL,
    std_tx_amount NUMERIC(12, 2) NOT NULL,
    cv_tx_amount NUMERIC(10, 4) NOT NULL,
    charge_vol_last_30d NUMERIC(14, 2) NOT NULL,
    charge_vol_last_90d NUMERIC(14, 2) NOT NULL,
    avg_monthly_success_vol NUMERIC(14, 2) NOT NULL,
    amount_change_trend NUMERIC(12, 2) NOT NULL,
    tx_count_change_recent_vs_prior INTEGER NOT NULL,
    charge_vol_change_recent_vs_prior NUMERIC(14, 2) NOT NULL,
    recent_tx_velocity NUMERIC(10, 4) NOT NULL,
    prior_tx_velocity NUMERIC(10, 4) NOT NULL,
    velocity_change_ratio NUMERIC(10, 4) NOT NULL,
    velocity_pct_change NUMERIC(10, 4) NOT NULL,
    recent_to_hist_tx_ratio NUMERIC(10, 4) NOT NULL,
    recent_to_hist_vol_ratio NUMERIC(10, 4) NOT NULL,
    tx_count_trend_slope NUMERIC(10, 4) NOT NULL,
    charge_vol_trend_slope NUMERIC(10, 4) NOT NULL,
    failed_tx_count INTEGER NOT NULL,
    failed_tx_rate NUMERIC(10, 4) NOT NULL,
    refund_count INTEGER NOT NULL,
    refund_rate NUMERIC(10, 4) NOT NULL,
    m2m_tx_count_std NUMERIC(10, 4) NOT NULL,
    m2m_charge_vol_std NUMERIC(14, 2) NOT NULL,
    max_inactive_gap_days NUMERIC(10, 4) NOT NULL,
    recency_ratio NUMERIC(10, 4) NOT NULL,
    distinct_channels_used INTEGER NOT NULL,
    dominant_channel_share NUMERIC(10, 4) NOT NULL,
    channel_herfindahl_index NUMERIC(10, 4) NOT NULL,
    active_tx_types INTEGER NOT NULL,
    peak_month_tx_share NUMERIC(10, 4) NOT NULL,
    historical_active_month_ratio NUMERIC(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_risk_scores (
    sme_id VARCHAR(50) PRIMARY KEY REFERENCES smes(sme_id) ON DELETE CASCADE,
    lr_churn_probability NUMERIC(6, 5) NOT NULL,
    knn_churn_probability NUMERIC(6, 5) NOT NULL,
    is_holdout BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prioritization_results (
    sme_id VARCHAR(50) PRIMARY KEY REFERENCES smes(sme_id) ON DELETE CASCADE,
    priority_tier VARCHAR(50) NOT NULL,
    priority_level INTEGER NOT NULL,
    churn_probability NUMERIC(6, 5) NOT NULL,
    monthly_reference_volume NUMERIC(14, 2) NOT NULL,
    charge_volume_at_risk NUMERIC(14, 2) NOT NULL,
    primary_reason VARCHAR(255) NOT NULL,
    all_reasons TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prio_tier ON prioritization_results(priority_tier);
CREATE INDEX IF NOT EXISTS idx_prio_exposure ON prioritization_results(charge_volume_at_risk DESC);
