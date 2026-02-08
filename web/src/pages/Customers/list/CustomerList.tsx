import React, { useMemo } from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { TableFilters, TableFilter } from "../../../components/TableFilters";
import { Badge } from "../../../components/ui/atoms/Badge";
import { Customer } from "../types";

interface CustomerListProps {
  customers: Customer[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handleCreateClick: () => void;
  handleEditClick: (customer: Customer) => void;
  handleDelete: (customer: Customer) => void;
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
  filters: Record<string, any>;
  handleFilterChange: (key: string, value: any) => void;
  handleClearFilters: () => void;
}

export function CustomerList({
  customers,
  isLoading,
  pagination,
  handleCreateClick,
  handleEditClick,
  handleDelete,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
  filters,
  handleFilterChange,
  handleClearFilters,
}: CustomerListProps) {
  const tableFilters: TableFilter[] = useMemo(() => [
    {
      key: "name",
      label: "Nome",
      type: "text",
      placeholder: "Digite o nome do cliente",
    },
    {
      key: "email",
      label: "E-Mail",
      type: "text",
      placeholder: "Digite o e-mail do cliente",
    },
    {
      key: "created_at",
      label: "Data de Cadastro",
      type: "dateRange",
      dateFrom: "created_at_from",
      dateTo: "created_at_to",
      allowSingleDate: true,
    },
  ], []);

  const getConversationStateBadge = (state?: string | null) => {
    if (!state) {
      return null;
    }

    const stateLabels: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
      'idle': { label: 'Ocioso', variant: 'default' },
      'awaiting_confirmation': { label: 'Aguardando Confirmação', variant: 'warning' },
      'awaiting_nps': { label: 'Aguardando Avaliação', variant: 'info' },
      'awaiting_payment': { label: 'Aguardando Pagamento', variant: 'warning' },
      'human_handoff': { label: 'Atendimento Humano', variant: 'primary' },
    };

    const config = stateLabels[state] || { label: state, variant: 'default' as const };

    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Clientes</h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleCreateClick}
            className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all"
          >
            Novo
          </button>
        </div>
        <div className="mb-4">
          <TableFilters
            filters={tableFilters}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Nome", sortable: true },
            { key: "email", label: "E-Mail", sortable: true, render: (item: Customer) => item.email || "-" },
            { key: "phone", label: "Telefone", sortable: false, render: (item: Customer) => item.phone || "-" },
            { key: "conversation_state", label: "Estado", sortable: false, render: (item: Customer) => getConversationStateBadge(item.conversation_state || 'idle') },
            { key: "created_at", label: "Cadastro", sortable: true, render: (item: Customer) => item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : '-' },
          ]}
          data={customers}
          isLoading={isLoading}
          onRowClick={handleEditClick}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={handlePageChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}

