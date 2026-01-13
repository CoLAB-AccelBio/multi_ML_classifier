import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Scatter,
  ErrorBar,
  ReferenceLine,
} from "recharts";
import type { MLResults, FeatureBoxplotClassStats } from "@/types/ml-results";

interface FeatureExpressionBoxplotTabProps {
  data: MLResults;
}

const CLASS_COLORS: Record<string, string> = {
  "0": "hsl(var(--primary))",
  "1": "hsl(var(--secondary))",
};

const CLASS_NAMES: Record<string, string> = {
  "0": "Negative",
  "1": "Positive",
};

interface FeatureBoxplotData {
  feature: string;
  by_class: Record<string, { mean: number; median: number; q25: number; q75: number; min: number; max: number }>;
}

// Custom shape for rendering a boxplot
const BoxplotShape = (props: {
  cx: number;
  cy: number;
  payload: {
    median: number;
    q25: number;
    q75: number;
    min: number;
    max: number;
    classKey: string;
  };
  yAxisMap: { scale: (v: number) => number };
}) => {
  const { cx, payload, yAxisMap } = props;
  if (!payload || !yAxisMap?.scale) return null;

  const scale = yAxisMap.scale;
  const width = 40;
  const halfWidth = width / 2;

  const yMedian = scale(payload.median);
  const yQ25 = scale(payload.q25);
  const yQ75 = scale(payload.q75);
  const yMin = scale(payload.min);
  const yMax = scale(payload.max);

  const fill = CLASS_COLORS[payload.classKey] || "hsl(var(--accent))";

  return (
    <g>
      {/* Whisker line from min to max */}
      <line x1={cx} y1={yMin} x2={cx} y2={yMax} stroke={fill} strokeWidth={1.5} />
      {/* Min cap */}
      <line x1={cx - halfWidth / 2} y1={yMin} x2={cx + halfWidth / 2} y2={yMin} stroke={fill} strokeWidth={1.5} />
      {/* Max cap */}
      <line x1={cx - halfWidth / 2} y1={yMax} x2={cx + halfWidth / 2} y2={yMax} stroke={fill} strokeWidth={1.5} />
      {/* IQR box */}
      <rect
        x={cx - halfWidth}
        y={Math.min(yQ25, yQ75)}
        width={width}
        height={Math.abs(yQ75 - yQ25)}
        fill={fill}
        fillOpacity={0.3}
        stroke={fill}
        strokeWidth={2}
        rx={4}
      />
      {/* Median line */}
      <line x1={cx - halfWidth} y1={yMedian} x2={cx + halfWidth} y2={yMedian} stroke={fill} strokeWidth={3} />
    </g>
  );
};

