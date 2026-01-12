import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import type { MLResults, ModelPerformance } from "@/types/ml-results";

interface ComparisonReportExportProps {
  runA: { name: string; data: MLResults };
  runB: { name: string; data: MLResults };
}

const MODEL_LABELS: Record<string, string> = {
  rf: "Random Forest",
  svm: "SVM",
  xgboost: "XGBoost",
  knn: "KNN",
  mlp: "MLP",
  hard_vote: "Hard Voting",
  soft_vote: "Soft Voting",
};

export function ComparisonReportExport({ runA, runB }: ComparisonReportExportProps) {
  const generateComparisonData = () => {
    const models = Object.keys(MODEL_LABELS) as (keyof ModelPerformance)[];
    
    return models.map(model => {
      const metricsA = runA.data.model_performance[model];
      const metricsB = runB.data.model_performance[model];
      
      return {
        model: MODEL_LABELS[model],
        aurocA: metricsA?.auroc?.mean ? (metricsA.auroc.mean * 100).toFixed(1) : "N/A",
        aurocB: metricsB?.auroc?.mean ? (metricsB.auroc.mean * 100).toFixed(1) : "N/A",
        accuracyA: metricsA?.accuracy?.mean ? (metricsA.accuracy.mean * 100).toFixed(1) : "N/A",
        accuracyB: metricsB?.accuracy?.mean ? (metricsB.accuracy.mean * 100).toFixed(1) : "N/A",
        diff: metricsA?.auroc?.mean && metricsB?.auroc?.mean
          ? ((metricsB.auroc.mean - metricsA.auroc.mean) * 100).toFixed(2)
          : "N/A",
      };
    }).filter(d => d.aurocA !== "N/A" || d.aurocB !== "N/A");
  };

  const generateFeatureComparison = () => {
    const featuresA = new Set(runA.data.selected_features || []);
    const featuresB = new Set(runB.data.selected_features || []);
    
    const common = [...featuresA].filter(f => featuresB.has(f));
    const onlyA = [...featuresA].filter(f => !featuresB.has(f));
    const onlyB = [...featuresB].filter(f => !featuresA.has(f));
    
    return { common, onlyA, onlyB };
  };

  const generateHTMLReport = () => {
    const comparisonData = generateComparisonData();
    const featureComparison = generateFeatureComparison();
    const generatedAt = new Date().toLocaleString();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ML Analysis Comparison Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      color: #1a1a2e; 
      background: #f8fafc;
      padding: 2rem;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { 
      font-size: 2rem; 
      margin-bottom: 0.5rem; 
      color: #0f172a;
    }
    h2 { 
      font-size: 1.25rem; 
      margin: 2rem 0 1rem; 
      padding-bottom: 0.5rem; 
      border-bottom: 2px solid #e2e8f0;
      color: #334155;
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    .header p { opacity: 0.9; }
    .runs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .run-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .run-card.run-a { border-left: 4px solid #3b82f6; }
    .run-card.run-b { border-left: 4px solid #8b5cf6; }
    .run-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .run-a .run-label { color: #3b82f6; }
    .run-b .run-label { color: #8b5cf6; }
    .run-name { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .run-date { font-size: 0.875rem; color: #64748b; }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    th, td { 
      padding: 1rem; 
      text-align: left; 
      border-bottom: 1px solid #e2e8f0;
    }
    th { 
      background: #f1f5f9; 
      font-weight: 600;
      font-size: 0.875rem;
      color: #475569;
    }
    td { font-size: 0.9rem; }
    .metric-a { color: #3b82f6; font-weight: 600; }
    .metric-b { color: #8b5cf6; font-weight: 600; }
    .diff-positive { color: #22c55e; font-weight: 600; }
    .diff-negative { color: #ef4444; font-weight: 600; }
    .diff-neutral { color: #64748b; }
    .feature-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .feature-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .feature-stat {
      text-align: center;
      padding: 1rem;
      border-radius: 8px;
      background: #f8fafc;
    }
    .feature-stat-value {
      font-size: 2rem;
      font-weight: 700;
    }
    .feature-stat-label { font-size: 0.875rem; color: #64748b; }
    .feature-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .feature-tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .feature-tag.only-a { background: #dbeafe; color: #2563eb; }
    .feature-tag.only-b { background: #ede9fe; color: #7c3aed; }
    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 0.875rem;
    }
    @media print {
      body { background: white; padding: 0; }
      .header { break-after: avoid; }
      table { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ML Analysis Comparison Report</h1>
      <p>Generated: ${generatedAt}</p>
    </div>

    <div class="runs-grid">
      <div class="run-card run-a">
        <div class="run-label">Run A</div>
        <div class="run-name">${runA.name}</div>
        <div class="run-date">Generated: ${new Date(runA.data.metadata.generated_at).toLocaleDateString()}</div>
      </div>
      <div class="run-card run-b">
        <div class="run-label">Run B</div>
        <div class="run-name">${runB.name}</div>
        <div class="run-date">Generated: ${new Date(runB.data.metadata.generated_at).toLocaleDateString()}</div>
      </div>
    </div>

    <h2>Model Performance Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Model</th>
          <th>AUROC (Run A)</th>
          <th>AUROC (Run B)</th>
          <th>Difference</th>
          <th>Accuracy (A)</th>
          <th>Accuracy (B)</th>
        </tr>
      </thead>
      <tbody>
        ${comparisonData.map(row => `
          <tr>
            <td>${row.model}</td>
            <td class="metric-a">${row.aurocA}%</td>
            <td class="metric-b">${row.aurocB}%</td>
            <td class="${parseFloat(row.diff) > 0.5 ? 'diff-positive' : parseFloat(row.diff) < -0.5 ? 'diff-negative' : 'diff-neutral'}">${row.diff !== "N/A" ? (parseFloat(row.diff) > 0 ? '+' : '') + row.diff + '%' : 'N/A'}</td>
            <td>${row.accuracyA}%</td>
            <td>${row.accuracyB}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Configuration Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Setting</th>
          <th>Run A</th>
          <th>Run B</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Feature Selection</td><td>${runA.data.metadata.config.feature_selection_method}</td><td>${runB.data.metadata.config.feature_selection_method}</td></tr>
        <tr><td>CV Folds</td><td>${runA.data.metadata.config.n_folds}</td><td>${runB.data.metadata.config.n_folds}</td></tr>
        <tr><td>CV Repeats</td><td>${runA.data.metadata.config.n_repeats}</td><td>${runB.data.metadata.config.n_repeats}</td></tr>
        <tr><td>Permutations</td><td>${runA.data.metadata.config.n_permutations}</td><td>${runB.data.metadata.config.n_permutations}</td></tr>
        <tr><td>Max Features</td><td>${runA.data.metadata.config.max_features}</td><td>${runB.data.metadata.config.max_features}</td></tr>
        <tr><td>RF Trees</td><td>${runA.data.metadata.config.rf_ntree}</td><td>${runB.data.metadata.config.rf_ntree}</td></tr>
      </tbody>
    </table>

    <h2>Feature Selection Comparison</h2>
    <div class="feature-section">
      <div class="feature-stats">
        <div class="feature-stat">
          <div class="feature-stat-value" style="color: #22c55e;">${featureComparison.common.length}</div>
          <div class="feature-stat-label">Common Features</div>
        </div>
        <div class="feature-stat">
          <div class="feature-stat-value" style="color: #3b82f6;">${featureComparison.onlyA.length}</div>
          <div class="feature-stat-label">Only in Run A</div>
        </div>
        <div class="feature-stat">
          <div class="feature-stat-value" style="color: #8b5cf6;">${featureComparison.onlyB.length}</div>
          <div class="feature-stat-label">Only in Run B</div>
        </div>
      </div>
      
      ${featureComparison.common.length > 0 ? `
        <h3 style="margin-bottom: 0.75rem; font-size: 0.9rem; color: #475569;">Common Features</h3>
        <div class="feature-list">
          ${featureComparison.common.slice(0, 20).map(f => `<span class="feature-tag">${f}</span>`).join('')}
          ${featureComparison.common.length > 20 ? `<span class="feature-tag">+${featureComparison.common.length - 20} more</span>` : ''}
        </div>
      ` : ''}
    </div>

    <div class="footer">
      <p>Generated by Multi-Method ML Diagnostic and Prognostic Classifier Dashboard</p>
    </div>
  </div>
</body>
</html>
    `;

    return html;
  };

  const handleExportHTML = () => {
    const html = generateHTMLReport();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparison-report-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateHTMLReport();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportHTML} className="gap-2">
        <FileText className="w-4 h-4" />
        Export HTML
      </Button>
      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" />
        Print / PDF
      </Button>
    </div>
  );
}
