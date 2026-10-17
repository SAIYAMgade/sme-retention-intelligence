-- Monthly Activity Rollups and Feature Engineering Aggregations
-- Pre-computes monthly SME aggregates for fast analytical querying and snapshotting

CREATE OR REPLACE VIEW view_sme_monthly_rollups AS
SELECT 
    t.sme_id,
    t.month,
    COUNT(t.transaction_id) AS tx_count,
    SUM(CASE WHEN t.status = 'SUCCESS' THEN 1 ELSE 0 END) AS success_tx_count,
    SUM(CASE WHEN t.status = 'FAILED' THEN 1 ELSE 0 END) AS failed_tx_count,
    SUM(CASE WHEN t.status = 'REFUNDED' OR t.transaction_type = 'REFUND' THEN 1 ELSE 0 END) AS refund_tx_count,
    COALESCE(SUM(CASE WHEN t.status = 'SUCCESS' THEN t.amount ELSE 0 END), 0.0) AS successful_charge_volume,
    COALESCE(AVG(CASE WHEN t.status = 'SUCCESS' THEN t.amount ELSE NULL END), 0.0) AS avg_ticket_size,
    COUNT(DISTINCT t.channel) AS active_channels
FROM transactions t
GROUP BY t.sme_id, t.month;

-- Velocity Comparison View (M7-M9 vs M4-M6)
CREATE OR REPLACE VIEW view_velocity_comparison AS
SELECT 
    sme_id,
    SUM(CASE WHEN month IN (4, 5, 6) THEN tx_count ELSE 0 END) AS tx_cnt_m4_m6,
    SUM(CASE WHEN month IN (7, 8, 9) THEN tx_count ELSE 0 END) AS tx_cnt_m7_m9,
    ROUND(SUM(CASE WHEN month IN (4, 5, 6) THEN tx_count ELSE 0 END) / 3.0, 4) AS prior_velocity,
    ROUND(SUM(CASE WHEN month IN (7, 8, 9) THEN tx_count ELSE 0 END) / 3.0, 4) AS recent_velocity,
    ROUND(
        (SUM(CASE WHEN month IN (7, 8, 9) THEN tx_count ELSE 0 END) / 3.0) /
        NULLIF(SUM(CASE WHEN month IN (4, 5, 6) THEN tx_count ELSE 0 END) / 3.0, 0),
        4
    ) AS velocity_change_ratio
FROM view_sme_monthly_rollups
WHERE month <= 9
GROUP BY sme_id;
