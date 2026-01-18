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
} from "recharts";
import type { MLResults, FeatureBoxplotClassStats } from "@/types/ml-results";

interface FeatureExpressionBoxplotTabProps {
  data: MLResults;
}

const CLASS_COLORS: Record<string, string> = {
  "0": "hsl(var(--primary))",
  "1": "hsl(var(--destructive))",
};

const CLASS_NAMES: Record<string, string> = {
  "0": "Negative",
  "1": "Positive",
};

interface FeatureBoxplotData {
  feature: string;
  by_class: Record<string, { mean: number; median: number; q25: number; q75: number; min: number; max: number; n: number }>;
}

// Custom Box Plot component using SVG
const BoxPlotVisualization = ({
  data,
  classes,
  yDomain,
  classColors,
  classNames,
}: {
  data: FeatureBoxplotData;
  classes: string[];
  yDomain: [number, number];
  classColors: Record<string, string>;
  classNames: Record<string, string>;
}) => {
  const width = 400;
  const height = 350;
  const margin = { top: 30, right: 40, left: 60, bottom: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const boxWidth = Math.min(80, plotWidth / classes.length - 20);
  const [yMin, yMax] = yDomain;
  const yRange = yMax - yMin;

  const scaleY = (value: number) => {
    return plotHeight - ((value - yMin) / yRange) * plotHeight;
  };

  const xPositions = classes.map((_, i) => {
    const spacing = plotWidth / (classes.length + 1);
    return spacing * (i + 1);
  });

  // Generate Y-axis ticks
  const yTicks = [];
  const tickCount = 6;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(yMin + (yRange * i) / tickCount);
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        {classes.map((cls) => (
          <linearGradient key={`gradient-${cls}`} id={`boxGradient-${cls}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={classColors[cls] || "hsl(var(--accent))"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={classColors[cls] || "hsl(var(--accent))"} stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      {/* Background grid */}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {yTicks.map((tick) => (
          <line
            key={tick}
            x1={0}
            y1={scaleY(tick)}
            x2={plotWidth}
            y2={scaleY(tick)}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
        ))}
      </g>

      {/* Y-axis */}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        <line x1={0} y1={0} x2={0} y2={plotHeight} stroke="hsl(var(--muted-foreground))" />
        {yTicks.map((tick) => (
          <g key={tick} transform={`translate(0, ${scaleY(tick)})`}>
            <line x1={-5} y1={0} x2={0} y2={0} stroke="hsl(var(--muted-foreground))" />
            <text
              x={-10}
              y={0}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-muted-foreground"
            >
              {tick.toFixed(2)}
            </text>
          </g>
        ))}
        <text
          x={-margin.left + 15}
          y={plotHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${-margin.left + 15}, ${plotHeight / 2})`}
          className="text-sm fill-muted-foreground font-medium"
        >
          Expression
        </text>
      </g>

      {/* X-axis */}
      <g transform={`translate(${margin.left}, ${margin.top + plotHeight})`}>
        <line x1={0} y1={0} x2={plotWidth} y2={0} stroke="hsl(var(--muted-foreground))" />
        {classes.map((cls, i) => (
          <text
            key={cls}
            x={xPositions[i]}
            y={25}
            textAnchor="middle"
            className="text-sm fill-foreground font-medium"
          >
            {classNames[cls] || `Class ${cls}`}
          </text>
        ))}
      </g>

      {/* Box plots */}
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {classes.map((cls, i) => {
          const stats = data.by_class[cls];
          if (!stats) return null;

          const cx = xPositions[i];
          const halfBox = boxWidth / 2;

          const yMedian = scaleY(stats.median);
          const yQ25 = scaleY(stats.q25);
          const yQ75 = scaleY(stats.q75);
          const yMin = scaleY(stats.min);
          const yMax = scaleY(stats.max);
          const yMean = scaleY(stats.mean);

          const color = classColors[cls] || "hsl(var(--accent))";

          return (
            <g key={cls} className="transition-opacity hover:opacity-80">
              {/* Whisker line (min to max) */}
              <line
                x1={cx}
                y1={yMin}
                x2={cx}
                y2={yMax}
                stroke={color}
                strokeWidth={2}
              />

              {/* Min cap */}
              <line
                x1={cx - halfBox / 2}
                y1={yMin}
                x2={cx + halfBox / 2}
                y2={yMin}
                stroke={color}
                strokeWidth={2}
              />

              {/* Max cap */}
              <line
                x1={cx - halfBox / 2}
                y1={yMax}
                x2={cx + halfBox / 2}
                y2={yMax}
                stroke={color}
                strokeWidth={2}
              />

              {/* IQR Box (Q25 to Q75) */}
              <rect
                x={cx - halfBox}
                y={Math.min(yQ25, yQ75)}
                width={boxWidth}
                height={Math.abs(yQ75 - yQ25)}
                fill={`url(#boxGradient-${cls})`}
                stroke={color}
                strokeWidth={2}
                rx={4}
              />

              {/* Median line */}
              <line
                x1={cx - halfBox}
                y1={yMedian}
                x2={cx + halfBox}
                y2={yMedian}
                stroke={color}
                strokeWidth={3}
              />

              {/* Mean marker (diamond) */}
              <polygon
                points={`${cx},${yMean - 6} ${cx + 6},${yMean} ${cx},${yMean + 6} ${cx - 6},${yMean}`}
                fill="hsl(var(--foreground))"
                stroke="hsl(var(--background))"
                strokeWidth={1}
              />

              {/* Sample size label */}
              <text
                x={cx}
                y={plotHeight + 42}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                n={stats.n}
              </text>
            </g>
          );
        })}
      </g>

      {/* Legend */}
      <g transform={`translate(${width - margin.right + 10}, ${margin.top})`}>
        <rect x={-5} y={-5} width={35} height={55} fill="hsl(var(--card))" rx={4} />
        <line x1={0} y1={5} x2={20} y2={5} stroke="hsl(var(--foreground))" strokeWidth={3} />
        <text x={25} y={9} className="text-xs fill-muted-foreground">Median</text>
        <polygon
          points="10,25 16,30 10,35 4,30"
          fill="hsl(var(--foreground))"
        />
        <text x={25} y={33} className="text-xs fill-muted-foreground">Mean</text>
      </g>
    </svg>
  );
};

export function FeatureExpressionBoxplotTab({ data }: FeatureExpressionBoxplotTabProps) {
  // Convert the R script's format to a usable format
  const boxplotData = useMemo<FeatureBoxplotData[]>(() => {
    const rawStats = data.feature_boxplot_stats;
    if (!rawStats) return [];
    
    return Object.entries(rawStats).map(([feature, classStats]) => {
      const byClass: Record<string, { mean: number; median: number; q25: number; q75: number; min: number; max: number; n: number }> = {};
      classStats.forEach((cs: FeatureBoxplotClassStats) => {
        byClass[cs.class] = {
          mean: cs.mean,
          median: cs.median,
          q25: cs.q1,
          q75: cs.q3,
          min: cs.min,
          max: cs.max,
          n: cs.n,
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

  // Calculate Y axis domain
  const allValues = classes.flatMap(cls => {
    const stats = selectedFeature.by_class[cls];
    return [stats.min, stats.max];
  });
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
            {/* SVG Box plot */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">
                {selectedFeature.feature} - Expression by Class
              </h4>
              <div className="flex justify-center">
                <BoxPlotVisualization
                  data={selectedFeature}
                  classes={classes}
                  yDomain={[yMin - yPadding, yMax + yPadding]}
                  classColors={CLASS_COLORS}
                  classNames={CLASS_NAMES}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Box shows IQR (Q25-Q75), line shows median, diamond shows mean, whiskers show min/max.
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
                    {/* N row */}
                    <tr className="border-t border-border">
                      <td className="p-3">Sample Size (n)</td>
                      {classes.map((cls) => (
                        <td key={cls} className="text-right p-3 font-mono">
                          {selectedFeature.by_class[cls].n}
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
              <Bar dataKey="diff" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Median Difference">
                {summaryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`hsl(var(--primary) / ${0.4 + (index / summaryData.length) * 0.6})`}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
