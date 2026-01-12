import { useState, useEffect, useCallback } from "react";

export interface ThresholdConfig {
  id: string;
  name: string;
  thresholds: Record<string, number>;
  createdAt: string;
}

const STORAGE_KEY = "ml-dashboard-threshold-configs";

export function useThresholdConfig() {
  const [savedConfigs, setSavedConfigs] = useState<ThresholdConfig[]>([]);

  // Load configs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedConfigs(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load threshold configs:", e);
    }
  }, []);

  // Save config
  const saveConfig = useCallback((name: string, thresholds: Record<string, number>) => {
    const newConfig: ThresholdConfig = {
      id: crypto.randomUUID(),
      name,
      thresholds,
      createdAt: new Date().toISOString(),
    };

    setSavedConfigs((prev) => {
      const updated = [...prev, newConfig];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return newConfig;
  }, []);

  // Delete config
  const deleteConfig = useCallback((id: string) => {
    setSavedConfigs((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Load config (returns thresholds to apply)
  const loadConfig = useCallback((id: string): Record<string, number> | null => {
    const config = savedConfigs.find((c) => c.id === id);
    return config?.thresholds ?? null;
  }, [savedConfigs]);

  // Export all configs as JSON
  const exportConfigs = useCallback(() => {
    const blob = new Blob([JSON.stringify(savedConfigs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "threshold-configs.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [savedConfigs]);

  // Import configs from JSON
  const importConfigs = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as ThresholdConfig[];
        if (Array.isArray(imported)) {
          setSavedConfigs((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newConfigs = imported.filter((c) => !existingIds.has(c.id));
            const updated = [...prev, ...newConfigs];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to import configs:", err);
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    savedConfigs,
    saveConfig,
    deleteConfig,
    loadConfig,
    exportConfigs,
    importConfigs,
  };
}
