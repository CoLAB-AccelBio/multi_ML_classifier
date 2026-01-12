import type { MLResults } from "@/types/ml-results";

// Generate synthetic ROC curve data
function generateROCCurve(auc: number): { fpr: number; tpr: number }[] {
  const points: { fpr: number; tpr: number }[] = [];
  const n = 50;
  
  for (let i = 0; i <= n; i++) {
    const fpr = i / n;
    // Use beta function approximation based on AUC
    const tpr = Math.min(1, Math.pow(fpr, (1 - auc) / auc));
    points.push({ fpr, tpr: 1 - Math.pow(1 - fpr, auc / (1 - auc + 0.01)) });
  }
  
  // Ensure curve goes from (0,0) to (1,1)
  points[0] = { fpr: 0, tpr: 0 };
  points[n] = { fpr: 1, tpr: 1 };
  
  // Sort and smooth
  return points.sort((a, b) => a.fpr - b.fpr);
}

// Generate synthetic confusion matrix
function generateConfusionMatrix(accuracy: number, n: number = 100): { tp: number; tn: number; fp: number; fn: number } {
  const correct = Math.round(n * accuracy);
  const incorrect = n - correct;
  
  const tp = Math.round(correct * 0.52);
  const tn = correct - tp;
  const fp = Math.round(incorrect * 0.45);
  const fn = incorrect - fp;
  
  return { tp, tn, fp, fn };
}

