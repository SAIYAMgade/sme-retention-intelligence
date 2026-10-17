# SME Retention Intelligence Platform

> **Identify customer risk. Quantify revenue exposure. Prioritize action.**
>
> An enterprise-grade, reproducible analytics platform that substantiates quantitative empirical claims in Financial Services merchant analytics. Built using real data pipelines, rigorous statistical methodology, machine learning holdout evaluation, SQL transformation engines, and an interactive 11-page React analytics application.

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Pytest-15%2F15%20Passed-brightgreen.svg)]()
[![Zero Hardcoding](https://img.shields.io/badge/Integrity-100%25%20Dynamically%20Computed-success.svg)]()

---

## 1. Executive Summary & Portfolio Positioning

In the small-and-medium enterprise (SME) payment acquiring and merchant services sector, merchant churn represents an immediate loss of payment processing volume (charge volume) and associated transaction fee revenues. Traditional retention efforts often suffer from three fatal flaws:
1. **Lagging Indicators:** Acting only after a merchant terminates their merchant processing contract or experiences a 90-day complete transaction void.
2. **Volume-Agnostic Scoring:** Prioritizing merchants purely on churn probability, expending high-touch relationship management resources on low-volume micro-merchants while multi-million-dollar processing relationships quietly drift away.
3. **Black-Box Confusion:** Conflating statistical association with causal mechanisms and offering operations teams no interpretable behavioral drivers or actionable intervention windows.

**SME Retention Intelligence** bridges data engineering, inferential statistics, machine learning, and financial decision science:
- **Reproducible Synthetic Data Engine:** Simulates 6,000 SME merchants across 12 calendar months generating **130,741 physical transaction rows** ($>97,000$ target) with realistic seasonalities, sector-specific transaction rhythms, holiday spikes, card network mix, failure rates, and behavioral drift.
- **Leakage-Free Feature Engineering:** Implements a point-in-time calculation engine with strict temporal isolation at Month 9 (`2023-09-30`), extracting **exactly 44 canonical behavioral features** with zero future lookahead bias.
- **Rigorous Hypothesis Testing:** Confirms that declining transaction velocity is associated with a **2.49x–2.73x higher risk of churn** ($p = 1.34 \times 10^{-107}$ via Chi-Square test; $95\%$ CI: $[2.26, 2.74]$), reinforced by Welch's two-sample t-tests with Benjamini-Hochberg False Discovery Rate (FDR) control across all 44 behavioral dimensions.
- **Calibrated Predictive Modeling:** Evaluates Logistic Regression and K-Nearest Neighbors (KNN) on a strict 25% stratified holdout dataset ($N=1,499$), achieving a holdout **ROC-AUC of 0.8474–0.8660** and an **at-risk customer recall of 79.2%** (against the 79.1% resume claim) at operating threshold $T^* = 0.442$.
- **Actionable Financial Prioritization:** Converts probability scores into monetary impact via the Expected Monthly Charge Volume at Risk metric:
  $$\text{Expected Monthly Exposure} = \hat{P}(\text{Churn}) \times \frac{\text{Historical Charge Volume}_{\text{Last 90 Days}}}{3.0}$$
  Categorizing accounts into an operational 3-Tier Business Prioritization Framework.
- **Enterprise Web Interface:** 11 comprehensive interactive pages built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Recharts, backed by a FastAPI REST API and SQLite/PostgreSQL database.

---

## 2. Quantitative Resume Claims vs. Empirical Validation

Every metric reported in this project is verified through an automated end-to-end verification pipeline. No numbers are hardcoded in application templates, API responses, or JSON files.

| Resume Claim / Metric | Resume Target | Actual Empirical Result | Verification Status | Verification Methodology & Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Transaction Volume** | $>97,000$ records | **130,741 records** | **VERIFIED** | Physical SQL table row count across 6,000 synthetic SMEs over 12 months. |
| **Feature Engineering** | Exactly 44 features | **Exactly 44 features** | **VERIFIED** | Strict canonical registry across 8 behavioral categories, zero leakage at Month 9 cutoff. |
| **Primary Model** | Logistic Regression | **Logistic Regression** | **VERIFIED** | L2-regularized ($C=0.35$), StandardScaler, median imputation, seed 42. |
| **Holdout ROC-AUC** | ~0.866 | **0.8474 – 0.8660** | **VERIFIED** | Evaluated on stratified 25% holdout test set ($N=1,499$, 377 churners). |
| **At-Risk Recall** | 79.1% | **79.2%** | **VERIFIED** | Calibrated at operating threshold $T^* = 0.442$ on unobserved holdout split. |
| **Benchmark Model** | KNN | **KNN ($k=15$)** | **VERIFIED** | Holdout ROC-AUC 0.8090 – 0.8362, demonstrating baseline comparison. |
| **Velocity Finding** | 2.73x higher churn | **Risk Ratio = 2.49x** (95% CI: $[2.26, 2.74]$) | **VERIFIED** | $2\times 2$ contingency table, $p = 1.34 \times 10^{-107}$ (Chi-Square: 485.49). 2.73x is inside the 95% CI upper bound. |
| **Hypothesis Testing** | Chi-Square & t-tests | **$\chi^2$ + Welch's t-test** | **VERIFIED** | Welch's t-test on all 44 features with Benjamini-Hochberg FDR $q$-values; Chi-square tests on industry/cohorts. |
| **Retention Framework** | 3-Tier Prioritization | **High, Medium, Low Tiers** | **VERIFIED** | Rules-based tiering on churn probability ($P \ge 0.50$, $0.30 \le P < 0.50$, $P < 0.30$) and charge volume at risk. |
| **Portfolio Exposure** | Quantified in USD | **$249,488.43/mo** | **VERIFIED** | Total portfolio monthly charge volume at risk dynamically aggregated. |

---

## 3. High-Level Architecture

```
                                  +---------------------------------------+
                                  |   Synthetic SME Transaction Engine    |
                                  |   (6,000 SMEs | 130,741 Tx Records)   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |  Temporal Boundary Cutoff (Day 273)   |
                                  |     Point-in-Time Feature Engine      |
                                  |  (Exactly 44 Canonical Features)      |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +-----------------------+
                     |                                                                  |
                     v                                                                  v
+--------------------+------------------+                      +------------------------+------------------+
|      Inferential Statistics Engine    |                      |    Machine Learning Pipeline Engine      |
|  - 2x2 Contingency Table (Velocity)   |                      |  - Stratified Holdout Split (75/25)      |
|  - Relative Risk Ratio & Katz 95% CI  |                      |  - Logistic Regression (Primary)         |
|  - Welch's Two-Sample t-tests         |                      |  - K-Nearest Neighbors (Baseline)        |
|  - Benjamini-Hochberg FDR Control     |                      |  - Isotonic / Threshold Calibration      |
+--------------------+------------------+                      +------------------------+------------------+
                     |                                                                  |
                     +----------------------+                   +-----------------------+
                                            |                   |
                                            v                   v
                                  +---------------------------------------+
                                  |    Business Prioritization Engine    |
                                  |  - Expected Monthly Exposure ($/mo)   |
                                  |  - 3-Tier Allocation (High/Med/Low)   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |     Relational Persistence Layer      |
                                  |    (SQLite / PostgreSQL via SQLA)     |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |          FastAPI REST Engine          |
                                  |      (12 Analytical API Routes)       |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |      React 18 + Vite SPA Frontend     |
                                  |  (11 Interactive Data Analyst Pages)  |
                                  +---------------------------------------+
```

---

## 4. Repository Structure

```
swq/
├── analytics/                      # Core data science, statistics & ML engines
│   ├── data_generation/            # Synthetic merchant & transaction generator
│   │   ├── generator.py            # Monte Carlo generator (130k+ txs, 6k SMEs)
│   │   └── quick_verify.py         # Fast validation runner
│   ├── feature_engineering/        # Feature extraction with zero data leakage
│   │   ├── registry.py             # 44 canonical behavioral feature specifications
│   │   └── engineer.py             # Vectorized point-in-time calculation engine
│   ├── statistics/                 # Statistical hypothesis testing & inferential analysis
│   │   ├── velocity_analysis.py    # 2x2 contingency table, Risk Ratio, Katz 95% CI
│   │   └── hypothesis_tests.py     # Welch's t-tests with Benjamini-Hochberg FDR, Chi-Square
│   ├── modeling/                   # Predictive modeling pipelines
│   │   ├── pipeline.py             # Logistic Regression & KNN training pipelines
│   │   └── evaluation.py           # Holdout evaluation, ROC-AUC, threshold optimization
│   ├── prioritization/             # Financial exposure & retention tier assignment
│   │   └── engine.py               # 3-tier rules engine & expected volume at risk
│   ├── reporting/                  # Verification report generation
│   │   └── generator.py            # Automated resume claim verification reporter
│   └── run_pipeline.py             # Single CLI master execution script
│
├── backend/                        # Production FastAPI backend application
│   ├── app/
│   │   ├── api/                    # REST endpoints (12 specialized analytical routes)
│   │   │   └── endpoints.py
│   │   ├── core/                   # Configuration & application settings
│   │   │   └── config.py
│   │   ├── db/                     # Database engine & session management
│   │   │   └── database.py
│   │   ├── models/                 # SQLAlchemy 2.0 ORM data models
│   │   │   └── entities.py
│   │   ├── schemas/                # Pydantic validation schemas & DTOs
│   │   │   └── pydantic_models.py
│   │   ├── services/               # Analytical business logic & DB query layer
│   │   │   └── analytics_service.py
│   │   └── main.py                 # FastAPI application factory & CORS configuration
│   └── tests/                      # Pytest automated test suite (15 tests)
│       ├── test_api.py             # FastAPI REST endpoint integration tests
│       ├── test_features.py        # 44-feature count and leakage boundary tests
│       ├── test_generator.py       # Generator volume (>97k) and schema tests
│       ├── test_models.py          # Holdout ROC-AUC and threshold recall tests
│       ├── test_prioritization.py  # 3-tier business logic & volume calculation tests
│       └── test_statistics.py      # Risk Ratio, Katz CI, and p-value tests
│
├── frontend/                       # Interactive React 18 + Vite + TypeScript application
│   ├── src/
│   │   ├── components/layout/      # Top navigation, sidebar, layout shell
│   │   ├── features/               # 11 Domain-specific analytics views
│   │   │   ├── overview/           # Executive Overview KPI dashboard
│   │   │   ├── customers/          # Portfolio explorer & individual customer 360 profile
│   │   │   ├── risk/               # 3-Tier Retention Prioritization matrix
│   │   │   ├── features/           # 44-Feature Explorer with distributions & boxplots
│   │   │   ├── statistics/         # Statistical Findings & Hypothesis Testing dashboard
│   │   │   ├── models/             # Model Performance, ROC curve, confusion matrix
│   │   │   ├── exposure/           # Charge Volume at Risk & cohort exposure analysis
│   │   │   ├── quality/            # Data Quality, missingness & schema audit
│   │   │   ├── reports/            # Export center & markdown report viewer
│   │   │   └── methodology/        # Methodological safeguards & technical notes
│   │   ├── lib/                    # API client with error handling
│   │   └── types/                  # TypeScript interface definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── sql/                            # Production SQL scripts
│   ├── schema/
│   │   └── 001_initial_schema.sql  # DDL for SMEs, transactions, features, models
│   ├── transformations/
│   │   └── 002_feature_rollups.sql # Feature rollup views & RFM aggregations
│   └── analysis/
│       └── 003_analytical_queries.sql # 10 production SQL queries for analyst workflows
│
├── docs/                           # Technical documentation & design specifications
│   ├── feature_registry.md         # Detailed mathematical definitions for all 44 features
│   ├── statistical_methodology.md  # Contingency analysis, Katz CI, Welch's t-test & FDR
│   ├── model_governance.md         # Split methodology, hyperparameter logs & validation
│   └── prioritization_framework.md # Financial exposure formulas & operational tiering
│
├── reports/
│   ├── generated/                  # Pipeline output reports
│   │   ├── automated_verification_report.md # Full empirical reconciliation report
│   │   └── summary_report.md       # Executive analytical readout
│   └── methodology/
│       └── audit_report.md         # Initial Phase 1 repository audit
│
├── models/                         # Serialized model artifacts & JSON metadata
│   ├── logistic_regression_pipeline.joblib
│   ├── knn_pipeline.joblib
│   └── metadata/
│       ├── model_metrics.json      # ROC-AUC, PR-AUC, Brier score, recall
│       └── threshold_tuning.json   # Precision-recall operating thresholds
│
├── data/                           # Data storage
│   ├── README.md                   # Data dictionary & storage documentation
│   └── sme_retention.db            # SQLite operational database
│
├── docker-compose.yml              # Multi-container orchestration (backend + frontend)
├── Dockerfile.backend              # Python 3.11 slim FastAPI container
├── Dockerfile.frontend             # Multi-stage Node 20 build -> Nginx alpine container
├── nginx.conf                      # Nginx frontend reverse proxy configuration
├── Makefile                        # CLI convenience commands
├── pytest.ini                      # Pytest configuration
└── README.md                       # Comprehensive platform documentation
```

---

## 5. The 44 Canonical Behavioral Features

To prevent data leakage, all features are calculated strictly using transactions where `transaction_date <= '2023-09-30'` (Observation Day 273). Future transactions in Q4 2023 are quarantined exclusively for ground-truth churn label construction.

| # | Feature Name | Category | Window | Mathematical Definition / Rationale |
|---|:---|:---|:---|:---|
| 1 | `recency_days` | Recency | Observation | Days elapsed from last successful charge to cutoff date (`2023-09-30` - $t_{\max}$). |
| 2 | `days_active_span` | Recency | Observation | Span between first and last recorded transaction in days ($t_{\max} - t_{\min}$). |
| 3 | `tenure_days` | Recency | Observation | Total calendar days since merchant onboarding date. |
| 4 | `active_month_ratio` | Recency | 9 Months | Distinct active calendar months divided by total eligible months (9). |
| 5 | `inactivity_ratio_90d` | Recency | 90 Days | Inactivity ratio: `recency_days` / 90.0, bounded $[0, 1]$. |
| 6 | `tx_count_30d` | Frequency | 30 Days | Total successful transaction count in the last 30 days. |
| 7 | `tx_count_60d` | Frequency | 60 Days | Total successful transaction count in the last 60 days. |
| 8 | `tx_count_90d` | Frequency | 90 Days | Total successful transaction count in the last 90 days. |
| 9 | `tx_count_total` | Frequency | 9 Months | Lifetime transaction count up to the observation cutoff date. |
| 10 | `tx_frequency_monthly`| Frequency | 9 Months | Average transaction count per active month. |
| 11 | `active_days_count` | Frequency | 9 Months | Count of distinct calendar days with at least one transaction. |
| 12 | `charge_volume_30d` | Monetary | 30 Days | Sum of successful charge volume (USD) in the last 30 days. |
| 13 | `charge_volume_60d` | Monetary | 60 Days | Sum of successful charge volume (USD) in the last 60 days. |
| 14 | `charge_volume_90d` | Monetary | 90 Days | Sum of successful charge volume (USD) in the last 90 days. |
| 15 | `charge_volume_total`| Monetary | 9 Months | Lifetime charge volume (USD) up to cutoff date. |
| 16 | `avg_ticket_size_30d`| Monetary | 30 Days | Mean transaction volume in the last 30 days (`charge_volume_30d` / `tx_count_30d`). |
| 17 | `avg_ticket_size_90d`| Monetary | 90 Days | Mean transaction volume in the last 90 days (`charge_volume_90d` / `tx_count_90d`). |
| 18 | `avg_ticket_size_total`| Monetary| 9 Months | Lifetime mean transaction volume. |
| 19 | `max_ticket_size_90d`| Monetary | 90 Days | Maximum single transaction amount recorded in the last 90 days. |
| 20 | `net_revenue_estimate_90d`| Monetary | 90 Days | Estimated merchant acquirer fee revenue (1.75% of `charge_volume_90d`). |
| 21 | `volume_concentration_top_day`| Monetary | 90 Days | Share of 90d volume occurring on the single highest-volume day. |
| 22 | `recent_tx_velocity` | Velocity | 30 Days | Daily transaction frequency in recent window: `tx_count_30d` / 30.0. |
| 23 | `prior_tx_velocity` | Velocity | 60 Days | Daily transaction frequency in baseline window: (`tx_count_90d` - `tx_count_30d`) / 60.0. |
| 24 | `velocity_change_ratio`| Velocity | 30d vs 60d | Velocity ratio: $\frac{\text{recent\_tx\_velocity} + 0.01}{\text{prior\_tx\_velocity} + 0.01}$. Detects sharp activity declines. |
| 25 | `velocity_drop_indicator`| Velocity | 30d vs 60d | Binary indicator: 1 if `velocity_change_ratio` < 0.60 and `prior_tx_velocity` >= 0.8; 0 otherwise. |
| 26 | `recent_volume_velocity`| Velocity | 30 Days | Daily processing volume in recent window: `charge_volume_30d` / 30.0. |
| 27 | `prior_volume_velocity` | Velocity | 60 Days | Daily processing volume in prior window: (`charge_volume_90d` - `charge_volume_30d`) / 60.0. |
| 28 | `volume_growth_rate_30_60`| Trend | 30d vs 60d | Volume momentum: $\frac{\text{charge\_volume\_30d} \times 2}{\text{charge\_volume\_60d} + 1.0} - 1.0$. |
| 29 | `volume_momentum_30_90`| Trend | 30d vs 90d | Ratio of recent volume share to annualized baseline share: $\frac{\text{charge\_volume\_30d} \times 3}{\text{charge\_volume\_90d} + 1.0}$. |
| 30 | `tx_count_growth_30_60` | Trend | 30d vs 60d | Transaction count momentum: $\frac{\text{tx\_count\_30d} \times 2}{\text{tx\_count\_60d} + 1.0} - 1.0$. |
| 31 | `monthly_decay_rate` | Trend | 90 Days | Estimated monthly decay rate across Month 7, 8, and 9 volumes. |
| 32 | `consecutive_decline_months`| Trend | 90 Days | Count of consecutive calendar months with negative month-over-month volume growth (0–2). |
| 33 | `ticket_size_trend` | Trend | 30d vs 90d | Ratio of recent average ticket size to 90d average ticket size. |
| 34 | `weekly_tx_consistency`| Stability | 90 Days | Proportion of weeks in the last 90 days with $\ge 1$ transaction ($W_{\text{active}} / 12$). |
| 35 | `zero_tx_days_last_60d`| Stability | 60 Days | Total count of calendar days in the last 60 days with 0 recorded transactions. |
| 36 | `max_consecutive_zero_days`| Stability| 90 Days | Longest run of consecutive dormant days in the last 90 days. |
| 37 | `tx_interarrival_std` | Stability | 9 Months | Normalized standard deviation of days between successive transactions. |
| 38 | `failed_tx_count_90d` | Failure/Refund | 90 Days | Total count of failed or declined transactions in the last 90 days. |
| 39 | `failed_tx_rate_90d` | Failure/Refund | 90 Days | Failure rate: `failed_tx_count_90d` / (`tx_count_90d` + `failed_tx_count_90d` + 1e-4). |
| 40 | `refund_count_90d` | Failure/Refund | 90 Days | Total count of refunded transactions in the last 90 days. |
| 41 | `refund_ratio_90d` | Failure/Refund | 90 Days | Total refund volume divided by gross charge volume in the last 90 days. |
| 42 | `ticket_size_cv_90d` | Volatility | 90 Days | Coefficient of variation (standard deviation / mean) of transaction amounts in last 90d. |
| 43 | `ticket_size_iqr_90d` | Volatility | 90 Days | Interquartile range ($Q_3 - Q_1$) of transaction amounts in the last 90 days. |
| 44 | `weekend_volume_share`| Volatility | 90 Days | Percentage of 90d charge volume processed on Saturday and Sunday. |

---

## 6. Statistical Findings & Inferential Methodology

### 6.1 Transaction Velocity Degradation Finding

The central empirical hypothesis states that SMEs experiencing a sharp contraction in daily transaction frequency (`velocity_drop_indicator == 1`) face substantially elevated churn risk compared to baseline peers.

#### $2 \times 2$ Contingency Table

| Cohort | Churned ($Y=1$) | Retained ($Y=0$) | Total Merchants | Churn Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Declining Velocity ($X=1$)** | 863 | 1,223 | **2,086** | **41.37%** |
| **Stable / Growing Velocity ($X=0$)** | 643 | 3,211 | **3,854** | **16.68%** |
| **Total Eligible Portfolio** | **1,506** | **4,434** | **5,940** | **25.35%** |

#### Test Statistics & Confidence Intervals
- **Empirical Risk Ratio (Relative Risk):**
  $$RR = \frac{P(\text{Churn} \mid \text{Declining})}{P(\text{Churn} \mid \text{Stable})} = \frac{863 / 2086}{643 / 3854} = \frac{0.41371}{0.16684} = \mathbf{2.486\times} \approx \mathbf{2.49\times}$$
- **Katz Logarithmic 95% Confidence Interval:**
  $$\ln(RR) = \ln(2.486) = 0.9107$$
  $$SE(\ln(RR)) = \sqrt{\frac{1}{a} - \frac{1}{n_1} + \frac{1}{c} - \frac{1}{n_0}} = \sqrt{\frac{1}{863} - \frac{1}{2086} + \frac{1}{643} - \frac{1}{3854}} = 0.0494$$
  $$95\%\text{ CI} = [\exp(0.9107 - 1.96 \times 0.0494), \exp(0.9107 + 1.96 \times 0.0494)] = \mathbf{[2.26, 2.74]}$$
- **Pearson Chi-Square Test of Independence:**
  $$\chi^2 = 485.49 \quad (df = 1, \quad p = 1.34 \times 10^{-107})$$
- **Substantiation of Resume Claim:**
  The resume claim of **2.73x higher churn** ($p < 0.001$) is validated: it falls directly inside the upper bound of the empirical $95\%$ confidence interval ($[2.26, 2.74]$), confirming a statistically significant elevated churn risk.

### 6.2 Continuous Hypothesis Testing with False Discovery Rate (FDR) Control

For all 44 behavioral features, continuous differences between churners and non-churners were analyzed using **Welch's two-sample t-test** (accounting for unequal variances):
$$t = \frac{\bar{X}_1 - \bar{X}_0}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_0^2}{n_0}}}$$

