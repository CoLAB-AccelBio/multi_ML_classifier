import { useState, forwardRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { SplitSquareVertical, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface TrainRatioSelectorProps {
  className?: string;
}

const PRESET_RATIOS = [
  { value: 0.6, label: "60/40" },
  { value: 0.7, label: "70/30" },
  { value: 0.8, label: "80/20" },
  { value: 0.9, label: "90/10" },
];

export const TrainRatioSelector = forwardRef<HTMLDivElement, TrainRatioSelectorProps>(
  ({ className }, ref) => {
    const [trainRatio, setTrainRatio] = useState(0.7);
    const [copied, setCopied] = useState(false);

    const trainPct = Math.round(trainRatio * 100);
    const testPct = 100 - trainPct;

    const handleCopyCommand = () => {
      const command = `--train_ratio ${trainRatio}`;
      navigator.clipboard.writeText(command);
      setCopied(true);
      toast.success("Copied to clipboard!", {
        description: `Add "${command}" to your R script command`,
      });
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div ref={ref} className={className}>
        <div className="flex items-center gap-2 mb-3">
          <SplitSquareVertical className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-medium">Training/Testing Split</h4>
        </div>
        
        <div className="space-y-4">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESET_RATIOS.map((preset) => (
              <Button
                key={preset.value}
                variant={trainRatio === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTrainRatio(preset.value)}
                className="h-8"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>Custom ratio</span>
              <span>90%</span>
            </div>
            <Slider
              value={[trainRatio * 100]}
              onValueChange={([val]) => setTrainRatio(val / 100)}
              min={50}
              max={90}
              step={5}
              className="w-full"
            />
          </div>

          {/* Visual split indicator */}
          <div className="flex items-stretch h-8 rounded-lg overflow-hidden border border-border">
            <div 
              className="bg-primary/30 flex items-center justify-center text-xs font-medium transition-all duration-300"
              style={{ width: `${trainPct}%` }}
            >
              Train {trainPct}%
            </div>
            <div 
              className="bg-secondary/30 flex items-center justify-center text-xs font-medium transition-all duration-300"
              style={{ width: `${testPct}%` }}
            >
              Test {testPct}%
            </div>
          </div>

          {/* Command to copy */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            <code className="flex-1 text-xs font-mono text-muted-foreground">
              --train_ratio {trainRatio}
            </code>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopyCommand}
              className="h-7 px-2 gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Add this parameter when running the CV R script to customize the train/test split ratio.
          </p>
        </div>
      </div>
    );
  }
);

TrainRatioSelector.displayName = "TrainRatioSelector";
