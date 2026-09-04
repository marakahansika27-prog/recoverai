import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from app.ml.features import extract_account_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "propensity_model.joblib")

def train_and_save_model():
    """
    Generates synthetic training dataset and trains a calibrated Random Forest classifier
    to predict propensity to pay (0.0 to 1.0) and risk score.
    """
    np.random.seed(42)
    n_samples = 2000
    
    dpd = np.random.randint(15, 180, size=n_samples)
    amounts = np.random.exponential(scale=3500, size=n_samples) + 200
    
    # Propensity formula: Higher DPD & higher amount -> lower propensity
    logits = 2.0 - (dpd / 45.0) - (np.log1p(amounts) / 4.0) + np.random.normal(0, 0.5, size=n_samples)
    probs = 1.0 / (1.0 + np.exp(-logits))
    labels = (probs > 0.5).astype(int)
    
    raw_data = pd.DataFrame({
        "days_past_due": dpd,
        "outstanding_amount": amounts
    })
    
    X = extract_account_features(raw_data)
    y = labels
    
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    calibrated_clf = CalibratedClassifierCV(estimator=rf, cv=3)
    calibrated_clf.fit(X, y)
    
    joblib.dump(calibrated_clf, MODEL_PATH)
    print(f"Model successfully trained and saved to {MODEL_PATH}")
    return calibrated_clf

if __name__ == "__main__":
    train_and_save_model()
