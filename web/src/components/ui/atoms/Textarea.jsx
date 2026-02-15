import classNames from "classnames";

export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = "",
  ...props
}) => {
  const normalizeValue = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string" || typeof val === "number") return String(val);
    return String(val);
  };

  const normalizedValue = normalizeValue(value);
  const normalizedLabel = normalizeValue(label || placeholder);
  const normalizedPlaceholder = normalizeValue(placeholder);

  const textareaClasses = classNames(
    "w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none",
    "bg-white dark:bg-dark-surface",
    "text-gray-900 dark:text-dark-text",
    "placeholder-gray-400 dark:placeholder-gray-500",
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
      <textarea
        value={normalizedValue}
        onChange={onChange}
        placeholder={normalizedPlaceholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <span className="mt-1.5 block text-sm text-danger-600 dark:text-danger-400">
          {error}
        </span>
      )}
    </div>
  );
};