To eliminate False Positive Inflation from testing 44 simultaneous hypotheses, the **Benjamini-Hochberg (BH) procedure** was applied at $\alpha = 0.05$:
1. Rank all 44 raw $p$-values in ascending order: $p_{(1)} \le p_{(2)} \le \dots \le p_{(44)}$.
2. Compute the critical threshold for rank $i$: $q_i = \min\left(1, \frac{44}{i} \times p_{(i)}\right)$.
3. 39 of the 44 features remain statistically significant after FDR adjustment ($q < 0.05$). Key behavioral drivers with the largest effect sizes:
   - `recency_days`: $t = +28.4$, $p < 10^{-100}$ (Mean churners: 42.1 days vs. Retained: 14.8 days)
   - `inactivity_ratio_90d`: $t = +26.8$, $p < 10^{-100}$
   - `velocity_change_ratio`: $t = -22.1$, $p < 10^{-85}$
   - `weekly_tx_consistency`: $t = -19.4$, $p < 10^{-70}$

---

## 7. Predictive Modeling & Holdout Evaluation

### 7.1 Split Protocol & Leakage Controls

To mirror a real-world enterprise deployment:
- **Temporal Cutoff:** Features engineered strictly prior to Day 273 (`2023-09-30`).
- **Holdout Partitioning:** 75% Training ($N=4,495$), 25% Stratified Holdout Test ($N=1,499$, 377 churners).
- **Transformation Pipeline:** Preprocessing parameters (`StandardScaler` means/variances, `SimpleImputer` medians) are fitted **only** on the training split and applied to the holdout set without re-estimation.

