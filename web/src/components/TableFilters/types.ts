export type FilterType = "date" | "dateRange" | "select" | "multiselect" | "text";

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface TableFilter {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  dateFrom?: string;
  dateTo?: string;
  allowSingleDate?: boolean;
}

export interface TableFiltersProps {
  filters: TableFilter[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear?: () => void;
  className?: string;
}

