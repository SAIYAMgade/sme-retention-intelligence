"""
Predictive Modeling Pipeline for SME Customer Retention Analytics.
Implements scikit-learn Pipelines for:
1. Primary Model: Regularized Logistic Regression (target holdout ROC-AUC = 0.866).
2. Comparison Model: K-Nearest Neighbors (KNN).
Guarantees absolute leakage prevention:
- All scalers and imputers fitted strictly on training data.
- Stratified 75/25 train/holdout split.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

from analytics.feature_engineering.registry import FEATURE_NAMES

def train_retention_models(
    features_df: pd.DataFrame,
    labels_df: pd.DataFrame,
    artifacts_dir: str = "models",
    test_size: float = 0.25,
    random_seed: int = 42
) -> Dict[str, Any]:
    """
    Trains Logistic Regression and KNN pipelines on eligible SMEs.
    Persists trained model artifacts and returns dataset split metadata and predictions.
    """
    os.makedirs(artifacts_dir, exist_ok=True)
    os.makedirs(os.path.join(artifacts_dir, "metadata"), exist_ok=True)
    
    merged = features_df.merge(labels_df[['sme_id', 'churn', 'is_eligible']], on='sme_id')
    eligible = merged[merged['is_eligible']].copy().reset_index(drop=True)
    
    X = eligible[FEATURE_NAMES]
    y = eligible['churn']
    sme_ids = eligible['sme_id']
    
    # Stratified Train/Holdout split
    X_train, X_holdout, y_train, y_holdout, ids_train, ids_holdout = train_test_split(
        X, y, sme_ids, test_size=test_size, random_state=random_seed, stratify=y
    )
    
    # -------------------------------------------------------------
    # 1. Primary Model: Regularized Logistic Regression
    # -------------------------------------------------------------
    lr_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('classifier', LogisticRegression(
            C=0.20,
            max_iter=1000,
            class_weight='balanced',
            random_state=random_seed,
            solver='lbfgs'
        ))
    ])
    lr_pipeline.fit(X_train, y_train)
    
    # -------------------------------------------------------------
    # 2. Secondary Model: K-Nearest Neighbors (KNN)
    # -------------------------------------------------------------
    knn_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('classifier', KNeighborsClassifier(
            n_neighbors=25,
            weights='distance',
            metric='euclidean'
        ))
    ])
    knn_pipeline.fit(X_train, y_train)
    
    # Persist model artifacts
    lr_path = os.path.join(artifacts_dir, "logistic_regression.joblib")
    knn_path = os.path.join(artifacts_dir, "k_nearest_neighbors.joblib")
    joblib.dump(lr_pipeline, lr_path)
    joblib.dump(knn_pipeline, knn_path)
    
    # Predict on entire eligible population (with out-of-fold indicator)
    lr_all_probs = lr_pipeline.predict_proba(X)[:, 1]
    knn_all_probs = knn_pipeline.predict_proba(X)[:, 1]
    
    scores_df = eligible[['sme_id', 'churn']].copy()
    scores_df['is_holdout'] = scores_df['sme_id'].isin(set(ids_holdout))
    scores_df['lr_churn_prob'] = lr_all_probs
    scores_df['knn_churn_prob'] = knn_all_probs
    
    return {
        "lr_pipeline": lr_pipeline,
        "knn_pipeline": knn_pipeline,
        "lr_artifact_path": lr_path,
        "knn_artifact_path": knn_path,
        "splits": {
            "train_count": len(X_train),
            "holdout_count": len(X_holdout),
            "total_eligible": len(eligible),
            "train_churn_prevalence": float(y_train.mean()),
            "holdout_churn_prevalence": float(y_holdout.mean()),
            "feature_count": len(FEATURE_NAMES),
        },
        "holdout_data": {
            "X_holdout": X_holdout,
            "y_holdout": y_holdout,
            "ids_holdout": ids_holdout,
        },
        "scores_df": scores_df
    }
