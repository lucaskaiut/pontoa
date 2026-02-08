import classNames from "classnames";

export const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecione...",
  error,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  const normalizeValue = (val) => {
    if (val === null || val === undefined) return "";
    return String(val);
  };

  const normalizedValue = normalizeValue(value);
  const normalizedLabel = normalizeValue(label);
  const normalizedOptions = Array.isArray(options) ? options : [];

  const selectClasses = classNames(
    "w-full px-4 py-3 rounded-lg border transition-all duration-200",
    "bg-white dark:bg-dark-surface",
    "text-gray-900 dark:text-dark-text",
    "focus:outline-hidden focus:ring-2 focus:ring-offset-0",
    {
      "border-gray-300 dark:border-dark-border focus:border-primary-500 focus:ring-primary-500": !error,
      "border-danger-500 dark:border-danger-500 focus:border-danger-500 focus:ring-danger-500": error,
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  return (
    <div className="w-full">
      {normalizedLabel && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
          {normalizedLabel}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={normalizedValue}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="mt-1.5 block text-sm text-danger-600 dark:text-danger-400">
          {error}
        </span>
      )}
    </div>
  );
};

