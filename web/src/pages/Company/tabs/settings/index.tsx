import React from "react";
import { CompanySettingsView } from "./CompanySettingsView";
import { useSettingsModel } from "../models/useSettingsModel";

interface CompanySettingsTabProps {
  activeTab: string;
}

export function CompanySettingsTab({ activeTab }: CompanySettingsTabProps) {
  const {
    settingsForm,
    settingsMetadata,
    setSettingValue,
    handleSaveSettings,
    settingsLoading,
    isSaving,
  } = useSettingsModel(activeTab);

  return (
    <CompanySettingsView
      settingsForm={settingsForm}
      settingsMetadata={settingsMetadata}
      setSettingValue={setSettingValue}
      handleSaveSettings={handleSaveSettings}
      settingsLoading={settingsLoading}
      isSaving={isSaving}
    />
  );
}


