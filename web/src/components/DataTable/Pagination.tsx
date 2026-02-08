import React from "react";
import { PaginationMeta, PaginationLinks } from "./types";

interface PaginationProps {
  meta: PaginationMeta;
  links: PaginationLinks;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, links, onPageChange }: PaginationProps) {
  const { current_page, last_page, total, per_page, from, to } = meta;

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= last_page && page !== current_page) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (last_page <= maxVisible) {
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      if (current_page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(last_page);
      } else if (current_page >= last_page - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = last_page - 3; i <= last_page; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = current_page - 1; i <= current_page + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(last_page);
      }
    }
    
    return pages;
  };

  const startItem = from || 0;
  const endItem = to || 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando <span className="font-semibold text-gray-900 dark:text-gray-100">{startItem}</span> até{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-100">{endItem}</span> de{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-100">{total}</span> resultados
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageClick(current_page - 1)}
          disabled={!links.prev || current_page === 1}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              !links.prev || current_page === 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary/30 dark:hover:border-blue-500/30"
            }
          `}
        >
          <span className="hidden sm:inline">Anterior</span>
          <span className="sm:hidden">‹</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-gray-400 dark:text-gray-600"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === current_page;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`
                  min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary dark:bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary/30 dark:hover:border-blue-500/30"
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageClick(current_page + 1)}
          disabled={!links.next || current_page === last_page}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              !links.next || current_page === last_page
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary/30 dark:hover:border-blue-500/30"
            }
          `}
        >
          <span className="hidden sm:inline">Próximo</span>
          <span className="sm:hidden">›</span>
        </button>
      </div>
    </div>
  );
}
