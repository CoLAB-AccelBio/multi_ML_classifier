import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, FolderOpen, Trash2, Download, Upload } from "lucide-react";
import { useThresholdConfig, ThresholdConfig } from "@/hooks/useThresholdConfig";
import { cn } from "@/lib/utils";

interface ThresholdConfigManagerProps {
  currentThresholds: Record<string, number>;
  onLoadConfig: (thresholds: Record<string, number>) => void;
}

export function ThresholdConfigManager({
  currentThresholds,
  onLoadConfig,
}: ThresholdConfigManagerProps) {
  const [configName, setConfigName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    savedConfigs,
    saveConfig,
    deleteConfig,
    loadConfig,
    exportConfigs,
    importConfigs,
  } = useThresholdConfig();

  const handleSave = () => {
    if (!configName.trim()) return;
    saveConfig(configName.trim(), currentThresholds);
    setConfigName("");
  };

  const handleLoad = (config: ThresholdConfig) => {
    const thresholds = loadConfig(config.id);
    if (thresholds) {
      onLoadConfig(thresholds);
      setIsOpen(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importConfigs(file);
      e.target.value = "";
    }
  };

  const hasThresholds = Object.keys(currentThresholds).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FolderOpen className="w-4 h-4" />
          Threshold Configs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Threshold Configurations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save current config */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Save Current Configuration</p>
            <div className="flex gap-2">
              <Input
                placeholder="Configuration name..."
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                disabled={!hasThresholds}
              />
              <Button 
                onClick={handleSave} 
                disabled={!configName.trim() || !hasThresholds}
                size="icon"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
            {!hasThresholds && (
              <p className="text-xs text-muted-foreground">
                Adjust some thresholds first to save a configuration.
              </p>
            )}
          </div>

          {/* Saved configs list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Saved Configurations</p>
              <div className="flex gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImport}
                  accept=".json"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => fileInputRef.current?.click()}
                  title="Import configs"
                >
                  <Upload className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={exportConfigs}
                  disabled={savedConfigs.length === 0}
                  title="Export configs"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {savedConfigs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No saved configurations yet.
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {savedConfigs.map((config) => (
                    <div
                      key={config.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        "bg-muted/30 hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{config.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {Object.keys(config.thresholds).length} models •{" "}
                          {new Date(config.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleLoad(config)}
                          title="Load configuration"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteConfig(config.id)}
                          title="Delete configuration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
