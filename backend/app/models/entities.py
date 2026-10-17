"""
SQLAlchemy ORM Entity Models for SME Retention Intelligence.
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, Text, ForeignKey
from datetime import datetime

from backend.app.db.database import Base

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_version = Column(String(50), unique=True, nullable=False)
    random_seed = Column(Integer, nullable=False)
    generator_version = Column(String(50), nullable=False)
    num_smes = Column(Integer, nullable=False)
    num_transactions = Column(Integer, nullable=False)
    start_date = Column(String(20), nullable=False)
    cutoff_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SME(Base):
    __tablename__ = "smes"
    
    sme_id = Column(String(50), primary_key=True)
    business_name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    primary_channel = Column(String(100), nullable=False)
    business_age_months = Column(Integer, nullable=False)
    cohort_month = Column(String(20), nullable=False, index=True)
    baseline_frequency = Column(Float, nullable=False)
    baseline_amount = Column(Float, nullable=False)
    assigned_velocity_drop = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(String(50), primary_key=True)
    sme_id = Column(String(50), ForeignKey("smes.sme_id"), nullable=False, index=True)
    timestamp = Column(String(30), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, index=True)
    charge_volume = Column(Float, nullable=False)
    channel = Column(String(100), nullable=False)
    month = Column(Integer, nullable=False, index=True)

class ChurnLabel(Base):
    __tablename__ = "churn_labels"
    
    sme_id = Column(String(50), ForeignKey("smes.sme_id"), primary_key=True)
    is_eligible = Column(Boolean, nullable=False)
    has_future_success = Column(Boolean, nullable=False)
    churn = Column(Integer, nullable=False)
    cutoff_date = Column(String(20), nullable=False)
    observation_end_date = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PrioritizationResult(Base):
    __tablename__ = "prioritization_results"
    
    sme_id = Column(String(50), ForeignKey("smes.sme_id"), primary_key=True)
    priority_tier = Column(String(50), nullable=False, index=True)
    priority_level = Column(Integer, nullable=False)
    churn_probability = Column(Float, nullable=False)
    monthly_reference_volume = Column(Float, nullable=False)
    charge_volume_at_risk = Column(Float, nullable=False, index=True)
    primary_reason = Column(String(255), nullable=False)
    all_reasons = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class FeatureSnapshot(Base):
    __tablename__ = "feature_snapshots"
    
    sme_id = Column(String(50), ForeignKey("smes.sme_id"), primary_key=True)
    total_tx_count = Column(Integer, nullable=False)
    successful_tx_count = Column(Integer, nullable=False)
    avg_monthly_tx_count = Column(Float, nullable=False)
    median_monthly_tx_count = Column(Float, nullable=False)
    active_months = Column(Integer, nullable=False)
    inactive_months = Column(Integer, nullable=False)
    tx_count_last_30d = Column(Integer, nullable=False)
    tx_count_last_90d = Column(Integer, nullable=False)
    avg_days_between_tx = Column(Float, nullable=False)
    days_since_last_tx = Column(Float, nullable=False)
    total_charge_volume = Column(Float, nullable=False)
    avg_monthly_charge_volume = Column(Float, nullable=False)
    median_tx_amount = Column(Float, nullable=False)
    mean_tx_amount = Column(Float, nullable=False)
    std_tx_amount = Column(Float, nullable=False)
    cv_tx_amount = Column(Float, nullable=False)
    charge_vol_last_30d = Column(Float, nullable=False)
    charge_vol_last_90d = Column(Float, nullable=False)
    avg_monthly_success_vol = Column(Float, nullable=False)
    amount_change_trend = Column(Float, nullable=False)
    tx_count_change_recent_vs_prior = Column(Integer, nullable=False)
    charge_vol_change_recent_vs_prior = Column(Float, nullable=False)
    recent_tx_velocity = Column(Float, nullable=False)
    prior_tx_velocity = Column(Float, nullable=False)
    velocity_change_ratio = Column(Float, nullable=False)
    velocity_pct_change = Column(Float, nullable=False)
    recent_to_hist_tx_ratio = Column(Float, nullable=False)
    recent_to_hist_vol_ratio = Column(Float, nullable=False)
    tx_count_trend_slope = Column(Float, nullable=False)
    charge_vol_trend_slope = Column(Float, nullable=False)
    failed_tx_count = Column(Integer, nullable=False)
    failed_tx_rate = Column(Float, nullable=False)
    refund_count = Column(Integer, nullable=False)
    refund_rate = Column(Float, nullable=False)
    m2m_tx_count_std = Column(Float, nullable=False)
    m2m_charge_vol_std = Column(Float, nullable=False)
    max_inactive_gap_days = Column(Float, nullable=False)
    recency_ratio = Column(Float, nullable=False)
    distinct_channels_used = Column(Integer, nullable=False)
    dominant_channel_share = Column(Float, nullable=False)
    channel_herfindahl_index = Column(Float, nullable=False)
    active_tx_types = Column(Integer, nullable=False)
    peak_month_tx_share = Column(Float, nullable=False)
    historical_active_month_ratio = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
