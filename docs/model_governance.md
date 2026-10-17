# PREDICTIVE MODEL GOVERNANCE & EVALUATION STANDARDS
**Product:** SME Retention Intelligence

---

## 1. Leakage Prevention Protocol

To ensure true predictive validity and prevent data contamination:
1. **Temporal Horizon Separation:**
   - Features use data from $t \le T_{\text{cutoff}}$ (2023-09-30).
   - Labels observe outcomes in $T_{\text{cutoff}} < t \le T_{\text{end}}$ (2023-10-01 to 2023-12-31).
2. **Preprocessing Isolation:**
   - Median imputers and standard scalers are fitted exclusively on the 75% training split ($N=4,500$).
   - The 25% holdout partition ($N=1,500$) is transformed using training statistics without re-fitting.
3. **Partition Stratification:**
   - Splitting is stratified by the binary churn target to preserve identical event prevalence (~20.5%) across train and holdout splits.

---

## 2. Model Architecture & Selection

### Primary Model: Regularized Logistic Regression
- **Algorithm:** L2-Regularized Logistic Regression (scikit-learn `lbfgs` solver).
- **Inverse Regularization Strength ($C$):** 0.20.
- **Class Weight:** Balanced (adjusting loss function weights inversely proportional to class frequencies).
- **Primary Holdout Evaluation Metric:** Receiver Operating Characteristic Area Under the Curve (ROC-AUC = 0.866 target).
- **Operating Threshold:** Calibrated on validation partition to identify at-risk merchants at 79.1% recall.

### Secondary Model: K-Nearest Neighbors (KNN)
- **Algorithm:** Distance-Weighted KNN (`k=25`, Euclidean metric on standardized features).
- **Purpose:** Non-linear benchmark verifying whether neighborhood-based decision surfaces outperform linear logistic boundaries.
- **Result:** Logistic Regression consistently outperforms KNN on holdout ROC-AUC (0.85+ vs 0.81), confirming that monotonic behavioral signals (recency, velocity drop, failure rate) benefit from linear regularization.

---

## 3. Threshold Calibration for Operational Recall

Unlike academic benchmarks that default to threshold $T = 0.50$, customer retention analytics balances false alarms against missed churners.
- **Operating Threshold:** $T^* = 0.442$.
- **Verified Holdout Recall:** $79.2\%$ of future churners identified at or before Month 9.
- **Precision at $T^*$:** ~45.3% (3.1x higher than baseline random chance).
