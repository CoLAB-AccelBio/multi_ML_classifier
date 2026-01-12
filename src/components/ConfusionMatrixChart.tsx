import { useMemo } from "react";
import type { ConfusionMatrixData } from "@/types/ml-results";

interface ConfusionMatrixChartProps {
  data: ConfusionMatrixData;
  modelName: string;
}

export function ConfusionMatrixChart({ data, modelName }: ConfusionMatrixChartProps) {
  const { tp, tn, fp, fn } = data;
  const total = tp + tn + fp + fn;

  const cells = useMemo(() => [
    { label: "True Positive", value: tp, row: 0, col: 1, color: "bg-success/80", textColor: "text-success-foreground" },
    { label: "False Negative", value: fn, row: 0, col: 0, color: "bg-warning/80", textColor: "text-warning-foreground" },
    { label: "False Positive", value: fp, row: 1, col: 1, color: "bg-warning/80", textColor: "text-warning-foreground" },
    { label: "True Negative", value: tn, row: 1, col: 0, color: "bg-success/80", textColor: "text-success-foreground" },
  ], [tp, tn, fp, fn]);

  const metrics = useMemo(() => {
    const accuracy = ((tp + tn) / total * 100).toFixed(1);
    const precision = tp + fp > 0 ? (tp / (tp + fp) * 100).toFixed(1) : "0";
    const recall = tp + fn > 0 ? (tp / (tp + fn) * 100).toFixed(1) : "0";
    const specificity = tn + fp > 0 ? (tn / (tn + fp) * 100).toFixed(1) : "0";
    return { accuracy, precision, recall, specificity };
  }, [tp, tn, fp, fn, total]);

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <h4 className="font-semibold text-lg mb-4 text-center">{modelName}</h4>
      
      {/* Matrix Grid */}
      <div className="relative">
        {/* Axis Labels */}
        <div className="flex items-center justify-center mb-2">
          <span className="text-xs text-muted-foreground font-medium">Predicted</span>
        </div>
        
        <div className="flex">
          {/* Y-axis label */}
          <div className="flex items-center justify-center w-8">
            <span className="text-xs text-muted-foreground font-medium -rotate-90 whitespace-nowrap">Actual</span>
          </div>
          
          <div className="flex-1">
            {/* Column headers */}
            <div className="grid grid-cols-2 gap-1 mb-1 ml-16">
              <div className="text-center text-xs text-muted-foreground">Negative</div>
              <div className="text-center text-xs text-muted-foreground">Positive</div>
            </div>
            
            <div className="flex">
              {/* Row labels */}
              <div className="flex flex-col justify-around w-16 pr-2">
                <div className="text-right text-xs text-muted-foreground">Positive</div>
                <div className="text-right text-xs text-muted-foreground">Negative</div>
              </div>
              
              {/* Matrix cells */}
              <div className="grid grid-cols-2 gap-1 flex-1">
                {/* Row 1: Actual Positive */}
                <div className="aspect-square bg-warning/20 rounded-lg flex flex-col items-center justify-center border border-warning/30">
                  <span className="text-2xl font-bold">{fn}</span>
                  <span className="text-xs text-muted-foreground">FN</span>
                </div>
                <div className="aspect-square bg-success/20 rounded-lg flex flex-col items-center justify-center border border-success/30">
                  <span className="text-2xl font-bold text-success">{tp}</span>
                  <span className="text-xs text-muted-foreground">TP</span>
                </div>
                
                {/* Row 2: Actual Negative */}
                <div className="aspect-square bg-success/20 rounded-lg flex flex-col items-center justify-center border border-success/30">
                  <span className="text-2xl font-bold text-success">{tn}</span>
                  <span className="text-xs text-muted-foreground">TN</span>
                </div>
                <div className="aspect-square bg-warning/20 rounded-lg flex flex-col items-center justify-center border border-warning/30">
                  <span className="text-2xl font-bold">{fp}</span>
                  <span className="text-xs text-muted-foreground">FP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Derived Metrics */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Accuracy</p>
          <p className="font-mono font-semibold text-primary">{metrics.accuracy}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Precision</p>
          <p className="font-mono font-semibold">{metrics.precision}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Recall</p>
          <p className="font-mono font-semibold">{metrics.recall}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Specificity</p>
          <p className="font-mono font-semibold">{metrics.specificity}%</p>
        </div>
      </div>
    </div>
  );
}
