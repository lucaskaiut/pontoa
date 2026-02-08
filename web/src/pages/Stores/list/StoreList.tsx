import React from "react";
import { DataTable } from "../../../components/DataTable";
import { Loading } from "../../../components/ui/atoms";

interface Store {
  id: number;
  name: string;
  email?: string;
  domain?: string;
  phone?: string;
  document?: string;
  active?: boolean;
}

interface StoreListProps {
  stores: Store[];
  isLoading: boolean;
  handleEditClick: (store: Store) => void;
  handleCreateClick: () => void;
  handleToggleActive: (store: Store) => void;
  isToggling: boolean;
}

export function StoreList({
  stores,
  isLoading,
  handleEditClick,
  handleCreateClick,
  handleToggleActive,
  isToggling,
}: StoreListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Lojas</h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex justify-end mb-4">
          <button onClick={handleCreateClick} className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all">Novo</button>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Nome", sortable: true },
            { key: "email", label: "E-Mail", sortable: true },
            { key: "domain", label: "Domínio", sortable: true },
            {
              key: "active",
              label: "Status",
              sortable: false,
              render: (item: Store) => (
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    item.active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {item.active ? "Ativa" : "Inativa"}
                </span>
              ),
            },
            {
              key: "actions",
              label: "Ações",
              sortable: false,
              render: (item: Store) => (
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(item);
                    }}
                    disabled={isToggling}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      item.active
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {item.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(item);
                    }}
                    className="text-primary dark:text-blue-400 hover:underline"
                  >
                    Editar
                  </button>
                </div>
              ),
            },
          ]}
          data={stores}
          emptyMessage="Nenhuma loja encontrada"
          onRowClick={handleEditClick}
        />
      </div>
    </div>
  );
}

