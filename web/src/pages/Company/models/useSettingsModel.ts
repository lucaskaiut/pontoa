import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { SettingsFormValues, SettingsMetadata } from "../types";

export function useSettingsModel(activeTab: string) {
  const [settingsForm, setSettingsForm] = useState<SettingsFormValues>({});
  const [settingsMetadata, setSettingsMetadata] = useState<SettingsMetadata>({});

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data?.data || response.data || {};
    },
    enabled: activeTab === "settings",
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const formValues: SettingsFormValues = {};
      const metadata: SettingsMetadata = {};

      Object.keys(settings).forEach((key) => {
        const setting = (settings as any)[key];
        if (setting && typeof setting === "object" && "value" in setting) {
          formValues[key] = setting.value;
          metadata[key] = {
            label: setting.label || key,
            type: setting.type || "text",
            options: setting.options,
          };
        } else {
          formValues[key] = setting;
          metadata[key] = {
            label: key,
            type: "text",
          };
        }
      });

      setSettingsForm(formValues);
      setSettingsMetadata(metadata);
    }
  }, [settings]);

  const setSettingValue = (key: string, value: any) => {
    setSettingsForm({ ...settingsForm, [key]: value });
  };

  const saveSettingsMutation = useMutation({
    mutationFn: async (payload: SettingsFormValues) => {
      await api.post("/settings", payload);
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações");
    },
  });

  const handleSaveSettings = async () => {
    await saveSettingsMutation.mutateAsync(settingsForm);
  };

  return {
    settingsForm,
    settingsMetadata,
    setSettingValue,
    handleSaveSettings,
    settingsLoading,
    isSaving: saveSettingsMutation.isPending,
  };
}


