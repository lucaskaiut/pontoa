import React, { useState, useEffect, useCallback } from "react";
import { maskAmount } from "../services/utils";

interface CurrencyInputProps {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
  allowZero?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "R$ 0,00",
  required = false,
  error,
  className = "",
  disabled = false,
  allowZero = false,
}: CurrencyInputProps) {
  const [maskedValue, setMaskedValue] = useState<string>("");

  useEffect(() => {
    if (value !== null && value !== undefined) {
      if (value > 0) {
        const { maskedAmount } = maskAmount(value.toString());
        const valueWithoutSymbol = maskedAmount.replace(/^R\$\s*/, "");
        setMaskedValue(valueWithoutSymbol);
      } else if (allowZero && value === 0) {
        setMaskedValue("");
      } else {
        setMaskedValue("");
      }
    } else {
      setMaskedValue("");
    }
  }, [value, allowZero]);

  const handleChange = useCallback((inputValue: string) => {
    const digitsOnly = inputValue.replace(/[^\d]+/gi, "");
    
    if (!digitsOnly || digitsOnly === "") {
      setMaskedValue("");
      onChange(null);
      return;
    }
    
    const { amount, maskedAmount } = maskAmount(inputValue);
    const valueWithoutSymbol = maskedAmount.replace(/^R\$\s*/, "");
    
    if (allowZero && amount === 0) {
      setMaskedValue("");
      onChange(0);
    } else if (amount > 0) {
      setMaskedValue(valueWithoutSymbol);
      onChange(amount);
    } else {
      setMaskedValue("");
      onChange(null);
    }
  }, [onChange, allowZero]);

  return (
    <div className={`w-full ${className}`}>
      <label className="block mb-1 text-gray-700 dark:text-dark-text">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={maskedValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 ${
          error ? "border-danger" : "border-gray-300 dark:border-dark-border"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {error && <span className="text-danger text-sm mt-1">{error}</span>}
    </div>
  );
}

