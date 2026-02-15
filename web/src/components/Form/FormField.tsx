import { Input } from "../Input";
import Multiselect from "multiselect-react-dropdown";
import classNames from "classnames";
import { FormFieldProps, ToggleOption } from "./types";

const getMultiselectStyle = (isDark: boolean): Record<string, any> => ({
  chips: { background: isDark ? '#3b82f6' : '#7b2cbf' },
  searchBox: { 
    border: isDark ? '1px solid #334155' : '1px solid #d1d5db', 
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    background: isDark ? '#1e293b' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#6b7280'
  },
  optionContainer: { 
    borderRadius: '0.375rem',
    background: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '1px solid #334155' : '1px solid #d1d5db'
  },
  option: { 
    color: isDark ? '#e2e8f0' : '#6b7280',
    background: isDark ? '#1e293b' : '#ffffff'
  },
  highlightOption: {
    background: isDark ? '#3b82f6' : '#7b2cbf'
  }
});

export function FormField({ field, value, onChange, error }: FormFieldProps) {
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

  // Normalizar valor para evitar renderização de objetos
  const normalizeValue = (val: any): string | number | boolean | null | undefined => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
    if (typeof val === 'object') {
      // Se for um objeto, tentar converter para string
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const normalizedLabel = normalizeValue(label || placeholder);
  const fieldLabel = typeof normalizedLabel === 'string' ? normalizedLabel : String(normalizedLabel || '');
  const hasError = !!error;

  if (render) {
    return render({ field, value, onChange, error });
  }

  if (type === "select") {
    const normalizedSelectValue = normalizeValue(value) || "";
    return (
      <div className={classNames("w-full", className)}>
        <label className="block mb-1 text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        <select
          name={name}
          value={normalizedSelectValue}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          className={classNames(
            "bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text",
            {
              "border-gray-300 dark:border-dark-border": !hasError,
              "border-danger": hasError,
            }
          )}
        >
          <option value="">{placeholder || "Selecione..."}</option>
          {normalizedOptions.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError && <span className="text-danger text-sm mt-1">{error}</span>}
      </div>
    );
  }

  if (type === "multiselect") {
    const isDark = document.documentElement.classList.contains('dark');
    const multiselectStyle = getMultiselectStyle(isDark);
    return (
      <div className={classNames("w-full", className)}>
        <label className="block mb-1 text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        <Multiselect
          options={normalizedOptions}
          selectedValues={value || []}
          onSelect={(selected: any) => onChange(name, selected)}
          onRemove={(selected: any) => onChange(name, selected)}
          displayValue={displayValue}
          placeholder={placeholder}
          emptyRecordMsg={emptyMessage}
          disable={disabled}
          style={multiselectStyle}
        />
        {hasError && <span className="text-danger text-sm mt-1">{error}</span>}
      </div>
    );
  }

  if (type === "toggle-group") {
    return (
      <div className={classNames("w-full", className)}>
        <label className="block mb-2 text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {normalizedOptions.map((option: ToggleOption) => {
            const currentValue = (value || []) as ToggleOption[];
            const isSelected = currentValue.some((v: ToggleOption) => v.id === option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const newValue = isSelected
                    ? currentValue.filter((v: ToggleOption) => v.id !== option.id)
                    : [...currentValue, option];
                  onChange(name, newValue);
                }}
                className={classNames(
                  "px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm",
                  {
                    "bg-primary dark:bg-blue-600 border-primary dark:border-blue-600 text-white": isSelected,
                    "bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-text hover:border-primary dark:hover:border-blue-400 hover:text-primary dark:hover:text-blue-400": !isSelected,
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
        {hasError && <span className="text-danger text-sm mt-1">{error}</span>}
      </div>
    );
  }

  if (type === "textarea") {
    const normalizedTextareaValue = normalizeValue(value) || "";
    return (
      <div className={classNames("w-full", className)}>
        <label className="block mb-1 text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        <textarea
          name={name}
          value={normalizedTextareaValue}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className={classNames(
            "bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none",
            {
              "border-gray-300 dark:border-dark-border": !hasError,
              "border-danger": hasError,
            }
          )}
        />
        {hasError && <span className="text-danger text-sm mt-1">{error}</span>}
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className={classNames("w-full flex items-center gap-2", className)}>
        <input
          type="checkbox"
          name={name}
          checked={!!value}
          onChange={(e) => onChange(name, e.target.checked)}
          disabled={disabled}
          className="w-5 h-5 accent-primary"
        />
        <label className="text-gray-700 dark:text-dark-text">
          {fieldLabel}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        {hasError && <span className="text-danger text-sm ml-2">{error}</span>}
      </div>
    );
  }

  const normalizedInputValue = normalizeValue(value) || "";
  return (
    <div className={classNames("w-full", className)}>
      <Input
        type={type}
        name={name}
        label={fieldLabel}
        placeholder={placeholder}
        value={normalizedInputValue}
        onChange={(e) => onChange(name, e.target.value)}
        mask={mask}
        disabled={disabled}
        required={required}
      />
      {hasError && <span className="text-danger text-sm mt-1">{error}</span>}
    </div>
  );
}

