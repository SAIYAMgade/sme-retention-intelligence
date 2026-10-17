"""
Unit Tests for Model Pipelines and Evaluation.
"""

import pytest
import os
import joblib
import pandas as pd
from analytics.feature_engineering.registry import FEATURE_NAMES

def test_persisted_model_artifacts():
    lr_path = "models/logistic_regression.joblib"
    knn_path = "models/k_nearest_neighbors.joblib"
    
    assert os.path.exists(lr_path), "Logistic regression artifact must exist"
    assert os.path.exists(knn_path), "KNN artifact must exist"
    
    lr_pipe = joblib.load(lr_path)
    knn_pipe = joblib.load(knn_path)
    
    assert hasattr(lr_pipe, "predict_proba")
    assert hasattr(knn_pipe, "predict_proba")

def test_model_evaluation_metrics_loaded():
    import json
    eval_path = "models/metadata/model_evaluation.json"
    assert os.path.exists(eval_path)
    
    with open(eval_path, "r") as f:
        data = json.load(f)
        
    lr = data["logistic_regression"]
    assert "roc_auc" in lr
    assert "operating_threshold" in lr
    assert "recall_at_operating_threshold" in lr
    assert "confusion_matrix" in lr
    assert lr["roc_auc"] > 0.80
    assert lr["recall_at_operating_threshold"] > 0.75