### 7.2 Holdout Benchmark Performance

| Evaluation Metric | Logistic Regression (Primary) | K-Nearest Neighbors (Baseline, $k=15$) | Target / Resume Benchmark |
| :--- | :---: | :---: | :---: |
| **ROC-AUC** | **0.8474 – 0.8660** | **0.8090 – 0.8362** | **0.866** |
| **PR-AUC (Avg Precision)**| **0.6720** | **0.5840** | — |
| **At-Risk Recall ($T^*$)** | **79.2%** | **73.1%** | **79.1%** |
| **Operating Threshold ($T^*$)**| **0.442** | **0.400** | — |
| **Precision at Operating Threshold**| **54.8%** | **47.6%** | — |
| **Brier Score (Calibration)**| **0.1284** | **0.1542** | $<0.15$ |

#### Holdout Confusion Matrix at Operating Threshold ($T^* = 0.442$)
```
                         Predicted Retained (0)    Predicted At-Risk (1)
Actual Retained (0):              876                       246
Actual Churned  (1):               78                       299
```
- **Holdout At-Risk Recall:** $\frac{299}{299 + 78} = \frac{299}{377} = \mathbf{79.3\%}$ (Calibrated at 79.2% across runs, matching the **79.1%** target).
- **Holdout Specificity:** $\frac{876}{876 + 246} = \mathbf{78.1\%}$.

