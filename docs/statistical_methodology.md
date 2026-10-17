# STATISTICAL METHODOLOGY & HYPOTHESIS TESTING STANDARDS
**Product:** SME Retention Intelligence

---

## 1. Declining Transaction Velocity Finding

### Mathematical Formulation
Let:
- $T_{M4-M6}$ be the count of transactions processed by an SME during Months 4 through 6 (prior historical baseline window).
- $T_{M7-M9}$ be the count of transactions processed during Months 7 through 9 (recent historical window).
- Prior monthly velocity: $V_{\text{prior}} = \frac{T_{M4-M6}}{3.0}$.
- Recent monthly velocity: $V_{\text{recent}} = \frac{T_{M7-M9}}{3.0}$.
- Velocity change ratio: $R_v = \frac{V_{\text{recent}}}{V_{\text{prior}} + 10^{-5}}$.

An account is categorized as exhibiting **Declining Velocity** ($D=1$) if and only if:
1. $V_{\text{prior}} \ge 0.8$ (minimum prior activity threshold to rule out zero-denominator instability).
2. $R_v < 0.50$ (a 50% or greater contraction in monthly transaction frequency).

### Risk Ratio (Relative Risk)
The Risk Ratio ($RR$) compares empirical churn incidence between declining and non-declining accounts:

$$RR = \frac{P(\text{Churn} = 1 \mid D = 1)}{P(\text{Churn} = 1 \mid D = 0)} = \frac{a / (a + b)}{c / (c + d)}$$

Where:
- $a$: Churned SMEs with declining velocity
- $b$: Retained SMEs with declining velocity
- $c$: Churned SMEs without declining velocity
- $d$: Retained SMEs without declining velocity

### Confidence Interval (Katz Logarithmic Method)
The standard error of the natural logarithm of the Risk Ratio is computed as:

$$SE(\ln RR) = \sqrt{\frac{1}{a} - \frac{1}{a+b} + \frac{1}{c} - \frac{1}{c+d}}$$

The 95% Confidence Interval is given by:

$$CI_{95\%} = \exp\left( \ln RR \pm 1.96 \times SE(\ln RR) \right)$$

### Statistical Hypothesis Test
A Pearson's Chi-Square Test of Independence with 1 degree of freedom tests the null hypothesis $H_0: RR = 1.0$.

$$\chi^2 = \sum \frac{(O_{ij} - E_{ij})^2}{E_{ij}}$$

Empirical result: $\chi^2 > 400$, $p < 0.0001$, firmly satisfying the resume standard ($p < 0.001$).

---

## 2. Welch's Independent Samples t-Test for Continuous Features

For each continuous behavioral feature $X_k$, we test the difference in population means between churned ($C$) and retained ($R$) SMEs without assuming equal variances:

$$t = \frac{\bar{X}_C - \bar{X}_R}{\sqrt{\frac{s_C^2}{n_C} + \frac{s_R^2}{n_R}}}$$

The degrees of freedom $\nu$ are approximated using the Welch–Satterthwaite equation:

$$\nu \approx \frac{\left(\frac{s_C^2}{n_C} + \frac{s_R^2}{n_R}\right)^2}{\frac{(s_C^2 / n_C)^2}{n_C - 1} + \frac{(s_R^2 / n_R)^2}{n_R - 1}}$$

### False Discovery Rate (Benjamini-Hochberg Procedure)
Because 44 features are evaluated simultaneously, raw p-values are adjusted to maintain an overall False Discovery Rate $\alpha = 0.05$:

$$P_{(i)} \le \frac{i}{m} Q$$

Where $m=44$, $P_{(i)}$ is the ranked p-value, and $Q=0.05$.
