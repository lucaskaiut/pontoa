import React from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { Service } from "../types";

interface ServiceListProps {
  services: Service[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (service: Service) => void;
  handleDelete: (service: Service) => void;
  formatPrice: (price: number) => string;
}

export function ServiceList({
  services,
  isLoading,
  handleCreateClick,
  handleEditClick,
  handleDelete,
  formatPrice,
}: ServiceListProps) {
  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Serviços</h1>
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
            { key: "price", label: "Preço", render: (item: Service) => formatPrice(item.price) },
            { key: "cost", label: "Custo", render: (item: Service) => formatPrice(item.cost) },
            { key: "duration", label: "Duração", render: (item: Service) => `${item.duration || 0} minutos` },
            { key: "created_at", label: "Cadastro", render: (item: Service) => item.created_at ? moment(item.created_at).format("DD/MM/YYYY") : '-' },
          ]}
          data={services}
          isLoading={isLoading}
          onRowClick={handleEditClick}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