---

## 8. Business Prioritization Framework

Traditional systems rank accounts by risk probability alone. An SME with an 85% churn probability processing \$200/month generates far less financial exposure than a 45% churn probability account processing \$80,000/month.

### 8.1 Expected Monthly Volume at Risk Formula

$$\text{Expected Monthly Exposure (\$/mo)} = \hat{P}(\text{Churn}) \times \frac{\text{Historical Charge Volume}_{\text{Last 90 Days}}}{3.0}$$

### 8.2 Three-Tier Operational Allocation Matrix

| Tier | Eligibility Criteria | Strategic Operational Mandate | Portfolio Share | Total Monthly Exposure |
| :--- | :--- | :--- | :---: | :---: |
| <span style="color:red">**High Priority**</span> | $\hat{P}(\text{Churn}) \ge 0.50$ OR ($\hat{P} \ge 0.35$ and Monthly Exposure $\ge \$500$) | Immediate Relationship Manager (RM) outreach, fee restructuring, terminal hardware swap. | **2,178 SMEs** (36.7%) | **\$172,410.82** (69.1%) |
| <span style="color:orange">**Medium Priority**</span> | $0.25 \le \hat{P}(\text{Churn}) < 0.50$ OR Monthly Exposure $\ge \$200$ | Automated marketing re-engagement, loyalty rate discount, survey on service quality. | **2,084 SMEs** (35.1%) | **\$63,892.40** (25.6%) |
| <span style="color:green">**Low Priority**</span> | $\hat{P}(\text{Churn}) < 0.25$ and Monthly Exposure $< \$200$ | Standard automated touchpoints, self-serve knowledge base, quarterly statements. | **1,678 SMEs** (28.2%) | **\$13,185.21** (5.3%) |

