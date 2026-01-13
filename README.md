# Multi-Method ML Diagnostic and Prognostic Classifier Dashboard

An interactive React dashboard for visualizing results from multi-method machine learning classification pipelines. Designed for biomedical research, clinical diagnostics, and prognostic prediction workflows.

## 🎯 Features

### Machine Learning Analysis
- **Multiple ML Methods**: Random Forest, SVM, XGBoost, KNN, MLP with soft/hard voting ensembles
- **Feature Selection**: Forward, backward, and stepwise selection methods
- **Permutation Testing**: Statistical validation against random chance
- **Cross-Validation**: Repeated k-fold CV with comprehensive metrics

### Visualization Dashboard
- **Model Performance Comparison**: Side-by-side comparison of all ML methods
- **ROC Curves**: Interactive multi-model ROC curves with threshold analysis
- **Confusion Matrices**: Visual matrices with derived metrics (Accuracy, Precision, Sensitivity, Specificity, F1, NPV)
- **Feature Importance**: Ranked feature visualization with stability analysis
- **Expression Box Plots**: Distribution of top features across classes
- **Dimensionality Reduction**: PCA, t-SNE, and UMAP clustering visualizations
- **Permutation Distributions**: Actual vs. permuted performance comparison
- **Calibration Curves**: Model probability calibration assessment
- **Profile Rankings**: Sample-level prediction confidence rankings

### Export & Reporting
- **HTML/PDF Reports**: Comprehensive export of analysis results
- **Model Export**: R code snippets for external predictions
- **Batch Processing**: Compare multiple datasets

## 🚀 Quick Start

### Dashboard Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

### R Script Setup

1. Create the conda environment:
```bash
conda env create -f public/ml_classifier_env.yml
conda activate ml_classifier
```

2. Run the R analysis script:
```bash
Rscript public/intelligenes_ml_classifier.R \
  --expr expression_matrix.txt \
  --annot sample_annotation.txt \
  --target diagnosis \
  --outdir results
```

3. Load the generated `ml_results.json` into the dashboard

## 📊 Input Data Format

### Expression Matrix (tab-delimited .txt or .tsv)
- **Rows**: Features (genes, proteins, metabolites, etc.)
- **Columns**: Samples (column names are sample IDs)

```
Gene    Sample1  Sample2  Sample3
BRCA1   5.2      4.8      6.1
TP53    3.1      3.5      2.9
...
```

### Sample Annotation (tab-delimited .txt or .tsv)
- Must contain sample IDs matching expression matrix columns
- Must contain target variable column for classification

```
SampleID  diagnosis  age  stage
Sample1   1          45   II
Sample2   0          52   I
Sample3   1          38   III
...
```

## 🔬 ML Method Guidance

| Method | Best For | Dataset Size |
|--------|----------|--------------|
| Random Forest | Robust baseline, feature importance | Any |
| SVM | High-dimensional data, clear margins | Small-Medium |
| XGBoost | Large datasets, complex patterns | Large (>100) |
| KNN | Simple patterns, interpretable | Small-Medium |
| MLP | Complex non-linear relationships | Large (>100) |

**Note**: XGBoost and MLP require larger datasets for optimal performance. Random Forest, SVM, and KNN are more robust on small biological datasets (<50 samples).

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **R Backend**: caret, randomForest, e1071, xgboost, nnet, pROC

## 📁 Project Structure

```
├── public/
│   ├── intelligenes_ml_classifier.R  # Main R analysis script
│   ├── ml_classifier_env.yml         # Conda environment
│   └── demo_data/                    # Sample input files
├── src/
│   ├── components/                   # React components
│   ├── types/                        # TypeScript interfaces
│   └── data/                         # Demo data
└── README.md
```

## 📖 References

- [IntelliGenes](https://github.com/drzeeshanahmed/intelligenes)
- [Li et al. 2022 - Permutation Strategy](https://pubmed.ncbi.nlm.nih.gov/35292087/)

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
