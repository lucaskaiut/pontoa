import React, { useState, useMemo } from "react";
import { TableFiltersProps } from "./types";
import { Drawer } from "../Drawer";
import moment from "moment";

export function TableFilters({
  filters,
  values,
  onChange,
  onClear,
  className = "",
}: TableFiltersProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDateChange = (key: string, value: string, isFrom: boolean) => {
    const filter = filters.find((f) => f.key === key);
    if (!filter) return;

    if (filter.type === "dateRange") {
      const currentFrom = values[filter.dateFrom || `${key}_from`] || "";
      const currentTo = values[filter.dateTo || `${key}_to`] || "";

      if (isFrom) {
        onChange(filter.dateFrom || `${key}_from`, value);
        if (!filter.allowSingleDate && value && (!currentTo || value > currentTo)) {
          onChange(filter.dateTo || `${key}_to`, value);
        }
      } else {
        onChange(filter.dateTo || `${key}_to`, value);
      }
    } else if (filter.type === "date") {
      onChange(key, value);
    }
  };

  const handleSelectChange = (key: string, value: string) => {
    onChange(key, value === "" ? undefined : value);
  };

  const handleTextChange = (key: string, value: string) => {
    onChange(key, value === "" ? undefined : value);
  };

  const activeFilters = useMemo(() => {
    const active: Array<{ label: string; value: string; key: string }> = [];

    filters.forEach((filter) => {
      if (filter.type === "dateRange") {
        const fromKey = filter.dateFrom || `${filter.key}_from`;
        const toKey = filter.dateTo || `${filter.key}_to`;
        const fromValue = values[fromKey];
        const toValue = values[toKey];

        if (fromValue || toValue) {
          if (fromValue && toValue) {
            active.push({
              label: filter.label,
              value: `${moment(fromValue).format("DD/MM/YYYY")} - ${moment(toValue).format("DD/MM/YYYY")}`,
              key: filter.key,
            });
          } else if (fromValue) {
            active.push({
              label: filter.label,
              value: `A partir de ${moment(fromValue).format("DD/MM/YYYY")}`,
              key: filter.key,
            });
          } else if (toValue) {
            active.push({
              label: filter.label,
              value: `Até ${moment(toValue).format("DD/MM/YYYY")}`,
              key: filter.key,
            });
          }
        }
      } else if (filter.type === "date") {
        const value = values[filter.key];
        if (value) {
          active.push({
            label: filter.label,
            value: moment(value).format("DD/MM/YYYY"),
            key: filter.key,
          });
        }
      } else if (filter.type === "select") {
        const value = values[filter.key];
        if (value) {
          const option = filter.options?.find((opt) => String(opt.value) === String(value));
          if (option) {
            active.push({
              label: filter.label,
              value: option.label,
              key: filter.key,
            });
          }
        }
      } else if (filter.type === "text") {
        const value = values[filter.key];
        if (value) {
          active.push({
            label: filter.label,
            value: value,
            key: filter.key,
          });
        }
      }
    });

    return active;
  }, [filters, values]);

  const hasActiveFilters = activeFilters.length > 0;

  const handleRemoveFilter = (key: string) => {
    const filter = filters.find((f) => f.key === key);
    if (!filter) return;

    if (filter.type === "dateRange") {
      onChange(filter.dateFrom || `${key}_from`, undefined);
      onChange(filter.dateTo || `${key}_to`, undefined);
    } else {
      onChange(key, undefined);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-3 flex-wrap ${className}`}>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((filter) => (
              <div
                key={filter.key}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 rounded-lg text-sm font-medium"
              >
                <span className="text-xs text-gray-600 dark:text-gray-400">{filter.label}:</span>
                <span>{filter.value}</span>
                <button
                  onClick={() => handleRemoveFilter(filter.key)}
                  className="ml-1 hover:bg-primary/20 dark:hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                  aria-label={`Remover filtro ${filter.label}`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {onClear && (
              <button
                onClick={onClear}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Limpar todos
              </button>
            )}
          </div>
        )}
      </div>

      <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} title="Filtros">
        <div className="p-4 space-y-6">
          {filters.map((filter) => {
            if (filter.type === "dateRange") {
              const fromKey = filter.dateFrom || `${filter.key}_from`;
              const toKey = filter.dateTo || `${filter.key}_to`;
              const fromValue = values[fromKey] || "";
              const toValue = values[toKey] || "";

              return (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Data inicial
                      </label>
                      <input
                        type="date"
                        value={fromValue}
                        onChange={(e) => handleDateChange(filter.key, e.target.value, true)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Data final {filter.allowSingleDate && "(opcional)"}
                      </label>
                      <input
                        type="date"
                        value={toValue}
                        onChange={(e) => handleDateChange(filter.key, e.target.value, false)}
                        min={fromValue || undefined}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            if (filter.type === "date") {
              return (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </label>
                  <input
                    type="date"
                    value={values[filter.key] || ""}
                    onChange={(e) => handleDateChange(filter.key, e.target.value, true)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={filter.placeholder}
                  />
                </div>
              );
            }

            if (filter.type === "select") {
              return (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </label>
                  <select
                    value={values[filter.key] || ""}
                    onChange={(e) => handleSelectChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (filter.type === "text") {
              return (
                <div key={filter.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filter.label}
                  </label>
                  <input
                    type="text"
                    value={values[filter.key] || ""}
                    onChange={(e) => handleTextChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={filter.placeholder}
                  />
                </div>
              );
            }

            return null;
          })}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            {hasActiveFilters && onClear && (
              <button
                onClick={() => {
                  onClear();
                  setIsDrawerOpen(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:opacity-90 rounded-lg transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