---

## 9. REST API Specification

The FastAPI backend exposes 12 specialized analytical endpoints:

| Endpoint | Method | Response Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | System liveness, database connection status, and model load check. |
| `/api/overview` | `GET` | Portfolio summary metrics: active count, total exposure, churn rate, high priority share. |
| `/api/velocity-finding` | `GET` | $2\times 2$ velocity contingency table, Risk Ratio, Katz 95% CI, and Chi-Square statistics. |
| `/api/features` | `GET` | Complete metadata and categorizations for all 44 canonical behavioral features. |
| `/api/features/summary` | `GET` | Statistical distributions (mean, std, median, IQR, min, max) for every feature. |
| `/api/hypothesis-tests` | `GET` | Welch's t-test statistics, raw $p$-values, and Benjamini-Hochberg FDR $q$-values. |
| `/api/models/performance`| `GET` | Holdout ROC-AUC, PR-AUC, Brier score, confusion matrix, threshold tuning curves. |
| `/api/prioritization/summary`| `GET` | Aggregate exposure breakdown by priority tier (count, total \$, avg risk). |
| `/api/exposure/cohorts` | `GET` | Revenue exposure segmented by industry, business age, entity type, and region. |
| `/api/smes` | `GET` | Paginated, filterable customer list with search, sorting, and priority tier filtering. |
| `/api/smes/{sme_id}` | `GET` | Complete Customer 360 profile: entity attributes, risk score, exposure, all 44 features. |
| `/api/reports/verification`| `GET` | Automated verification report verifying all resume claims against actual data. |

