import classNames from "classnames";
import InputMask from "react-input-mask";

export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  mask,
  className = "",
  ...props
}) => {
  const normalizeValue = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string" || typeof val === "number") return String(val);
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const normalizedValue = normalizeValue(value);
  const normalizedLabel = normalizeValue(label || placeholder);
  const normalizedPlaceholder = normalizeValue(placeholder);

  const inputClasses = classNames(
    "w-full px-4 py-3 rounded-lg border transition-all duration-200",
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

  const InputComponent = mask ? InputMask : "input";

  return (
    <div className="w-full">
      {normalizedLabel && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
          {normalizedLabel}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <InputComponent
        type={type}
        mask={mask}
        value={normalizedValue}
        onChange={onChange}
        placeholder={normalizedPlaceholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
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

