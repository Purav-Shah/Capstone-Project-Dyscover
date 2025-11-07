#!/usr/bin/env python3
"""
Train a medium-complexity XGBoost model for balanced performance.
Settings:
- test_size = 0.30
- features include reading_wpm
- model: n_estimators=120, max_depth=3, learning_rate=0.07,
         subsample=0.85, colsample_bytree=0.85

Outputs:
  analysis/xgb_medium_results_summary.txt
  analysis/xgb_medium_confusion_matrix.csv
  analysis/xgb_medium_roc_curve.png (if matplotlib available)
  analysis/xgb_medium_model.json
  analysis/xgb_medium_label_encoder.npy
"""
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, label_binarize
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, precision_recall_fscore_support, roc_curve, auc
)
import xgboost as xgb

try:
    import matplotlib.pyplot as plt
    HAS_MPL = True
except Exception:
    HAS_MPL = False

RANDOM_SEED = 42
root = Path(__file__).resolve().parents[1]
data_path = root / "dyslexia_screening_dataset_MDA.csv"
out_dir = root / "analysis"
out_dir.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(data_path)

feature_cols = [
    "phoneme_score", "pattern_score", "nonsense_score",
    "reading_wpm", "questionnaire_score"
]
X = df[feature_cols].copy()
y_raw = df["dyslexia_risk"].astype(str).values
le = LabelEncoder()
y = le.fit_transform(y_raw)
class_names = list(le.classes_)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.30, random_state=RANDOM_SEED, stratify=y
)

clf = xgb.XGBClassifier(
    objective="multi:softprob",
    num_class=len(class_names),
    eval_metric="mlogloss",
    n_estimators=120,
    max_depth=3,
    learning_rate=0.07,
    subsample=0.85,
    colsample_bytree=0.85,
    reg_lambda=1.0,
    random_state=RANDOM_SEED,
    tree_method="hist",
)

clf.fit(X_train, y_train)

y_proba = clf.predict_proba(X_test)
y_pred = np.argmax(y_proba, axis=1)

acc = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)
precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
    y_test, y_pred, average="macro", zero_division=0
)

# Weighted averages
precision_weighted, recall_weighted, f1_weighted, _ = precision_recall_fscore_support(
    y_test, y_pred, average="weighted", zero_division=0
)

y_test_bin = label_binarize(y_test, classes=list(range(len(class_names))))
try:
    auroc = roc_auc_score(y_test_bin, y_proba, average="macro", multi_class="ovr")
except Exception:
    auroc = float("nan")

cm = confusion_matrix(y_test, y_pred, labels=list(range(len(class_names))))

# Specificity (macro)
def compute_specificity(conf_mat: np.ndarray) -> float:
    specificities = []
    for i in range(conf_mat.shape[0]):
        tp = conf_mat[i, i]
        fn = conf_mat[i, :].sum() - tp
        fp = conf_mat[:, i].sum() - tp
        tn = conf_mat.sum() - (tp + fn + fp)
        denom = (tn + fp)
        specificities.append((tn / denom) if denom > 0 else 0.0)
    return float(np.mean(specificities))

specificity_macro = compute_specificity(cm)

if HAS_MPL:
    try:
        fig, ax = plt.subplots(figsize=(6, 5))
        for i, name in enumerate(class_names):
            fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_proba[:, i])
            roc_auc = auc(fpr, tpr)
            ax.plot(fpr, tpr, lw=1.5, label=f"{name} (AUC={roc_auc:.3f})")
        ax.plot([0, 1], [0, 1], linestyle='--', color='gray', lw=1)
        ax.set_xlim([0.0, 1.0])
        ax.set_ylim([0.0, 1.05])
        ax.set_xlabel('False Positive Rate')
        ax.set_ylabel('True Positive Rate')
        ax.set_title('ROC Curves (OvR) - Medium Model')
        ax.legend(loc='lower right', fontsize=8)
        fig.tight_layout()
        fig.savefig(out_dir / "xgb_medium_roc_curve.png", dpi=150)
        plt.close(fig)
    except Exception:
        pass

# Save artifacts
clf.save_model(out_dir / "xgb_medium_model.json")
np.save(out_dir / "xgb_medium_label_encoder.npy", le.classes_)

cm_df = pd.DataFrame(cm, index=[f"Actual_{c}" for c in class_names], columns=[f"Pred_{c}" for c in class_names])
cm_csv_path = out_dir / "xgb_medium_confusion_matrix.csv"
cm_df.to_csv(cm_csv_path, index=True)

summary = {
    "samples_total": int(len(df)),
    "test_size": 0.30,
    "classes": class_names,
    "metrics": {
        "AUROC_macro_ovr": float(auroc) if auroc == auroc else None,
        "Accuracy": float(acc),
        "Precision_macro": float(precision_macro),
        "Sensitivity_macro_recall": float(recall_macro),
        "Specificity_macro": float(specificity_macro),
        "F1_macro": float(f1_macro),
        "Precision_weighted": float(precision_weighted),
        "Sensitivity_weighted_recall": float(recall_weighted),
        "F1_weighted": float(f1_weighted)
    },
    "per_class": report,
    "confusion_matrix_csv": str(cm_csv_path),
    "roc_curve_png": str(out_dir / "xgb_medium_roc_curve.png") if HAS_MPL else None
}

with open(out_dir / "xgb_medium_results_summary.txt", "w", encoding="utf-8") as f:
    f.write(json.dumps(summary, indent=2))

print("=== XGB MEDIUM RESULTS ===")
print(json.dumps(summary, indent=2))