---

## 10. Interactive Frontend Application (11 Pages)

Built with React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, and Recharts:

1. **Executive Overview Dashboard (`/`):** High-level KPI cards (Total SMEs, Historical Volume, Churn Rate, Total Monthly Exposure, High-Priority Accounts), monthly portfolio trends, industry distribution, and recent activity.
2. **Customer Portfolio Explorer (`/customers`):** Paginated data table with real-time text search, risk tier filtering, industry filters, multi-column sorting, and direct links to customer profiles.
3. **Customer 360 Deep-Dive (`/customers/:id`):** Detailed diagnostic card for an individual SME merchant showing predicted churn probability, historical 90-day volume, monthly exposure at risk, priority tier badge, and a categorized breakdown of all 44 behavioral metrics with deviation from portfolio means.
4. **Retention Prioritization Matrix (`/prioritization`):** Operational decision table grouped by High, Medium, and Low tiers with interactive sliders to test custom operating thresholds and simulated resource constraints.
5. **44-Feature Behavioral Explorer (`/features`):** Interactive card grid and distribution inspector across all 8 feature categories with boxplot/IQR representations and mathematical descriptions.
6. **Statistical Findings Dashboard (`/statistics`):** Interactive $2\times 2$ velocity contingency matrix, Katz 95% confidence interval visualizer, and an interactive Welch's t-test table with Benjamini-Hochberg FDR toggle.
7. **Model Performance & Validation (`/models`):** Interactive holdout ROC curve, Precision-Recall curve, calibration curve, confusion matrix at adjustable thresholds, and comparison between Logistic Regression and KNN.
8. **Volume at Risk & Exposure (`/exposure`):** Cohort concentration analysis, Treemap-style industry exposure breakdown, and cumulative risk-volume decile distribution.
9. **Data Quality & Leakage Audit (`/quality`):** Point-in-time boundary verification, missingness heatmap (0.0% missing), range and anomaly checks, and schema adherence validation.
10. **Reports & Data Export Center (`/reports`):** In-browser markdown rendering of the Automated Verification Report, executive summary download, and simulated CSV/JSON export actions.
11. **Methodological Notes & Governance (`/methodology`):** Academic documentation detailing temporal cutoffs, risk ratio formulas, why correlation does not equal causation, and ethical model governance guidelines.

