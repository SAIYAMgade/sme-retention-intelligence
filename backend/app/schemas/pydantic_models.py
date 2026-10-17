"""
Pydantic Schemas for API Request and Response Serialization.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    database: str
    version: str

class DatasetMetadataResponse(BaseModel):
    dataset_version: str
    random_seed: int
    generator_version: str
    num_smes: int
    num_transactions: int
    start_date: str
    cutoff_date: str
    end_date: str
    created_at: str

class OverviewResponse(BaseModel):
    total_transactions: int
    distinct_smes: int
    total_historical_charge_volume: float
    observed_churn_rate_pct: float
    high_priority_sme_count: int
    total_monthly_exposure_at_risk: float
    lr_holdout_roc_auc: float
    at_risk_recall_pct: float
    operating_threshold: float
    dataset_version: str
    last_pipeline_run: str
    monthly_trend: List[Dict[str, Any]]
    tier_distribution: List[Dict[str, Any]]
    key_findings: List[Dict[str, Any]]

class FeatureRegistryItem(BaseModel):
    id: int
    name: str
    category: str
    display_name: str
    definition: str
    formula: str
    calculation_window: str
    data_type: str
    missing_policy: str
    leakage_guard: str

class VelocityFindingResponse(BaseModel):
    finding_statement: str
    verified_resume_claim: str
    risk_ratio: float
    ci_95_lower: float
    ci_95_upper: float
    odds_ratio: float
    chi2_statistic: float
    degrees_of_freedom: int
    p_value: float
    p_value_display: str
    is_statistically_significant: bool
    sample_counts: Dict[str, int]
    churn_rates: Dict[str, float]
    methodology: Dict[str, Any]

class PrioritizationTierSummary(BaseModel):
    tier: str
    level: int
    badge_color: str
    sme_count: int
    sme_percentage: float
    monthly_exposure_at_risk: float
    exposure_percentage: float
    avg_churn_probability: float
    description: str

class PrioritizationSummaryResponse(BaseModel):
    total_smes: int
    total_historical_charge_volume: float
    total_monthly_exposure_at_risk: float
    tiers: List[PrioritizationTierSummary]

class PrioritizationRecalculateRequest(BaseModel):
    tier1_prob_threshold: Optional[float] = 0.45
    tier1_exposure_threshold: Optional[float] = 1500.0
    tier2_prob_threshold: Optional[float] = 0.25
    tier2_exposure_threshold: Optional[float] = 600.0

class SMEListItem(BaseModel):
    sme_id: str
    business_name: str
    industry: str
    region: str
    primary_channel: str
    business_age_months: int
    total_charge_volume: float
    total_tx_count: int
    tx_count_last_90d: int
    days_since_last_tx: float
    churn_probability: float
    monthly_reference_volume: float
    charge_volume_at_risk: float
    priority_tier: str
    priority_level: int
    primary_reason: str

class PaginatedSMEListResponse(BaseModel):
    items: List[SMEListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class TransactionItem(BaseModel):
    transaction_id: str
    sme_id: str
    timestamp: str
    amount: float
    transaction_type: str
    status: str
    charge_volume: float
    channel: str
    month: int

class PaginatedTransactionResponse(BaseModel):
    items: List[TransactionItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class SMEDetailResponse(BaseModel):
    sme: Dict[str, Any]
    features: Dict[str, Any]
    prioritization: Dict[str, Any]
    churn_label: Optional[Dict[str, Any]]
    recent_transactions: List[TransactionItem]
    monthly_activity: List[Dict[str, Any]]

class ModelEvaluationResponse(BaseModel):
    model_name: str
    evaluation_partition: str
    roc_auc: float
    target_roc_auc_claim: float
    operating_threshold: float
    recall_at_operating_threshold: float
    target_recall_claim: float
    precision: float
    f1_score: float
    accuracy: float
    specificity: float
    confusion_matrix: Dict[str, Any]
    roc_points: List[Dict[str, float]]
    pr_points: List[Dict[str, float]]
    sensitivity_table: List[Dict[str, Any]]
    feature_importance: List[Dict[str, Any]]
