import { Input, Textarea, Select } from "../atoms";
import Multiselect from "multiselect-react-dropdown";
import classNames from "classnames";

const getMultiselectStyle = (isDark) => ({
  chips: { background: isDark ? "#9333ea" : "#9333ea" },
  searchBox: {
    border: isDark ? "1px solid #334155" : "1px solid #d1d5db",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    background: isDark ? "#1e293b" : "#ffffff",
    color: isDark ? "#e2e8f0" : "#6b7280",
  },
  optionContainer: {
    borderRadius: "0.5rem",
    background: isDark ? "#1e293b" : "#ffffff",
    border: isDark ? "1px solid #334155" : "1px solid #d1d5db",
  },
  option: {
    color: isDark ? "#e2e8f0" : "#6b7280",
    background: isDark ? "#1e293b" : "#ffffff",
  },
  highlightOption: {
    background: isDark ? "#9333ea" : "#9333ea",
  },
});

export function FormField({ field, value, onChange, error }) {
  const {
    name,
    type,
    label,
    placeholder,
    options = [],
    displayValue = "name",
    emptyMessage = "Não há mais opções",
    mask,
    disabled = false,
    required = false,
    className = "",
    render,
  } = field;

  const normalizedOptions = Array.isArray(options) ? options : [];

  const normalizeValue = (val) => {
    if (val === null || val === undefined) return val;
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean")
      return val;
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const fieldLabel = label || placeholder;
  const hasError = !!error;

  if (render) {
    return render({ field, value, onChange, error });
  }

  if (type === "select") {
    const normalizedSelectValue = normalizeValue(value) || "";
    const selectOptions = normalizedOptions.map((option) => ({
      value: option.value,
      label: option.label || option.name || String(option.value),
    }));

    return (
      <div className={classNames("w-full", className)}>
        <Select
          label={fieldLabel}
          value={normalizedSelectValue}
          onChange={(e) => onChange(name, e.target.value)}
          options={selectOptions}
          placeholder={placeholder || "Selecione..."}
          error={error}
          disabled={disabled}
          required={required}
        />
      </div>
    );
  }

  if (type === "multiselect") {
    const isDark = document.documentElement.classList.contains("dark");
    const multiselectStyle = getMultiselectStyle(isDark);
    return (
      <div className={classNames("w-full", className)}>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
        <Multiselect
          options={normalizedOptions}
          selectedValues={value || []}
          onSelect={(selected) => onChange(name, selected)}
          onRemove={(selected) => onChange(name, selected)}
          displayValue={displayValue}
          placeholder={placeholder}
          emptyRecordMsg={emptyMessage}
          disable={disabled}
          style={multiselectStyle}
        />
        {hasError && (
          <span className="mt-1.5 block text-sm text-danger-600 dark:text-danger-400">
            {error}
          </span>
        )}
      </div>
    );
  }

  if (type === "toggle-group") {
    return (
      <div className={classNames("w-full", className)}>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {normalizedOptions.map((option) => {
            const currentValue = value || [];
            const isSelected = currentValue.some((v) => v.id === option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const newValue = isSelected
                    ? currentValue.filter((v) => v.id !== option.id)
                    : [...currentValue, option];
                  onChange(name, newValue);
                }}
                className={classNames(
                  "px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm",
                  {
                    "bg-primary-600 dark:bg-primary-600 border-primary-600 dark:border-primary-600 text-white":
                      isSelected,
                    "bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-text hover:border-primary-500 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400":
                      !isSelected,
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
              >
                <span className="hidden sm:inline">
                  {option[displayValue] || option.name || String(option.id)}
                </span>
                <span className="sm:hidden">
                  {option.short || option[displayValue] || option.name || String(option.id)}
                </span>
              </button>
            );
          })}
        </div>
        {hasError && (
          <span className="mt-1.5 block text-sm text-danger-600 dark:text-danger-400">
            {error}
          </span>
        )}
      </div>
    );
  }

  if (type === "textarea") {
    const normalizedTextareaValue = normalizeValue(value) || "";
    return (
      <div className={classNames("w-full", className)}>
        <Textarea
          label={fieldLabel}
          value={normalizedTextareaValue}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          error={error}
          disabled={disabled}
          required={required}
        />
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={classNames("w-full flex items-center gap-3", className)}>
        <input
          type="checkbox"
          name={name}
          checked={!!value}
          onChange={(e) => onChange(name, e.target.checked)}
          disabled={disabled}
          className="w-5 h-5 rounded border-gray-300 dark:border-dark-border text-primary-600 focus:ring-primary-500 focus:ring-2"
        />
        <label className="text-sm font-medium text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
        {hasError && (
          <span className="text-danger-600 dark:text-danger-400 text-sm ml-auto">
            {error}
          </span>
        )}
      </div>
    );
  }

  const normalizedInputValue = normalizeValue(value) || "";
  return (
    <div className={classNames("w-full", className)}>
      <Input
        type={type}
        label={fieldLabel}
        placeholder={placeholder}
        value={normalizedInputValue}
        onChange={(e) => onChange(name, e.target.value)}
        mask={mask}
        error={error}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

