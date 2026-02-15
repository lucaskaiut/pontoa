import React from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { Package } from "../types";

interface PackageListProps {
  packages: Package[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (pkg: Package) => void;
  handleDelete: (pkg: Package) => void;
  handleToggleActive: (pkg: Package) => void;
  formatPrice: (price: number | null | undefined) => string;
}

export function PackageList({
  packages,
  isLoading,
  handleCreateClick,
  handleEditClick,
  handleDelete,
  handleToggleActive,
  formatPrice,
}: PackageListProps) {
  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Pacotes</h1>
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
            { key: "name", label: "Nome" },
            { key: "total_sessions", label: "Sessões", render: (item: Package) => `${item.total_sessions}${item.bonus_sessions > 0 ? ` + ${item.bonus_sessions} bônus` : ''}` },
            { key: "price", label: "Preço", render: (item: Package) => formatPrice(item.price) },
            { key: "expires_in_days", label: "Validade", render: (item: Package) => item.expires_in_days ? `${item.expires_in_days} dias` : 'Ilimitado' },
            { key: "is_active", label: "Status", render: (item: Package) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(item);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.is_active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {item.is_active ? "Ativo" : "Inativo"}
              </button>
            )},
            { key: "created_at", label: "Cadastro", render: (item: Package) => item.created_at ? moment(item.created_at).format("DD/MM/YYYY") : '-' },
          ]}
          data={packages}
          isLoading={isLoading}
          onRowClick={handleEditClick}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

