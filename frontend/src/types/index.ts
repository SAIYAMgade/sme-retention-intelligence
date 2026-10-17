export interface OverviewData {
  total_transactions: number;
  distinct_smes: number;
  total_historical_charge_volume: number;
  observed_churn_rate_pct: number;
  high_priority_sme_count: number;
  total_monthly_exposure_at_risk: number;
  lr_holdout_roc_auc: number;
  at_risk_recall_pct: number;
  operating_threshold: number;
  dataset_version: string;
  last_pipeline_run: string;
  monthly_trend: {
    month: string;
    month_num: number;
    transactions: number;
    charge_volume: number;
  }[];
  tier_distribution: {
    tier: string;
    level: number;
    count: number;
    exposure: number;
    percentage: number;
  }[];
  key_findings: {
    id: number;
    title: string;
    finding: string;
    category: string;
  }[];
}

export interface SMEListItem {
  sme_id: string;
  business_name: string;
  industry: string;
  region: string;
  primary_channel: string;
  business_age_months: number;
  total_charge_volume: number;
  total_tx_count: number;
  tx_count_last_90d: number;
  days_since_last_tx: number;
  churn_probability: number;
  monthly_reference_volume: number;
  charge_volume_at_risk: number;
  priority_tier: string;
  priority_level: number;
  primary_reason: string;
}

export interface PaginatedSMEs {
  items: SMEListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SMEDetail {
  sme: {
    sme_id: string;
    business_name: string;
    industry: string;
    region: string;
    primary_channel: string;
    business_age_months: number;
    cohort_month: string;
    baseline_frequency: number;
    baseline_amount: number;
  };
  features: Record<string, number>;
  prioritization: {
    priority_tier: string;
    priority_level: number;
    churn_probability: number;
    monthly_reference_volume: number;
    charge_volume_at_risk: number;
    primary_reason: string;
    all_reasons: string;
    recommended_action: string;
  };
  churn_label: {
    is_eligible: boolean;
    has_future_success: boolean;
    observed_churn: number;
  } | null;
  recent_transactions: {
    transaction_id: string;
    sme_id: string;
    timestamp: string;
    amount: number;
    transaction_type: string;
    status: string;
    charge_volume: number;
    channel: string;
    month: number;
  }[];
  monthly_activity: {
    month: string;
    month_num: number;
    tx_count: number;
    charge_volume: number;
    failed_count: number;
  }[];
}

export interface FeatureDefinition {
  id: number;
  name: string;
  category: string;
  display_name: string;
  definition: string;
  formula: string;
  calculation_window: string;
  data_type: string;
  missing_policy: string;
  leakage_guard: string;
}

export interface VelocityFinding {
  finding_statement: string;
  verified_resume_claim: string;
  risk_ratio: number;
  ci_95_lower: number;
  ci_95_upper: number;
  odds_ratio: number;
  chi2_statistic: number;
  degrees_of_freedom: number;
  p_value: number;
  p_value_display: string;
  is_statistically_significant: boolean;
  sample_counts: {
    total_eligible_smes: number;
    declining_smes_count: number;
    declining_churned_count: number;
    declining_retained_count: number;
    non_declining_smes_count: number;
    non_declining_churned_count: number;
    non_declining_retained_count: number;
  };
  churn_rates: {
    declining_churn_rate: number;
    non_declining_churn_rate: number;
    percentage_point_difference: number;
  };
  methodology: Record<string, any>;
}

export interface PrioritizationSummary {
  total_smes: number;
  total_historical_charge_volume: number;
  total_monthly_exposure_at_risk: number;
  tiers: {
    tier: string;
    level: number;
    badge_color: string;
    sme_count: number;
    sme_percentage: number;
    monthly_exposure_at_risk: number;
    exposure_percentage: number;
    avg_churn_probability?: number;
    description: string;
  }[];
}

export interface ModelEvaluation {
  model_name: string;
  evaluation_partition: string;
  roc_auc: number;
  target_roc_auc_claim: number;
  operating_threshold: number;
  recall_at_operating_threshold: number;
  target_recall_claim: number;
  precision: number;
  f1_score: number;
  accuracy: number;
  specificity: number;
  confusion_matrix: {
    true_positives: number;
    false_positives: number;
    true_negatives: number;
    false_negatives: number;
    total_holdout: number;
    actual_churned: number;
    actual_retained: number;
  };
  roc_points: { fpr: number; tpr: number; threshold?: number }[];
  pr_points: { recall: number; precision: number }[];
  sensitivity_table: {
    threshold: number;
    recall: number;
    precision: number;
    f1_score: number;
    true_positives: number;
    false_positives: number;
    is_operating_threshold: boolean;
  }[];
  feature_importance: {
    feature_name: string;
    display_name: string;
    category: string;
    coefficient: number;
    odds_ratio: number;
    direction: string;
    abs_importance: number;
  }[];
}
