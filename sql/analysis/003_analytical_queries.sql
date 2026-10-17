-- SME Retention Intelligence: 10 Canonical Analytical SQL Queries

-- 1. Total Transaction Count
SELECT COUNT(*) AS total_transactions
FROM transactions;

-- 2. Distinct SME Count
SELECT COUNT(DISTINCT sme_id) AS distinct_smes
FROM smes;

-- 3. Successful Transaction Volume
SELECT 
    COUNT(*) AS successful_tx_count,
    ROUND(SUM(amount), 2) AS total_successful_charge_volume,
    ROUND(AVG(amount), 2) AS avg_successful_ticket_size
FROM transactions
WHERE status = 'SUCCESS';

-- 4. Charge Volume by Month
SELECT 
    month,
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS successful_transactions,
    ROUND(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 2) AS monthly_successful_volume,
    ROUND(AVG(CASE WHEN status = 'SUCCESS' THEN amount ELSE NULL END), 2) AS avg_monthly_ticket_size
FROM transactions
GROUP BY month
ORDER BY month ASC;

-- 5. Transaction Frequency by SME (Distribution across Historical Period M1-M9)
SELECT 
    sme_id,
    COUNT(*) AS hist_tx_count,
    ROUND(COUNT(*) / 9.0, 2) AS avg_monthly_tx_frequency,
    ROUND(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 2) AS total_charge_volume
FROM transactions
WHERE month <= 9
GROUP BY sme_id
ORDER BY hist_tx_count DESC;

-- 6. Churn Rate by Cohort
SELECT 
    s.cohort_month,
    COUNT(c.sme_id) AS total_eligible_smes,
    SUM(c.churn) AS churned_smes,
    ROUND(AVG(c.churn) * 100.0, 2) AS churn_rate_pct
FROM smes s
JOIN churn_labels c ON s.sme_id = c.sme_id
WHERE c.is_eligible = TRUE
GROUP BY s.cohort_month
ORDER BY s.cohort_month ASC;

-- 7. Declining-Velocity versus Non-Declining-Velocity Churn Rates
SELECT 
    CASE 
        WHEN f.prior_tx_velocity >= 0.8 AND f.velocity_change_ratio < 0.55 THEN 'Declining Velocity'
        ELSE 'Non-Declining Velocity'
    END AS velocity_cohort,
    COUNT(*) AS total_smes,
    SUM(c.churn) AS churned_smes,
    ROUND(AVG(c.churn) * 100.0, 2) AS churn_rate_pct,
    ROUND(SUM(c.churn)::NUMERIC / NULLIF(COUNT(*), 0), 4) AS churn_rate_ratio
FROM feature_snapshots f
JOIN churn_labels c ON f.sme_id = c.sme_id
WHERE c.is_eligible = TRUE
GROUP BY 1;

-- 8. Industry and Region Breakdown with Churn & Exposure
SELECT 
    s.industry,
    s.region,
    COUNT(DISTINCT s.sme_id) AS total_smes,
    ROUND(AVG(c.churn) * 100.0, 2) AS churn_rate_pct,
    ROUND(SUM(p.charge_volume_at_risk), 2) AS total_volume_at_risk,
    ROUND(AVG(p.charge_volume_at_risk), 2) AS avg_volume_at_risk
FROM smes s
JOIN churn_labels c ON s.sme_id = c.sme_id
LEFT JOIN prioritization_results p ON s.sme_id = p.sme_id
WHERE c.is_eligible = TRUE
GROUP BY s.industry, s.region
ORDER BY total_volume_at_risk DESC;

-- 9. Charge Volume at Risk Summary
SELECT 
    ROUND(SUM(f.total_charge_volume), 2) AS total_historical_volume,
    ROUND(SUM(p.monthly_reference_volume), 2) AS total_monthly_reference_volume,
    ROUND(SUM(p.charge_volume_at_risk), 2) AS total_monthly_exposure_at_risk,
    ROUND(AVG(p.churn_probability) * 100.0, 2) AS avg_portfolio_churn_prob_pct
FROM feature_snapshots f
JOIN prioritization_results p ON f.sme_id = p.sme_id;

-- 10. Customer Counts and Financial Exposure Across Prioritization Tiers
SELECT 
    p.priority_tier,
    p.priority_level,
    COUNT(*) AS customer_count,
    ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM prioritization_results) * 100.0, 2) AS pct_of_portfolio,
    ROUND(SUM(p.charge_volume_at_risk), 2) AS total_exposure_at_risk,
    ROUND(AVG(p.churn_probability) * 100.0, 2) AS avg_churn_probability_pct,
    ROUND(AVG(p.charge_volume_at_risk), 2) AS avg_exposure_per_sme
FROM prioritization_results p
GROUP BY p.priority_tier, p.priority_level
ORDER BY p.priority_level ASC;
