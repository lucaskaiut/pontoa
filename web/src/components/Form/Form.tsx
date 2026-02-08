import { useState, useCallback, FormEvent } from "react";
import { FormField } from "../ui/molecules/FormField";
import { Button } from "../ui/atoms/Button";
import classNames from "classnames";
import { FormProps, UseFormReturn, ValidationRules } from "./types";

const gridClassMap: Record<1 | 2 | 3 | 4, string> = {
  1: "grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
};

export function Form<T extends Record<string, any> = Record<string, any>>({
  fields,
  values,
  onChange,
  onSubmit,
  errors = {},
  isSubmitting = false,
  submitLabel = "Salvar",
  submittingLabel = "Salvando...",
  showSubmitButton = true,
  gridCols = 3,
  className = "",
  children,
}: FormProps<T>) {
  const handleFieldChange = useCallback((name: string, value: any) => {
    onChange(name as keyof T, value);
  }, [onChange]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(values);
    }
  };

  // Normalizar valor para evitar renderização de objetos
  const normalizeFormValue = (val: any): any => {
    if (val === null || val === undefined) return val;
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
    if (Array.isArray(val)) return val;
    if (typeof val === 'object') {
      // Para objetos, retornar como está se for um objeto complexo (arrays, objetos de configuração)
      // Mas garantir que não seja renderizado diretamente
      return val;
    }
    return String(val);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={classNames("grid grid-cols-1 gap-4", gridClassMap[gridCols])}>
        {fields.map((field) => {
          let colSpanClass = "";
          if (field.colSpan) {
            if (field.colSpan === 'full') {
              if (gridCols === 1) {
                colSpanClass = "col-span-1";
              } else if (gridCols === 2) {
                colSpanClass = "col-span-1 md:col-span-2";
              } else if (gridCols === 3) {
                colSpanClass = "col-span-1 md:col-span-2 lg:col-span-3";
              } else if (gridCols === 4) {
                colSpanClass = "col-span-1 md:col-span-2 lg:col-span-4";
              }
            } else if (field.colSpan === 2) {
              colSpanClass = "col-span-1 md:col-span-2";
            } else if (field.colSpan === 3) {
              colSpanClass = "col-span-1 md:col-span-2 lg:col-span-3";
            }
          }
          
          const fieldValue = values[field.name as keyof T];
          const normalizedValue = field.type === 'custom' || field.render 
            ? fieldValue 
            : normalizeFormValue(fieldValue);
          
          return (
            <FormField
              key={field.name}
              field={{ ...field, className: colSpanClass }}
              value={normalizedValue}
              onChange={handleFieldChange}
              error={errors[field.name]}
            />
          );
        })}
      </div>

      {children}

      {showSubmitButton && (
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="md"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

export function useForm<T extends Record<string, any> = Record<string, any>>(
  initialValues: T = {} as T
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value } as T));
    setTouched(prev => ({ ...prev, [name as string]: true }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name as string]: error }));
  }, []);

  const setAllValues = useCallback((newValues: T) => {
    setValues(newValues);
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validate = useCallback((validationRules: ValidationRules): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(validationRules).forEach((fieldName) => {
      const rules = validationRules[fieldName];
      const value = values[fieldName as keyof T];

      if (rules.required && !value) {
        newErrors[fieldName] = rules.requiredMessage || "Campo obrigatório";
        return;
      }

      if (rules.minLength && value && typeof value === 'string' && value.length < rules.minLength) {
        newErrors[fieldName] = rules.minLengthMessage || `Mínimo de ${rules.minLength} caracteres`;
        return;
      }

      if (rules.maxLength && value && typeof value === 'string' && value.length > rules.maxLength) {
        newErrors[fieldName] = rules.maxLengthMessage || `Máximo de ${rules.maxLength} caracteres`;
        return;
      }

      if (rules.pattern && value && typeof value === 'string' && !rules.pattern.test(value)) {
        newErrors[fieldName] = rules.patternMessage || "Formato inválido";
        return;
      }

      if (rules.custom && value) {
        const customError = rules.custom(value, values as Record<string, any>);
        if (customError) {
          newErrors[fieldName] = customError;
          return;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldError,
    setAllValues,
    setErrors,
    reset,
    validate,
  };
}

