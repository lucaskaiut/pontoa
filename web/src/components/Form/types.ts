import { ReactNode } from "react";

export type FieldType = 
  | "text" 
  | "email" 
  | "password" 
  | "time" 
  | "date" 
  | "number" 
  | "select" 
  | "multiselect" 
  | "toggle-group" 
  | "textarea" 
  | "checkbox"
  | "custom";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface ToggleOption {
  id: string | number;
  name?: string;
  short?: string;
  [key: string]: any;
}

export interface FormFieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  options?: SelectOption[] | ToggleOption[] | any[];
  displayValue?: string;
  emptyMessage?: string;
  colSpan?: number | "full";
  className?: string;
  required?: boolean;
  disabled?: boolean;
  mask?: string;
  render?: (props: FormFieldRenderProps) => ReactNode;
}

export interface FormFieldRenderProps {
  field: FormFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

export interface FormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

export interface FormProps<T = Record<string, any>> {
  fields: FormFieldConfig[];
  values: T;
  onChange: (name: keyof T, value: any) => void;
  onSubmit?: (values: T) => void | Promise<void>;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  showSubmitButton?: boolean;
  gridCols?: 1 | 2 | 3 | 4;
  className?: string;
  children?: ReactNode;
}

export interface ValidationRule {
  required?: boolean;
  requiredMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: any, allValues: Record<string, any>) => string | null | undefined;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface UseFormReturn<T = Record<string, any>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  setAllValues: (newValues: T) => void;
  setErrors: (errors: Record<string, string>) => void;
  reset: () => void;
  validate: (rules: ValidationRules) => boolean;
}