export function FeatureExpressionBoxplotTab({ data }: FeatureExpressionBoxplotTabProps) {
  // Convert the R script's format to a usable format
  const boxplotData = useMemo<FeatureBoxplotData[]>(() => {
    const rawStats = data.feature_boxplot_stats;
    if (!rawStats) return [];
    
    return Object.entries(rawStats).map(([feature, classStats]) => {
      const byClass: Record<string, { mean: number; median: number; q25: number; q75: number; min: number; max: number }> = {};
      classStats.forEach((cs: FeatureBoxplotClassStats) => {
        byClass[cs.class] = {
          mean: cs.mean,
          median: cs.median,
          q25: cs.q1,
          q75: cs.q3,
          min: cs.min,
          max: cs.max,
        };
      });
      return { feature, by_class: byClass };
    });
  }, [data.feature_boxplot_stats]);

  const [selectedFeatureIdx, setSelectedFeatureIdx] = useState(0);

  if (!boxplotData || boxplotData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Expression Box Plots</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No feature expression boxplot data available. Re-run the R script with the updated exporter
            to include per-feature expression statistics for top-N features.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedFeature = boxplotData[selectedFeatureIdx];
  const classes = Object.keys(selectedFeature.by_class);

  // Prepare chart data for boxplot visualization
  const chartData = classes.map((cls, index) => {
    const stats = selectedFeature.by_class[cls];
    return {
      class: CLASS_NAMES[cls] || `Class ${cls}`,
      classKey: cls,
      xPos: index,
      mean: stats.mean,
      median: stats.median,
      q25: stats.q25,
      q75: stats.q75,
      min: stats.min,
      max: stats.max,
      // Error bar data for visualization fallback
      iqrLower: stats.median - stats.q25,
      iqrUpper: stats.q75 - stats.median,
    };
  });

  // Calculate Y axis domain
  const allValues = chartData.flatMap(d => [d.min, d.max]);
  const yMin = Math.min(...allValues);
  const yMax = Math.max(...allValues);
  const yPadding = (yMax - yMin) * 0.1;

  // Summary comparison across all features
  const summaryData = boxplotData.slice(0, 20).map((feat) => {
    const classKeys = Object.keys(feat.by_class);
    const medians = classKeys.map((c) => feat.by_class[c].median);
    const diff = Math.abs(medians[0] - (medians[1] || medians[0]));
    return {
      feature: feat.feature.length > 15 ? feat.feature.slice(0, 12) + "..." : feat.feature,
      fullName: feat.feature,
      diff,
      median0: medians[0],
      median1: medians[1] || 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Feature selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Feature Expression Box Plots
            <Badge variant="outline">Top {boxplotData.length} Features</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution of expression values across diagnostic/prognostic classes shown as box plots (median, IQR, whiskers).
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {boxplotData.slice(0, 15).map((feat, idx) => (
              <Button
                key={feat.feature}
                variant={selectedFeatureIdx === idx ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFeatureIdx(idx)}
                className="text-xs"
              >
                {feat.feature.length > 12 ? feat.feature.slice(0, 10) + "..." : feat.feature}
              </Button>
            ))}
            {boxplotData.length > 15 && (
              <span className="text-xs text-muted-foreground self-center">
                +{boxplotData.length - 15} more
              </span>
            )}
          </div>

          {/* Selected feature boxplot visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box plot chart */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">
                {selectedFeature.feature} - Expression by Class
              </h4>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="class" 
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    domain={[yMin - yPadding, yMax + yPadding]}
                    tickFormatter={(v) => v.toFixed(2)}
                    label={{ value: "Expression", angle: -90, position: "insideLeft", style: { textAnchor: "middle" } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-card p-3 rounded-lg border border-border shadow-lg text-sm">
                            <p className="font-semibold mb-1">{d.class}</p>
                            <div className="space-y-1">
                              <p>Max: <span className="font-mono">{d.max.toFixed(3)}</span></p>
                              <p>Q75: <span className="font-mono">{d.q75.toFixed(3)}</span></p>
                              <p className="font-semibold">Median: <span className="font-mono">{d.median.toFixed(3)}</span></p>
                              <p>Q25: <span className="font-mono">{d.q25.toFixed(3)}</span></p>
                              <p>Min: <span className="font-mono">{d.min.toFixed(3)}</span></p>
                              <p className="text-muted-foreground">Mean: <span className="font-mono">{d.mean.toFixed(3)}</span></p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Box representation using bars */}
                  <Bar dataKey="median" name="Median" barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CLASS_COLORS[entry.classKey] || "hsl(var(--accent))"}
                        fillOpacity={0.6}
                        stroke={CLASS_COLORS[entry.classKey] || "hsl(var(--accent))"}
                        strokeWidth={2}
                      />
                    ))}
                    <ErrorBar dataKey="iqrUpper" width={20} strokeWidth={2} stroke="hsl(var(--foreground))" direction="y" />
                    <ErrorBar dataKey="iqrLower" width={20} strokeWidth={2} stroke="hsl(var(--foreground))" direction="y" />
                  </Bar>
                  {/* Mean marker */}
                  <Scatter dataKey="mean" name="Mean" fill="hsl(var(--foreground))" shape="diamond" />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Bars show median with IQR error bars. Diamond markers indicate mean values.
              </p>
            </div>

            {/* Statistics table */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">Statistics Summary</h4>
              <div className="overflow-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">Statistic</th>
                      {classes.map((cls) => (
                        <th key={cls} className="text-right p-3">
                          <span className="inline-flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: CLASS_COLORS[cls] }}
                            />
                            {CLASS_NAMES[cls] || `Class ${cls}`}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(["max", "q75", "median", "q25", "min", "mean"] as const).map((stat) => (
                      <tr key={stat} className={`border-t border-border ${stat === "median" ? "bg-muted/30 font-semibold" : ""}`}>
                        <td className="p-3 capitalize">
                          {stat === "q25" ? "Q25 (25th %ile)" : 
                           stat === "q75" ? "Q75 (75th %ile)" : 
                           stat === "median" ? "Median (50th %ile)" : stat}
                        </td>
                        {classes.map((cls) => (
                          <td key={cls} className="text-right p-3 font-mono">
                            {selectedFeature.by_class[cls][stat].toFixed(3)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* IQR row */}
                    <tr className="border-t border-border bg-muted/20">
                      <td className="p-3">IQR (Q75-Q25)</td>
                      {classes.map((cls) => (
                        <td key={cls} className="text-right p-3 font-mono">
                          {(selectedFeature.by_class[cls].q75 - selectedFeature.by_class[cls].q25).toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Interpretation */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Interpretation:</strong> A larger separation between class medians 
                  suggests the feature has good discriminative power. Narrow IQRs indicate consistent expression within each class.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature comparison summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class Separation by Feature</CardTitle>
          <p className="text-sm text-muted-foreground">
            Absolute difference in median expression between classes for top features. Larger differences indicate better class separation.
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={summaryData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
                  value.toFixed(3),
                  `Median Diff (${props.payload.fullName})`,
                ]}
              />
              <Bar dataKey="diff" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Median Difference" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
