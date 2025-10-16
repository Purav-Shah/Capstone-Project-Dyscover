#!/usr/bin/env python3
"""
Train a simple XGBoost classifier on dyslexia_screening_dataset_MDA.csv
and emit metrics you can paste into the paper (AUROC, Accuracy, Sensitivity/Recall,
Specificity, Precision) plus a confusion matrix file.

Usage:
  pip install xgboost scikit-learn pandas numpy matplotlib
  python analysis/xgb_dummy.py

Outputs:
  analysis/xgb_results_summary.txt
  analysis/xgb_confusion_matrix.csv
  analysis/xgb_confusion_matrix.png (optional, if matplotlib is available)
"""

import os
import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, label_binarize
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    precision_recall_fscore_support
)

try:
    import xgboost as xgb
except Exception as e:
    raise SystemExit(
        "xgboost is not installed. Install with: pip install xgboost"
    )

try:
    import matplotlib.pyplot as plt
    HAS_MPL = True
except Exception:
    HAS_MPL = False


RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


def compute_specificity(conf_mat: np.ndarray) -> float:
    """Compute macro-averaged specificity from a multiclass confusion matrix.
    Specificity for class i = TN / (TN + FP) considering class i as positive.
    """
    num_classes = conf_mat.shape[0]
    specificities = []
    for i in range(num_classes):
        tp = conf_mat[i, i]
        fn = conf_mat[i, :].sum() - tp
        fp = conf_mat[:, i].sum() - tp
        tn = conf_mat.sum() - (tp + fn + fp)
        denom = (tn + fp)
        specificities.append((tn / denom) if denom > 0 else 0.0)
    return float(np.mean(specificities))


def main():
    root = Path(__file__).resolve().parents[1]
    data_path = root / "dyslexia_screening_dataset_MDA.csv"
    out_dir = root / "analysis"
    out_dir.mkdir(parents=True, exist_ok=True)

    if not data_path.exists():
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    df = pd.read_csv(data_path)

    # Basic sanity checks
    required_cols = [
        "phoneme_score", "pattern_score", "nonsense_score",
        "reading_wpm", "questionnaire_score", "dyslexia_risk"
    ]
    for c in required_cols:
        if c not in df.columns:
            raise ValueError(f"Missing required column: {c}")

    # Features and target
    X = df[[
        "phoneme_score", "pattern_score", "nonsense_score",
        "reading_wpm", "questionnaire_score"
    ]].copy()
    y_raw = df["dyslexia_risk"].astype(str).values

    # Encode target labels
    le = LabelEncoder()
    y = le.fit_transform(y_raw)
    class_names = list(le.classes_)

    # Train/test split (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=RANDOM_SEED, stratify=y
    )

    # Model - small, fast configuration suitable for demo
    clf = xgb.XGBClassifier(
        objective="multi:softprob",
        num_class=len(class_names),
        eval_metric="mlogloss",
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_lambda=1.0,
        random_state=RANDOM_SEED,
        tree_method="hist"
    )

    clf.fit(X_train, y_train)

    # Save model and label encoder
    out_dir.mkdir(parents=True, exist_ok=True)
    model_path = out_dir / "xgb_model.json"
    clf.save_model(model_path)
    le_path = out_dir / "label_encoder.npy"
    np.save(le_path, le.classes_)

    # Predictions
    y_proba = clf.predict_proba(X_test)
    y_pred = np.argmax(y_proba, axis=1)

    # Metrics
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0)
    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        y_test, y_pred, average="macro", zero_division=0
    )

    # AUROC (multiclass One-vs-Rest)
    y_test_bin = label_binarize(y_test, classes=list(range(len(class_names))))
    try:
        auroc = roc_auc_score(y_test_bin, y_proba, average="macro", multi_class="ovr")
    except Exception:
        auroc = float("nan")

    # Confusion matrix and specificity
    cm = confusion_matrix(y_test, y_pred, labels=list(range(len(class_names))))
    specificity_macro = compute_specificity(cm)

    # Save artifacts
    cm_df = pd.DataFrame(cm, index=[f"Actual_{c}" for c in class_names], columns=[f"Pred_{c}" for c in class_names])
    cm_path = out_dir / "xgb_confusion_matrix.csv"
    cm_df.to_csv(cm_path, index=True)

    if HAS_MPL:
        try:
            fig, ax = plt.subplots(figsize=(5, 4))
            im = ax.imshow(cm, cmap="Blues")
            ax.set_xticks(range(len(class_names)))
            ax.set_yticks(range(len(class_names)))
            ax.set_xticklabels(class_names, rotation=45, ha="right")
            ax.set_yticklabels(class_names)
            for i in range(cm.shape[0]):
                for j in range(cm.shape[1]):
                    ax.text(j, i, cm[i, j], ha="center", va="center", color="black")
            ax.set_xlabel("Predicted")
            ax.set_ylabel("Actual")
            fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
            fig.tight_layout()
            (out_dir / "xgb_confusion_matrix.png").unlink(missing_ok=True)
            fig.savefig(out_dir / "xgb_confusion_matrix.png", dpi=150)
            plt.close(fig)
        except Exception:
            pass

    summary = {
        "samples_total": int(len(df)),
        "test_size": 0.25,
        "classes": class_names,
        "metrics": {
            "AUROC_macro_ovr": float(auroc) if auroc == auroc else None,
            "Accuracy": float(acc),
            "Precision_macro": float(precision_macro),
            "Sensitivity_macro_recall": float(recall_macro),
            "Specificity_macro": float(specificity_macro),
            "F1_macro": float(f1_macro)
        },
        "per_class": report,
        "confusion_matrix_csv": str(cm_path)
    }

    with open(out_dir / "xgb_results_summary.txt", "w", encoding="utf-8") as f:
        f.write("DYSCOVER XGBoost Dummy Model Results\n")
        f.write(json.dumps(summary, indent=2))

    print("=== XGBoost Dummy Results ===")
    print(json.dumps(summary["metrics"], indent=2))
    print(f"Confusion matrix saved to: {cm_path}")
    print(f"Summary saved to: {out_dir / 'xgb_results_summary.txt'}")


if __name__ == "__main__":
    main()


