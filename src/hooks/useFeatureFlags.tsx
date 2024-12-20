import { createEffect, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

export function useFeatureFlags() {
  const [flags, setFlags] = createSignal<FeatureFlag[]>([
    {
      id: "message-box-live-preview",
      name: "Message box live preview",
      description: "Enables live preview of message boxes in the message editor.",
      checked: false,
    },
    {
      id: "wip-editor",
      name: "WIP Editor",
      description: "Enables the work-in-progress editor with improved features and UI (No saving).",
      checked: false,
    }
  ]);

  // Load feature flags from storage on mount
  createEffect(async () => {
    try {
      const setting: { String: string } = await invoke("get_setting", {
        key: "feature_flags",
      });
      
      if (setting.String) {
        const savedFlags = JSON.parse(setting.String);
        setFlags(
          flags().map((flag) => ({
            ...flag,
            checked: savedFlags.find((f: FeatureFlag) => f.id === flag.id)?.checked ?? flag.checked,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load feature flags:", error);
    }
  });

  // Helper function to check if a feature flag is enabled
  const isEnabled = (flagId: string) => {
    const flag = flags().find(f => f.id === flagId);
    return flag?.checked ?? false;
  };

  // Expose specific feature flags as computed values
  const newEditor = () => isEnabled("wip-editor");
  const livePreview = () => isEnabled("message-box-live-preview");

  // Function to update a feature flag
  const updateFlag = async (flagId: string, checked: boolean) => {
    setFlags(prev => 
      prev.map(flag => 
        flag.id === flagId ? { ...flag, checked } : flag
      )
    );

    try {
      await invoke("set_string_setting", {
        key: "feature_flags",
        value: JSON.stringify(flags()),
      });
    } catch (error) {
      console.error("Failed to save feature flags:", error);
    }
  };

  return {
    flags,
    newEditor,
    livePreview,
    updateFlag,
    isEnabled
  };
} 