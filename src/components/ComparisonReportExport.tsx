import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import type { MLResults, ModelPerformance } from "@/types/ml-results";
import type { ComparisonRun } from "./ComparisonDashboard";

interface ComparisonReportExportProps {
  runs: ComparisonRun[];
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

const RUN_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

export function ComparisonReportExport({ runs }: ComparisonReportExportProps) {
  const generateComparisonData = () => {
    const models = Object.keys(MODEL_LABELS) as (keyof ModelPerformance)[];
    
    return models.map(model => {
      const entry: Record<string, string> = { model: MODEL_LABELS[model] };
      
      runs.forEach((run, idx) => {
        const metrics = run.data.model_performance[model];
        entry[`auroc${idx}`] = metrics?.auroc?.mean ? (metrics.auroc.mean * 100).toFixed(1) : "N/A";
        entry[`accuracy${idx}`] = metrics?.accuracy?.mean ? (metrics.accuracy.mean * 100).toFixed(1) : "N/A";
      });
      
      return entry;
    }).filter(d => runs.some((_, idx) => d[`auroc${idx}`] !== "N/A"));
  };

  const generateFeatureComparison = () => {
    const featureSets = runs.map(run => new Set(run.data.selected_features || []));
    
    let common: string[] = [];
    if (featureSets.length > 0) {
      common = [...featureSets[0]].filter(f => featureSets.every(set => set.has(f)));
    }
    
    const uniquePerRun = featureSets.map((set, idx) => 
      [...set].filter(f => featureSets.every((otherSet, otherIdx) => otherIdx === idx || !otherSet.has(f)))
    );
    
    return { common, uniquePerRun };
  };

  const generateHTMLReport = () => {
    const comparisonData = generateComparisonData();
    const featureComparison = generateFeatureComparison();
    const generatedAt = new Date().toLocaleString();
    const runLabels = ["Run A", "Run B", "Run C", "Run D"];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ML Analysis Comparison Report (${runs.length} Runs)</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      color: #1a1a2e; 
      background: #f8fafc;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #0f172a; }
    h2 { font-size: 1.25rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; color: #334155; }
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
      grid-template-columns: repeat(${Math.min(runs.length, 4)}, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .run-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }
    ${runs.map((_, idx) => `.run-card:nth-child(${idx + 1}) { border-left-color: ${RUN_COLORS[idx]}; }`).join('\n    ')}
    .run-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    ${runs.map((_, idx) => `.run-card:nth-child(${idx + 1}) .run-label { color: ${RUN_COLORS[idx]}; }`).join('\n    ')}
    .run-name { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; word-break: break-all; }
    .run-date { font-size: 0.875rem; color: #64748b; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-weight: 600; font-size: 0.875rem; color: #475569; }
    td { font-size: 0.9rem; }
    ${runs.map((_, idx) => `.metric-${idx} { color: ${RUN_COLORS[idx]}; font-weight: 600; }`).join('\n    ')}
    .feature-section { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .feature-stats { display: grid; grid-template-columns: repeat(${runs.length + 1}, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .feature-stat { text-align: center; padding: 1rem; border-radius: 8px; background: #f8fafc; }
    .feature-stat-value { font-size: 1.5rem; font-weight: 700; }
    .feature-stat-label { font-size: 0.75rem; color: #64748b; }
    .feature-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .feature-tag { display: inline-block; padding: 0.25rem 0.75rem; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.75rem; }
    .footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.875rem; }
    @media print { body { background: white; padding: 0; } .header { break-after: avoid; } table { break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ML Analysis Comparison Report</h1>
      <p>Comparing ${runs.length} analysis runs • Generated: ${generatedAt}</p>
    </div>

    <div class="runs-grid">
      ${runs.map((run, idx) => `
        <div class="run-card">
          <div class="run-label">${runLabels[idx]}</div>
          <div class="run-name">${run.name}</div>
          <div class="run-date">Generated: ${new Date(run.data.metadata.generated_at).toLocaleDateString()}</div>
        </div>
      `).join('')}
    </div>

    <h2>Model Performance Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Model</th>
          ${runs.map((_, idx) => `<th>AUROC (${runLabels[idx]})</th>`).join('')}
          ${runs.map((_, idx) => `<th>Accuracy (${runLabels[idx]})</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${comparisonData.map(row => `
          <tr>
            <td>${row.model}</td>
            ${runs.map((_, idx) => `<td class="metric-${idx}">${row[`auroc${idx}`]}%</td>`).join('')}
            ${runs.map((_, idx) => `<td>${row[`accuracy${idx}`]}%</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h2>Configuration Comparison</h2>
    <table>
      <thead>
        <tr>
          <th>Setting</th>
          ${runs.map((_, idx) => `<th>${runLabels[idx]}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        <tr><td>Feature Selection</td>${runs.map(r => `<td>${r.data.metadata.config.feature_selection_method}</td>`).join('')}</tr>
        <tr><td>CV Folds</td>${runs.map(r => `<td>${r.data.metadata.config.n_folds || 'N/A'}</td>`).join('')}</tr>
        <tr><td>CV Repeats</td>${runs.map(r => `<td>${r.data.metadata.config.n_repeats || 'N/A'}</td>`).join('')}</tr>
        <tr><td>Permutations</td>${runs.map(r => `<td>${r.data.metadata.config.n_permutations}</td>`).join('')}</tr>
        <tr><td>Max Features</td>${runs.map(r => `<td>${r.data.metadata.config.max_features}</td>`).join('')}</tr>
        <tr><td>RF Trees</td>${runs.map(r => `<td>${r.data.metadata.config.rf_ntree}</td>`).join('')}</tr>
      </tbody>
    </table>

    <h2>Feature Selection Comparison</h2>
    <div class="feature-section">
      <div class="feature-stats">
        <div class="feature-stat">
          <div class="feature-stat-value" style="color: #22c55e;">${featureComparison.common.length}</div>
          <div class="feature-stat-label">Common to All</div>
        </div>
        ${runs.map((_, idx) => `
          <div class="feature-stat">
            <div class="feature-stat-value" style="color: ${RUN_COLORS[idx]};">${featureComparison.uniquePerRun[idx].length}</div>
            <div class="feature-stat-label">Unique to ${runLabels[idx]}</div>
          </div>
        `).join('')}
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
    a.download = `comparison-report-${runs.length}runs-${new Date().toISOString().split("T")[0]}.html`;
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