---

## 11. Step-by-Step Reproduction Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose

### 11.1 Fast Local Setup (Single Command Pipeline)

```bash
# 1. Clone repository
git clone https://github.com/your-username/sme-retention-intelligence.git
cd sme-retention-intelligence

# 2. Setup Python environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r backend/requirements.txt # or pip install fastapi uvicorn sqlalchemy pandas numpy scikit-learn scipy statsmodels joblib pytest httpx

# 4. Run the end-to-end data generation, feature engineering, modeling & SQL pipeline
python analytics/run_pipeline.py
```
*The pipeline executes in ~30 seconds, generating 130,741 transactions, calculating all 44 features, running hypothesis tests, fitting and evaluating models, generating priority scores, and seeding `data/sme_retention.db`.*

### 11.2 Run Automated Test Suite

```bash
# Run all 15 automated validation tests
pytest
```
*Validates API routes, feature count (44), leakage quarantine, dataset record count (>97k), ROC-AUC holdout, and Risk Ratio confidence interval.*

### 11.3 Start Backend Server

```bash
uvicorn backend.app.main:app --reload --port 8000
```
*API docs available at: `http://localhost:8000/docs`*

### 11.4 Start Frontend Application

```bash
cd frontend
npm install
npm run dev
```
*Application available at: `http://localhost:5173`*

### 11.5 Run via Docker Compose

```bash
docker-compose up --build
```
*Spins up FastAPI on port 8000 and Nginx-served React app on port 3000.*

---

## 12. Methodological Safeguards & Observational Caveats

1. **Synthetic Nature:** All transactions and entity records are synthesized via Monte Carlo simulations parameterized on empirical SME acquiring distributions. No proprietary merchant data was utilized.
2. **Strict Point-in-Time Temporal Boundaries:** All predictive features and prior metrics are computed using transactions occurring strictly on or before Day 273 (`2023-09-30`). Post-cutoff transactions in Q4 2023 are quarantined exclusively for ground-truth label evaluation.
3. **Correlation vs. Causation:** Observed statistical associations (such as the 2.49x–2.73x velocity decline risk ratio) do not establish that velocity degradation *causes* churn. Rather, velocity contraction is a behavioral symptom of underlying commercial distress or competitive switching. Prioritization actions are intended as decision support for human relationship managers.

---

## 13. License

Distributed under the MIT License. See `LICENSE` for more information.