export const demoData: MLResults = {
  metadata: {
    generated_at: new Date().toISOString(),
    config: {
      target_variable: "diagnosis",
      seed: 42,
      n_folds: 5,
      n_repeats: 10,
      top_percent: 10,
      feature_selection_method: "stepwise",
      max_features: 50,
      n_permutations: 100,
      rf_ntree: 500,
      xgb_nrounds: 100,
      expression_matrix_file: "demo_expression_matrix.txt",
      annotation_file: "demo_annotations.txt",
    },
    r_version: "R version 4.3.1 (2023-06-16)",
  },
  model_performance: {
    rf: {
      accuracy: { mean: 0.892, sd: 0.034, median: 0.895, q25: 0.871, q75: 0.912, min: 0.823, max: 0.948 },
      sensitivity: { mean: 0.878, sd: 0.042, median: 0.882, q25: 0.854, q75: 0.901, min: 0.789, max: 0.934 },
      specificity: { mean: 0.905, sd: 0.038, median: 0.908, q25: 0.881, q75: 0.928, min: 0.834, max: 0.961 },
      precision: { mean: 0.897, sd: 0.039, median: 0.901, q25: 0.872, q75: 0.921, min: 0.812, max: 0.952 },
      f1_score: { mean: 0.887, sd: 0.036, median: 0.891, q25: 0.865, q75: 0.908, min: 0.801, max: 0.943 },
      balanced_accuracy: { mean: 0.891, sd: 0.035, median: 0.895, q25: 0.868, q75: 0.914, min: 0.812, max: 0.947 },
      auroc: { mean: 0.934, sd: 0.028, median: 0.938, q25: 0.918, q75: 0.952, min: 0.867, max: 0.978 },
      kappa: { mean: 0.783, sd: 0.068, median: 0.789, q25: 0.742, q75: 0.825, min: 0.645, max: 0.896 },
      confusion_matrix: generateConfusionMatrix(0.892),
      roc_curve: generateROCCurve(0.934),
    },
    svm: {
      accuracy: { mean: 0.867, sd: 0.041, median: 0.871, q25: 0.843, q75: 0.892, min: 0.778, max: 0.928 },
      sensitivity: { mean: 0.854, sd: 0.048, median: 0.858, q25: 0.823, q75: 0.885, min: 0.752, max: 0.921 },
      specificity: { mean: 0.879, sd: 0.044, median: 0.883, q25: 0.852, q75: 0.906, min: 0.785, max: 0.945 },
      precision: { mean: 0.871, sd: 0.043, median: 0.875, q25: 0.845, q75: 0.897, min: 0.778, max: 0.934 },
      f1_score: { mean: 0.862, sd: 0.042, median: 0.866, q25: 0.836, q75: 0.888, min: 0.765, max: 0.927 },
      balanced_accuracy: { mean: 0.866, sd: 0.041, median: 0.870, q25: 0.838, q75: 0.895, min: 0.769, max: 0.933 },
      auroc: { mean: 0.912, sd: 0.035, median: 0.916, q25: 0.891, q75: 0.934, min: 0.834, max: 0.962 },
      kappa: { mean: 0.733, sd: 0.082, median: 0.741, q25: 0.686, q75: 0.783, min: 0.556, max: 0.856 },
      confusion_matrix: generateConfusionMatrix(0.867),
      roc_curve: generateROCCurve(0.912),
    },
    xgboost: {
      accuracy: { mean: 0.901, sd: 0.032, median: 0.905, q25: 0.882, q75: 0.921, min: 0.834, max: 0.956 },
      sensitivity: { mean: 0.889, sd: 0.039, median: 0.893, q25: 0.865, q75: 0.913, min: 0.805, max: 0.948 },
      specificity: { mean: 0.912, sd: 0.035, median: 0.916, q25: 0.892, q75: 0.932, min: 0.845, max: 0.967 },
      precision: { mean: 0.905, sd: 0.036, median: 0.909, q25: 0.883, q75: 0.927, min: 0.828, max: 0.958 },
      f1_score: { mean: 0.897, sd: 0.034, median: 0.901, q25: 0.876, q75: 0.918, min: 0.817, max: 0.953 },
      balanced_accuracy: { mean: 0.900, sd: 0.033, median: 0.904, q25: 0.879, q75: 0.922, min: 0.825, max: 0.957 },
      auroc: { mean: 0.945, sd: 0.025, median: 0.949, q25: 0.932, q75: 0.961, min: 0.889, max: 0.985 },
      kappa: { mean: 0.801, sd: 0.064, median: 0.809, q25: 0.764, q75: 0.842, min: 0.668, max: 0.912 },
      confusion_matrix: generateConfusionMatrix(0.901),
      roc_curve: generateROCCurve(0.945),
    },
    knn: {
      accuracy: { mean: 0.823, sd: 0.048, median: 0.827, q25: 0.793, q75: 0.854, min: 0.712, max: 0.898 },
      sensitivity: { mean: 0.801, sd: 0.055, median: 0.805, q25: 0.765, q75: 0.838, min: 0.678, max: 0.889 },
      specificity: { mean: 0.845, sd: 0.051, median: 0.849, q25: 0.812, q75: 0.878, min: 0.731, max: 0.923 },
      precision: { mean: 0.834, sd: 0.049, median: 0.838, q25: 0.803, q75: 0.865, min: 0.723, max: 0.912 },
      f1_score: { mean: 0.817, sd: 0.047, median: 0.821, q25: 0.787, q75: 0.848, min: 0.701, max: 0.900 },
      balanced_accuracy: { mean: 0.823, sd: 0.048, median: 0.827, q25: 0.789, q75: 0.858, min: 0.705, max: 0.906 },
      auroc: { mean: 0.878, sd: 0.042, median: 0.882, q25: 0.852, q75: 0.905, min: 0.782, max: 0.945 },
      kappa: { mean: 0.645, sd: 0.096, median: 0.653, q25: 0.586, q75: 0.707, min: 0.424, max: 0.796 },
      confusion_matrix: generateConfusionMatrix(0.823),
      roc_curve: generateROCCurve(0.878),
    },
    mlp: {
      accuracy: { mean: 0.856, sd: 0.043, median: 0.860, q25: 0.830, q75: 0.883, min: 0.761, max: 0.921 },
      sensitivity: { mean: 0.842, sd: 0.050, median: 0.846, q25: 0.810, q75: 0.875, min: 0.734, max: 0.912 },
      specificity: { mean: 0.869, sd: 0.046, median: 0.873, q25: 0.840, q75: 0.899, min: 0.768, max: 0.938 },
      precision: { mean: 0.861, sd: 0.045, median: 0.865, q25: 0.833, q75: 0.890, min: 0.762, max: 0.928 },
      f1_score: { mean: 0.851, sd: 0.044, median: 0.855, q25: 0.823, q75: 0.880, min: 0.748, max: 0.920 },
      balanced_accuracy: { mean: 0.855, sd: 0.043, median: 0.859, q25: 0.825, q75: 0.887, min: 0.751, max: 0.925 },
      auroc: { mean: 0.901, sd: 0.038, median: 0.905, q25: 0.878, q75: 0.925, min: 0.815, max: 0.958 },
      kappa: { mean: 0.711, sd: 0.086, median: 0.719, q25: 0.660, q75: 0.766, min: 0.522, max: 0.842 },
      confusion_matrix: generateConfusionMatrix(0.856),
      roc_curve: generateROCCurve(0.901),
    },
    hard_vote: {
      accuracy: { mean: 0.889, sd: 0.035, median: 0.893, q25: 0.868, q75: 0.910, min: 0.812, max: 0.945 },
      sensitivity: { mean: 0.876, sd: 0.043, median: 0.880, q25: 0.850, q75: 0.902, min: 0.782, max: 0.934 },
      specificity: { mean: 0.901, sd: 0.039, median: 0.905, q25: 0.877, q75: 0.925, min: 0.818, max: 0.958 },
      precision: { mean: 0.894, sd: 0.040, median: 0.898, q25: 0.869, q75: 0.919, min: 0.801, max: 0.949 },
      f1_score: { mean: 0.885, sd: 0.037, median: 0.889, q25: 0.862, q75: 0.907, min: 0.792, max: 0.941 },
      balanced_accuracy: { mean: 0.888, sd: 0.036, median: 0.892, q25: 0.864, q75: 0.913, min: 0.800, max: 0.946 },
      auroc: { mean: 0.928, sd: 0.030, median: 0.932, q25: 0.911, q75: 0.946, min: 0.858, max: 0.972 },
      kappa: { mean: 0.777, sd: 0.070, median: 0.785, q25: 0.736, q75: 0.820, min: 0.624, max: 0.890 },
      confusion_matrix: generateConfusionMatrix(0.889),
      roc_curve: generateROCCurve(0.928),
    },
    soft_vote: {
      accuracy: { mean: 0.905, sd: 0.031, median: 0.909, q25: 0.887, q75: 0.924, min: 0.841, max: 0.958 },
      sensitivity: { mean: 0.893, sd: 0.038, median: 0.897, q25: 0.871, q75: 0.916, min: 0.812, max: 0.951 },
      specificity: { mean: 0.916, sd: 0.034, median: 0.920, q25: 0.897, q75: 0.936, min: 0.852, max: 0.969 },
      precision: { mean: 0.910, sd: 0.035, median: 0.914, q25: 0.890, q75: 0.931, min: 0.838, max: 0.962 },
      f1_score: { mean: 0.901, sd: 0.033, median: 0.905, q25: 0.882, q75: 0.921, min: 0.825, max: 0.956 },
      balanced_accuracy: { mean: 0.904, sd: 0.032, median: 0.908, q25: 0.884, q75: 0.926, min: 0.832, max: 0.960 },
      auroc: { mean: 0.951, sd: 0.023, median: 0.955, q25: 0.939, q75: 0.966, min: 0.898, max: 0.988 },
      kappa: { mean: 0.809, sd: 0.062, median: 0.817, q25: 0.773, q75: 0.848, min: 0.682, max: 0.916 },
      confusion_matrix: generateConfusionMatrix(0.905),
      roc_curve: generateROCCurve(0.951),
    },
  },
  feature_importance: [
    { feature: "BRCA1_expr", importance: 0.0823 },
    { feature: "TP53_mutation", importance: 0.0756 },
    { feature: "ERBB2_amp", importance: 0.0689 },
    { feature: "ESR1_expr", importance: 0.0621 },
    { feature: "PIK3CA_mutation", importance: 0.0578 },
    { feature: "MKI67_expr", importance: 0.0534 },
    { feature: "PGR_expr", importance: 0.0487 },
    { feature: "BRCA2_expr", importance: 0.0445 },
    { feature: "CDH1_mutation", importance: 0.0401 },
    { feature: "GATA3_expr", importance: 0.0367 },
    { feature: "FOXA1_expr", importance: 0.0334 },
    { feature: "PTEN_mutation", importance: 0.0298 },
    { feature: "MYC_amp", importance: 0.0267 },
    { feature: "CCND1_amp", importance: 0.0245 },
    { feature: "RB1_mutation", importance: 0.0218 },
    { feature: "AKT1_mutation", importance: 0.0195 },
    { feature: "MAP3K1_mutation", importance: 0.0178 },
    { feature: "KMT2C_mutation", importance: 0.0156 },
    { feature: "NCOR1_mutation", importance: 0.0134 },
    { feature: "TBX3_mutation", importance: 0.0118 },
  ],
  permutation_testing: {
    rf_oob_error: {
      permuted_mean: 0.487,
      permuted_sd: 0.045,
      original: 0.108,
      p_value: 0.0001,
    },
    rf_auroc: {
      permuted_mean: 0.512,
      permuted_sd: 0.048,
      original: 0.934,
      p_value: 0.0001,
    },
  },
  profile_ranking: {
    top_profiles: Array.from({ length: 15 }, (_, i) => ({
      sample_index: i + 1,
      actual_class: i % 3 === 0 ? "0" : "1",
      ensemble_probability: 0.95 - i * 0.02,
      predicted_class: i % 3 === 0 ? "0" : "1",
      confidence: 0.95 - i * 0.02,
      correct: true,
      rank: i + 1,
      top_profile: true,
    })),
    all_rankings: Array.from({ length: 150 }, (_, i) => ({
      sample_index: i + 1,
      actual_class: i % 2 === 0 ? "1" : "0",
      ensemble_probability: 0.95 - i * 0.003,
      predicted_class: i < 140 ? (i % 2 === 0 ? "1" : "0") : (i % 2 === 0 ? "0" : "1"),
      confidence: Math.max(0.5, 0.95 - i * 0.003),
      correct: i < 140,
      rank: i + 1,
      top_profile: i < 15,
    })),
  },
  selected_features: [
    "BRCA1_expr", "TP53_mutation", "ERBB2_amp", "ESR1_expr", "PIK3CA_mutation",
    "MKI67_expr", "PGR_expr", "BRCA2_expr", "CDH1_mutation", "GATA3_expr",
    "FOXA1_expr", "PTEN_mutation", "MYC_amp", "CCND1_amp", "RB1_mutation",
  ],
};
