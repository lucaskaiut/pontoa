import React from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { Role } from "../types";

interface RoleListProps {
  roles: Role[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handleCreateClick: () => void;
  handleEditClick: (role: Role) => void;
  handleDelete: (role: Role) => void;
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
}

export function RoleList({
  roles,
  isLoading,
  pagination,
  handleCreateClick,
  handleEditClick,
  handleDelete,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
}: RoleListProps) {
  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
        Perfis
      </h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleCreateClick} 
            className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all"
          >
            Novo
          </button>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Nome", sortable: true },
            { key: "description", label: "Descrição", sortable: true, render: (item: Role) => item.description || '-' },
            { key: "created_at", label: "Cadastro", sortable: true, render: (item: Role) => item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : '-' },
          ]}
          data={roles}
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


