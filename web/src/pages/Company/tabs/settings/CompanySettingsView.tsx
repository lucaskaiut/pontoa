import React from "react";
import { Input } from "../../../components/Input";
import classNames from "classnames";
import { SettingsFormValues, SettingsMetadata } from "../../types";

interface CompanySettingsViewProps {
  settingsForm: SettingsFormValues;
  settingsMetadata: SettingsMetadata;
  setSettingValue: (key: string, value: any) => void;
  handleSaveSettings: () => void;
  settingsLoading: boolean;
  isSaving: boolean;
}

export function CompanySettingsView({
  settingsForm,
  settingsMetadata,
  setSettingValue,
  handleSaveSettings,
  settingsLoading,
  isSaving,
}: CompanySettingsViewProps) {
  const renderSettingField = (key: string) => {
    const value = settingsForm[key];
    const metadata = settingsMetadata[key] || { label: key, type: "text" };
    const type = metadata.type?.toLowerCase() || "text";

    if (type === "boolean" || type === "bool") {
      return (
        <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-dark-text">{metadata.label}</span>
          </div>
          <button
            type="button"
            onClick={() => setSettingValue(key, !value)}
            className={classNames(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              {
                "bg-primary dark:bg-blue-600": value,
                "bg-gray-300 dark:bg-gray-600": !value,
              }
            )}
          >
            <span
              className={classNames(
                "inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform",
                {
                  "translate-x-6": value,
                  "translate-x-1": !value,
                }
              )}
            />
          </button>
        </div>
      );
    }

    if (type === "multiselect") {
      const arrayValue = Array.isArray(value) ? value : [];
      const options = metadata.options || [];

      return (
        <div className="w-full">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
            {metadata.label}
          </label>
          <div className="space-y-2">
            {options.map((option: { value: string; label: string }) => {
              const isChecked = arrayValue.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettingValue(key, [...arrayValue, option.value]);
                      } else {
                        setSettingValue(
                          key,
                          arrayValue.filter((v: string) => v !== option.value)
                        );
                      }
                    }}
                    className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-dark-surface dark:border-dark-border"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-dark-text">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === "array") {
      const arrayValue = Array.isArray(value) ? value : [];
      const arrayString = JSON.stringify(arrayValue, null, 2);

      return (
        <div className="w-full">
          <label className="block mb-1 text-gray-700 dark:text-dark-text">{metadata.label}</label>
          <textarea
            value={arrayString}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (Array.isArray(parsed)) {
                  setSettingValue(key, parsed);
                } else {
                  setSettingValue(key, [parsed]);
                }
              } catch {
                const lines = e.target.value.split("\n").filter((line) => line.trim());
                setSettingValue(key, lines);
              }
            }}
            placeholder='["item1", "item2"]'
            rows={4}
            className={classNames(
              "bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none font-mono text-sm",
              "border-gray-300 dark:border-dark-border"
            )}
          />
        </div>
      );
    }

    if (type === "int" || type === "integer" || type === "float" || type === "double") {
      return (
        <Input
          type="number"
          label={metadata.label}
          placeholder=""
          onChange={(event) => {
            const numValue =
              type === "float" || type === "double" ? parseFloat(event.target.value) : parseInt(event.target.value, 10);
            setSettingValue(key, isNaN(numValue) ? 0 : numValue);
          }}
          value={value ?? ""}
        />
      );
    }

    if (type === "json") {
      return (
        <div className="w-full">
          <label className="block mb-1 text-gray-700 dark:text-dark-text">{metadata.label}</label>
          <textarea
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setSettingValue(key, parsed);
              } catch {
                setSettingValue(key, e.target.value);
              }
            }}
            placeholder=""
            rows={4}
            className={classNames(
              "bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none",
              "border-gray-300 dark:border-dark-border"
            )}
          />
        </div>
      );
    }

    return (
      <Input
        type="text"
        label={metadata.label}
        placeholder=""
        onChange={(event) => setSettingValue(key, event.target.value)}
        value={value ?? ""}
      />
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      {settingsLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(settingsForm).map((key) => (
            <div key={key} className="w-full">
              {renderSettingField(key)}
            </div>
          ))}
          {Object.keys(settingsForm).length === 0 && !settingsLoading && (
            <p className="text-gray-500 col-span-full">Nenhuma configuração disponível.</p>
          )}
        </div>
      )}
    </div>
  );
}


