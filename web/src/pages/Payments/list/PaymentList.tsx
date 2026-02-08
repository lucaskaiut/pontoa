import React from "react";
import moment from "moment";
// @ts-ignore
import { Oval } from "react-loader-spinner";
import { DataTable } from "../../../components/DataTable";
import { Payment } from "../types";
import { useTheme } from "../../../contexts/ThemeContext";

interface PaymentListProps {
  payments: Payment[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
}

export function PaymentList({
  payments,
  isLoading,
  pagination,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
}: PaymentListProps) {
  const { theme } = useTheme();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPlanBadge = (plan?: string, planLabel?: string) => {
    const planBadges: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string; glowColor: string; dotColorHex: string }> = {
      monthly: {
        label: planLabel || "Mensal",
        bgColor: "bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
        textColor: "text-blue-800 dark:text-blue-200",
        dotColor: "bg-blue-500 dark:bg-blue-400",
        glowColor: "shadow-blue-200/50 dark:shadow-blue-900/30",
        dotColorHex: "#3b82f6",
      },
      quarterly: {
        label: planLabel || "Trimestral",
        bgColor: "bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30",
        textColor: "text-purple-800 dark:text-purple-200",
        dotColor: "bg-purple-500 dark:bg-purple-400",
        glowColor: "shadow-purple-200/50 dark:shadow-purple-900/30",
        dotColorHex: "#a855f7",
      },
      yearly: {
        label: planLabel || "Anual",
        bgColor: "bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30",
        textColor: "text-emerald-800 dark:text-emerald-200",
        dotColor: "bg-emerald-500 dark:bg-emerald-400",
        glowColor: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
        dotColorHex: "#10b981",
      },
    };

    const badge = planBadges[plan || "monthly"] || planBadges.monthly;
    const textColorMap: Record<string, { light: string; dark: string }> = {
      'text-blue-800 dark:text-blue-200': { light: '#1e40af', dark: '#bfdbfe' },
      'text-purple-800 dark:text-purple-200': { light: '#6b21a8', dark: '#e9d5ff' },
      'text-emerald-800 dark:text-emerald-200': { light: '#065f46', dark: '#a7f3d0' },
    };
    const currentTextColor = theme === 'dark' 
      ? textColorMap[badge.textColor]?.dark || '#e5e7eb'
      : textColorMap[badge.textColor]?.light || '#1f2937';

    return (
      <div
        className={`${badge.bgColor} py-2 px-4 rounded-xl flex items-center justify-center gap-2 w-fit shadow-md ${badge.glowColor} border border-white/50 dark:border-white/10`}
      >
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: badge.dotColorHex }}></span>
        <span 
          className="text-xs font-bold whitespace-nowrap tracking-wide text-center"
          style={{ color: currentTextColor }}
        >
          {badge.label}
        </span>
      </div>
    );
  };

  const getPaymentMethodBadge = (method?: string, methodLabel?: string) => {
    const methodBadges: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string; glowColor: string; dotColorHex: string }> = {
      pagarmeCreditCard: {
        label: methodLabel || "Cartão de Crédito",
        bgColor: "bg-linear-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30",
        textColor: "text-indigo-800 dark:text-indigo-200",
        dotColor: "bg-indigo-500 dark:bg-indigo-400",
        glowColor: "shadow-indigo-200/50 dark:shadow-indigo-900/30",
        dotColorHex: "#6366f1",
      },
      pagarmePix: {
        label: methodLabel || "PIX",
        bgColor: "bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30",
        textColor: "text-green-800 dark:text-green-200",
        dotColor: "bg-green-500 dark:bg-green-400",
        glowColor: "shadow-green-200/50 dark:shadow-green-900/30",
        dotColorHex: "#22c55e",
      },
      mercadopagoCreditCard: {
        label: methodLabel || "Cartão de Crédito",
        bgColor: "bg-linear-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30",
        textColor: "text-cyan-800 dark:text-cyan-200",
        dotColor: "bg-cyan-500 dark:bg-cyan-400",
        glowColor: "shadow-cyan-200/50 dark:shadow-cyan-900/30",
        dotColorHex: "#06b6d4",
      },
    };

    const badge = methodBadges[method || "pagarmeCreditCard"] || {
      label: methodLabel || method || "Desconhecido",
      bgColor: "bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-800/40 dark:to-slate-800/40",
      textColor: "text-gray-800 dark:text-gray-200",
      dotColor: "bg-gray-500 dark:bg-gray-400",
      glowColor: "shadow-gray-200/50 dark:shadow-gray-800/30",
      dotColorHex: "#6b7280",
    };
    
    const textColorMap: Record<string, { light: string; dark: string }> = {
      'text-indigo-800 dark:text-indigo-200': { light: '#3730a3', dark: '#c7d2fe' },
      'text-green-800 dark:text-green-200': { light: '#166534', dark: '#bbf7d0' },
      'text-cyan-800 dark:text-cyan-200': { light: '#155e75', dark: '#a5f3fc' },
      'text-gray-800 dark:text-gray-200': { light: '#1f2937', dark: '#e5e7eb' },
    };
    const currentTextColor = theme === 'dark' 
      ? textColorMap[badge.textColor]?.dark || '#e5e7eb'
      : textColorMap[badge.textColor]?.light || '#1f2937';

    return (
      <div
        className={`${badge.bgColor} py-2 px-4 rounded-xl flex items-center justify-center gap-2 w-fit shadow-md ${badge.glowColor} border border-white/50 dark:border-white/10`}
      >
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: badge.dotColorHex }}></span>
        <span 
          className="text-xs font-bold whitespace-nowrap tracking-wide text-center"
          style={{ color: currentTextColor }}
        >
          {badge.label}
        </span>
      </div>
    );
  };

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
        Pagamentos
      </h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl flex flex-col gap-3 overflow-hidden border border-gray-100 dark:border-dark-border">
        <div className="px-4 md:px-10 pb-4 md:pb-10 flex flex-col gap-3 pt-4 md:pt-10">
          <div className="flex justify-center">
            <Oval
              height={40}
              width={40}
              color="#7b2cbf"
              visible={isLoading}
              ariaLabel="oval-loading"
              secondaryColor="#7b2cbf"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </div>

          {!isLoading && (
            <DataTable
              columns={[
                {
                  key: "billed_at",
                  label: "Data",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  render: (item: Payment) => (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="wrap-break-word font-medium text-gray-900 dark:text-gray-100">
                        {item.billed_at
                          ? moment(item.billed_at).format("DD/MM/YYYY")
                          : "-"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "amount",
                  label: "Valor",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  render: (item: Payment) => (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="wrap-break-word font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "plan",
                  label: "Plano",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  cellClassName: "md:items-start",
                  render: (item: Payment) => getPlanBadge(item.plan, item.plan_label),
                },
                {
                  key: "payment_method",
                  label: "Método de Pagamento",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                  cellClassName: "md:items-start",
                  render: (item: Payment) => getPaymentMethodBadge(item.payment_method, item.payment_method_label),
                },
                {
                  key: "external_id",
                  label: "ID Externo",
                  sortable: false,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  ),
                  render: (item: Payment) => (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span className="wrap-break-word font-medium text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {item.external_id || "-"}
                      </span>
                    </div>
                  ),
                },
              ]}
              data={payments}
              isLoading={isLoading}
              emptyMessage="Nenhum pagamento encontrado"
              emptyDescription="Os pagamentos da sua empresa aparecerão aqui"
              variant="modern"
              showHint={true}
              pagination={pagination}
              onPageChange={handlePageChange}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </div>
      </div>
    </div>
  );
}

