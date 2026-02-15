import React, { useMemo } from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { TableFilters, TableFilter } from "../../../components/TableFilters";
import { User } from "../types";

interface UserListProps {
  users: User[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handleCreateClick: () => void;
  handleEditClick: (user: User) => void;
  handleDelete: (user: User) => void;
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
  filters: Record<string, any>;
  handleFilterChange: (key: string, value: any) => void;
  handleClearFilters: () => void;
}

export function UserList({
  users,
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
}: UserListProps) {
  const tableFilters: TableFilter[] = useMemo(() => [
    {
      key: "name",
      label: "Nome",
      type: "text",
      placeholder: "Digite o nome do usuário",
    },
    {
      key: "email",
      label: "E-Mail",
      type: "text",
      placeholder: "Digite o e-mail do usuário",
    },
    {
      key: "is_collaborator",
      label: "Tipo",
      type: "select",
      options: [
        { value: "true", label: "Colaborador" },
        { value: "false", label: "Administrador" },
      ],
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

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Usuários</h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex justify-end mb-4">
          <button onClick={handleCreateClick} className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all">Novo</button>
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
            { key: "email", label: "E-Mail", sortable: true },
            {
              key: "is_collaborator",
              label: "Tipo",
              sortable: false,
              render: (item: User) => (
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  item.is_collaborator 
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                }`}>
                  {item.is_collaborator ? "Colaborador" : "Administrador"}
                </span>
              ),
            },
            { key: "created_at", label: "Cadastro", sortable: true, render: (item: User) => item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : '-' },
          ]}
          data={users}
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

