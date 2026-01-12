import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MLResults } from "@/types/ml-results";

interface FeatureImportanceStabilityTabProps {
  data: MLResults;
}

export function FeatureImportanceStabilityTab({ data }: FeatureImportanceStabilityTabProps) {
  const rows = data.feature_importance_stability ?? null;

  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Importance Stability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No stability data available. Re-run the R script (full or fast) with the updated exporter to include
            per-fold feature importance stability.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Feature Importance Stability
            <Badge variant="outline">From CV</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tracks how feature ranks vary across CV folds (lower mean rank + lower SD = more stable).
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead className="text-right">Mean rank</TableHead>
                  <TableHead className="text-right">SD rank</TableHead>
                  <TableHead className="text-right">Top-N freq</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((r) => (
                  <TableRow key={r.feature}>
                    <TableCell className="font-mono text-xs">{r.feature}</TableCell>
                    <TableCell className="text-right font-mono">{r.mean_rank.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">{r.sd_rank.toFixed(1)}</TableCell>
                    <TableCell className="text-right font-mono">{(r.top_n_frequency * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
