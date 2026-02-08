import React, { ReactNode } from "react";
import { Oval } from "react-loader-spinner";
import { Icon } from "@mdi/react";
import { mdiArrowUp, mdiArrowDown } from "@mdi/js";
import { SwipeableListItem } from "../SwipeableListItem";
import { Pagination } from "./Pagination";
import { PaginationMeta, PaginationLinks } from "./types";

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  render?: (item: T, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "center" | "right";
  mobileLabel?: string;
  sortable?: boolean;
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  variant?: "modern" | "simple";
  getRowKey?: (item: T, index: number) => string | number;
  getRowClassName?: (item: T, index: number) => string;
  showHint?: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  onPageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string, direction: "asc" | "desc") => void;
}

export function DataTable<T = any>({
  columns,
  data,
  isLoading = false,
  onRowClick,
  onDelete,
  emptyMessage = "Nenhum item encontrado",
  emptyDescription,
  variant = "simple",
  getRowKey = (item: any, index: number) => (item as any).id || index,
  getRowClassName,
  showHint = false,
  pagination,
  onPageChange,
  sortColumn,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const column = columns.find(col => col.key === columnKey);
    if (!column || column.sortable === false) return;
    
    if (sortColumn === columnKey) {
      const newDirection = sortDirection === "asc" ? "desc" : "asc";
      onSort(columnKey, newDirection);
    } else {
      onSort(columnKey, "asc");
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return (
        <Icon 
          path={mdiArrowUp} 
          size={0.7} 
          className="opacity-30 text-gray-400 dark:text-gray-500" 
        />
      );
    }
    
    if (sortDirection === "asc") {
      return (
        <Icon 
          path={mdiArrowUp} 
          size={0.7} 
          className="text-primary dark:text-blue-400" 
        />
      );
    } else {
      return (
        <Icon 
          path={mdiArrowDown} 
          size={0.7} 
          className="text-primary dark:text-blue-400" 
        />
      );
    }
  };
  const normalizedData = Array.isArray(data) 
    ? data 
    : (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data))
      ? (data as any).data
      : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Oval
          height={40}
          width={40}
          color="#7b2cbf"
          visible={true}
          ariaLabel="oval-loading"
          secondaryColor="#7b2cbf"
          strokeWidth={4}
          strokeWidthSecondary={4}
        />
      </div>
    );
  }

  if (normalizedData.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-dark-text-secondary text-lg font-medium">{emptyMessage}</p>
        {emptyDescription && (
          <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">{emptyDescription}</p>
        )}
      </div>
    );
  }

  const gridColsClass = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
    7: "md:grid-cols-7",
    8: "md:grid-cols-8",
  }[columns.length] || "md:grid-cols-6";

  const renderTableContent = () => {
    if (variant === "modern") {
      return (
        <div className="space-y-3">
          <div className={`hidden md:grid ${gridColsClass} gap-6 px-6 py-4 bg-linear-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-2`}>
            {columns.map((column) => (
              <div
                key={column.key}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                className={`flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-sm uppercase tracking-wider ${
                  column.sortable !== false && onSort ? "cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors" : ""
                } ${column.headerClassName || ""}`}
              >
                {column.icon}
                {column.label}
                {column.sortable !== false && onSort && renderSortIcon(column.key)}
              </div>
            ))}
          </div>
          {normalizedData.map((item, index) => {
            const rowKey = getRowKey(item, index);
            const rowClassName = getRowClassName ? getRowClassName(item, index) : "";
            
            return (
              <SwipeableListItem
                key={rowKey}
                onDelete={onDelete ? () => onDelete(item) : undefined}
                showHint={showHint && index === 0}
                className="group"
              >
                <div
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`
                    bg-white dark:bg-gray-800/50 
                    border border-gray-200/60 dark:border-gray-700/50 
                    rounded-xl p-6 
                    shadow-sm hover:shadow-lg 
                    transition-all duration-300 
                    cursor-pointer
                    hover:border-primary/30 dark:hover:border-blue-500/30
                    hover:bg-linear-to-br hover:from-white hover:to-gray-50/50 
                    dark:hover:from-gray-800/50 dark:hover:to-gray-800/30
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-50/30 dark:bg-gray-800/30'}
                    ${rowClassName}
                  `}
                >
                  <div className={`flex flex-col md:grid ${gridColsClass} gap-4 md:gap-6`}>
                    {columns.map((column) => (
                      <div
                        key={column.key}
                        className={`flex flex-col ${column.cellClassName || ""}`}
                      >
                        <span className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1 md:hidden">
                          {column.mobileLabel || column.label}
                        </span>
                        <div className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}>
                          {column.render ? column.render(item, index) : String((item as any)[column.key] || "-")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SwipeableListItem>
            );
          })}
        </div>
      );
    }

    return (
      <>
        <div className={`hidden md:grid ${gridColsClass} grid-rows-1 text-gray-400 dark:text-gray-500 font-bold border-b pb-5 border-gray-200 dark:border-dark-border p-4`}>
          {columns.map((column) => (
            <div
              key={column.key}
              onClick={() => column.sortable !== false && handleSort(column.key)}
              className={`flex items-center gap-2 ${
                column.sortable !== false && onSort ? "cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" : ""
              } ${column.headerClassName || ""}`}
            >
              {column.label}
              {column.sortable !== false && onSort && renderSortIcon(column.key)}
            </div>
          ))}
        </div>
        {normalizedData.map((item, index) => {
          const rowKey = getRowKey(item, index);
          const rowClassName = getRowClassName ? getRowClassName(item, index) : "";
          
          return (
            <SwipeableListItem
              key={rowKey}
              onDelete={onDelete ? () => onDelete(item) : undefined}
              showHint={showHint && index === 0}
              className={`py-4 md:py-5 text-gray-500 dark:text-dark-text-secondary cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface-hover p-4 transition-all rounded-lg border md:border-0 border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface ${rowClassName}`}
            >
              <div
                onClick={() => onRowClick && onRowClick(item)}
                className={`flex flex-col md:flex-row md:grid ${gridColsClass} gap-2 md:gap-4`}
              >
                {columns.map((column) => (
                  <div key={column.key} className={`flex md:block ${column.cellClassName || ""}`}>
                    <span className="font-bold text-gray-400 dark:text-gray-500 md:hidden mr-2">
                      {column.mobileLabel || column.label}:
                    </span>
                    <div className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}>
                      {column.render ? column.render(item, index) : String((item as any)[column.key] || "-")}
                    </div>
                  </div>
                ))}
              </div>
            </SwipeableListItem>
          );
        })}
      </>
    );
  };

  return (
    <>
      {renderTableContent()}
      {pagination && onPageChange && (
        <Pagination
          meta={pagination.meta}
          links={pagination.links}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
