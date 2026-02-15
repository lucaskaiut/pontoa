import React, { useState, useMemo } from "react";
import moment from "moment";
import { Oval } from "react-loader-spinner";
import { Calendar } from "../../../components/Calendar";
import { DataTable, DataTableColumn } from "../../../components/DataTable";
import { TableFilters, TableFilter } from "../../../components/TableFilters";
import { SchedulingEvent, Scheduling, Service, User } from "../types";
import { useTheme } from "../../../contexts/ThemeContext";
import { formatDate } from "../../../utils/dateUtils";

interface SchedulingListProps {
  events: SchedulingEvent[];
  schedulings: Scheduling[];
  hours: any[];
  services: Service[];
  users: User[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handleNewSchedulingClick: () => void;
  handleEditSchedulingClick: (id: string | number) => void;
  handleEventDrop: (eventId: string | number, start: Date, end: Date) => void;
  handleSlotClick: (params?: any) => void;
  handleDelete?: (scheduling: Scheduling) => void;
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
  filters: Record<string, any>;
  handleFilterChange: (key: string, value: any) => void;
  handleClearFilters: () => void;
}

export function SchedulingList({
  events,
  schedulings,
  hours,
  services,
  users,
  isLoading,
  pagination,
  handleNewSchedulingClick,
  handleEditSchedulingClick,
  handleEventDrop,
  handleSlotClick,
  handleDelete,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
  filters,
  handleFilterChange,
  handleClearFilters,
}: SchedulingListProps) {
  const [activeTab, setActiveTab] = useState<"calendario" | "tabela">("calendario");
  const { theme } = useTheme();

  const tableFilters: TableFilter[] = useMemo(() => [
    {
      key: "date",
      label: "Data do Agendamento",
      type: "dateRange",
      dateFrom: "date_from",
      dateTo: "date_to",
      allowSingleDate: true,
    },
    {
      key: "service",
      label: "Serviço",
      type: "select",
      options: services.map((service) => ({
        value: service.id,
        label: service.name,
      })),
    },
    {
      key: "user",
      label: "Profissional",
      type: "select",
      options: users.map((user) => ({
        value: user.id,
        label: user.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "pending", label: "Pendente" },
        { value: "confirmed", label: "Confirmado" },
        { value: "cancelled", label: "Cancelado" },
        { value: "no_show", label: "Não Compareceu" },
      ],
    },
  ], [services, users]);

  const tabs = [
    { id: "calendario" as const, label: "Calendário" },
    { id: "tabela" as const, label: "Tabela" },
  ];

  const formatPrice = (price?: number): string => {
    if (!price) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStatusBadge = (status?: string) => {
    const statusBadges: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string; glowColor: string; dotColorHex: string }> = {
      pending: {
        label: "Pendente",
        bgColor: "bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30",
        textColor: "text-amber-800 dark:text-amber-200",
        dotColor: "bg-amber-500 dark:bg-amber-400",
        glowColor: "shadow-amber-200/50 dark:shadow-amber-900/30",
        dotColorHex: "#f59e0b",
      },
      confirmed: {
        label: "Confirmado",
        bgColor: "bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30",
        textColor: "text-emerald-800 dark:text-emerald-200",
        dotColor: "bg-emerald-500 dark:bg-emerald-400",
        glowColor: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
        dotColorHex: "#10b981",
      },
      cancelled: {
        label: "Cancelado",
        bgColor: "bg-linear-to-r from-gray-50 to-slate-50 dark:from-gray-800/40 dark:to-slate-800/40",
        textColor: "text-gray-800 dark:text-gray-200",
        dotColor: "bg-gray-500 dark:bg-gray-400",
        glowColor: "shadow-gray-200/50 dark:shadow-gray-800/30",
        dotColorHex: "#6b7280",
      },
      no_show: {
        label: "Não compareceu",
        bgColor: "bg-linear-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30",
        textColor: "text-orange-800 dark:text-orange-200",
        dotColor: "bg-orange-500 dark:bg-orange-400",
        glowColor: "shadow-orange-200/50 dark:shadow-orange-900/30",
        dotColorHex: "#f97316",
      },
    };

    const badge = statusBadges[status || "pending"] || statusBadges.pending;
    const textColorMap: Record<string, { light: string; dark: string }> = {
      'text-amber-800 dark:text-amber-200': { light: '#92400e', dark: '#fde68a' },
      'text-emerald-800 dark:text-emerald-200': { light: '#065f46', dark: '#a7f3d0' },
      'text-gray-800 dark:text-gray-200': { light: '#1f2937', dark: '#e5e7eb' },
      'text-orange-800 dark:text-orange-200': { light: '#9a3412', dark: '#fed7aa' },
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

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    const paymentStatusBadges: Record<string, { label: string; bgColor: string; textColor: string; dotColor: string; glowColor: string; dotColorHex: string }> = {
      paid: {
        label: "Pago",
        bgColor: "bg-linear-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30",
        textColor: "text-emerald-800 dark:text-emerald-200",
        dotColor: "bg-emerald-500 dark:bg-emerald-400",
        glowColor: "shadow-emerald-200/50 dark:shadow-emerald-900/30",
        dotColorHex: "#10b981",
      },
      awaiting_payment: {
        label: "Aguardando Pagamento",
        bgColor: "bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30",
        textColor: "text-amber-800 dark:text-amber-200",
        dotColor: "bg-amber-500 dark:bg-amber-400",
        glowColor: "shadow-amber-200/50 dark:shadow-amber-900/30",
        dotColorHex: "#f59e0b",
      },
      canceled: {
        label: "Cancelado",
        bgColor: "bg-linear-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30",
        textColor: "text-red-800 dark:text-red-200",
        dotColor: "bg-red-500 dark:bg-red-400",
        glowColor: "shadow-red-200/50 dark:shadow-red-900/30",
        dotColorHex: "#ef4444",
      },
    };

    const badge = paymentStatusBadges[paymentStatus || "awaiting_payment"] || paymentStatusBadges.awaiting_payment;
    const textColorMap: Record<string, { light: string; dark: string }> = {
      'text-emerald-800 dark:text-emerald-200': { light: '#065f46', dark: '#a7f3d0' },
      'text-amber-800 dark:text-amber-200': { light: '#92400e', dark: '#fde68a' },
      'text-red-800 dark:text-red-200': { light: '#991b1b', dark: '#fecaca' },
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
        Agendamentos
      </h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl flex flex-col gap-3 overflow-hidden border border-gray-100 dark:border-dark-border">
        <div className="flex justify-end mb-4 px-4 md:px-10 pt-4 md:pt-10">
          <button
            onClick={handleNewSchedulingClick}
            className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all"
          >
            Novo Agendamento
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="flex -mb-px px-4 md:px-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary dark:border-blue-400 text-primary dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-dark-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 md:px-10 pb-4 md:pb-10 flex flex-col gap-3">
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

          {!isLoading && activeTab === "calendario" && (
            <div className="overflow-hidden">
              <Calendar
                events={events as any}
                storeHours={hours as any}
                onEventClick={handleEditSchedulingClick}
                onSlotClick={handleNewSchedulingClick}
                onEventDrop={handleEventDrop}
              />
            </div>
          )}

          {!isLoading && activeTab === "tabela" && (
            <>
              <div className="px-4 md:px-10 pt-4">
                <TableFilters
                  filters={tableFilters}
                  values={filters}
                  onChange={handleFilterChange}
                  onClear={handleClearFilters}
                />
              </div>
              <div className="px-4 md:px-10">
              <DataTable
              columns={[
                {
                  key: "customer",
                  label: "Cliente",
                  sortable: false,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  render: (item: Scheduling) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30 flex items-center justify-center shrink-0">
                        <span className="text-primary dark:text-purple-400 font-bold text-sm">
                          {item.customer?.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <span className="wrap-break-word font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {item.customer?.name || "-"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "service",
                  label: "Serviço / Profissional",
                  sortable: false,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  render: (item: Scheduling) => (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="wrap-break-word font-semibold text-gray-900 dark:text-gray-100">{item.service?.name || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span className="wrap-break-word text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {item.user?.name || "-"}
                        </span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "date",
                  label: "Data",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ),
                  render: (item: Scheduling) => (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="wrap-break-word font-medium text-gray-900 dark:text-gray-100">
                        {item.date
                          ? formatDate(item.date, "DD/MM/YYYY HH:mm")
                          : "-"}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "price",
                  label: "Valor",
                  sortable: false,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  render: (item: Scheduling) => (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="wrap-break-word font-bold text-gray-900 dark:text-gray-100 text-lg">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ),
                },
                {
                  key: "status",
                  label: "Status",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  cellClassName: "md:items-start",
                  render: (item: Scheduling) => getStatusBadge(item.status),
                },
                {
                  key: "payment_status",
                  label: "Pagamento",
                  sortable: true,
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                  cellClassName: "md:items-start",
                  render: (item: Scheduling) => getPaymentStatusBadge(item.payment_status),
                },
              ]}
              data={schedulings}
              isLoading={isLoading}
              onRowClick={(item) => item.id && handleEditSchedulingClick(item.id)}
              onDelete={handleDelete}
              emptyMessage="Nenhum agendamento encontrado"
              emptyDescription="Crie um novo agendamento para começar"
              variant="modern"
              showHint={true}
              pagination={pagination}
              onPageChange={handlePageChange}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

