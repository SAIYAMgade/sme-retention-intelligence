# THREE-TIER RETENTION PRIORITIZATION FRAMEWORK
**Product:** SME Retention Intelligence

---

## 1. Quantitative Foundation: Charge Volume at Risk

Raw churn probabilities fail to guide operational resources effectively because a 50% churn risk on a $500/month merchant produces $250 in monthly volume exposure, whereas a 25% risk on a $50,000/month merchant produces $12,500 in monthly volume exposure.

### Mathematical Definition
Let:
- $\hat{p}_i = P(\text{Churn}_i = 1 \mid \mathbf{x}_i)$ be the predicted churn probability from the verified Logistic Regression model.
- $V_{i, \text{ref}}$ be the historical monthly reference charge volume, defined as the average monthly successful transaction volume over the 90 days preceding cutoff:
  $$V_{i, \text{ref}} = \frac{\text{Charge Volume Last 90D}}{3.0}$$

The **Expected Monthly Charge Volume at Risk** ($E_i$) is computed as:

$$E_i = \hat{p}_i \times V_{i, \text{ref}}$$

---

## 2. Three-Tier Operational Classification Rules

| Tier | Priority Level | Qualification Criteria | Prescribed Action Plan |
|---|---|---|---|
| **Tier 1 - High Priority** | Level 1 | $\hat{p}_i \ge 0.45$ OR ($\hat{p}_i \ge 0.25$ AND $E_i \ge \$1,500$) | Immediate Merchant Relationship Manager outreach; technical terminal/gateway audit; fee relief review. |
| **Tier 2 - Medium Priority** | Level 2 | $\hat{p}_i \ge 0.25$ OR $E_i \ge \$600$ | 30-day proactive surveillance; automated merchant pulse check; product feature guidance. |
| **Tier 3 - Low Priority** | Level 3 | Remainder ($\hat{p}_i < 0.25$ and $E_i < \$600$) | Standard automated lifecycle communications; regular monthly statements. |

---

## 3. Reason Codes & Behavioral Interpretability

Each prioritized merchant is tagged with deterministic behavioral triggers:
1. `Declining Transaction Velocity`: $V_{\text{recent}} / V_{\text{prior}} < 0.50$ with prior activity $\ge 0.8$.
2. `Extended Inactivity (>45 days)`: Days since last successful transaction exceeds 45 days.
3. `Material Charge Volume Drop`: Recent 90d volume fell by &gt; $500 compared to prior 90d.
4. `Elevated Payment Failures`: Historical failed transaction rate &ge; 8.0%.
5. `High Statistical Churn Risk`: Model churn probability &ge; 50.0%.
6. `Significant Volume Exposure`: Expected charge volume at risk &ge; $1,000.
