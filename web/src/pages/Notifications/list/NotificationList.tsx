import React from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { Notification } from "../types";

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handleCreateClick: () => void;
  handleEditClick: (notification: Notification) => void;
  handleDelete: (notification: Notification) => void;
  getTimeDisplay: (notification: Notification) => string;
  stripHtml: (html: string) => string;
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
}

export function NotificationList({
  notifications,
  isLoading,
  pagination,
  handleCreateClick,
  handleEditClick,
  handleDelete,
  getTimeDisplay,
  stripHtml,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
}: NotificationListProps) {
  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
        Notificações
      </h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 overflow-hidden border border-gray-100 dark:border-dark-border">
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
            { key: "time_before", label: "Tempo antes", sortable: false, render: (item: Notification) => getTimeDisplay(item), cellClassName: "min-w-0" },
            {
              key: "message",
              label: "Mensagem",
              sortable: false,
              render: (item: Notification) => {
                const message = stripHtml(item.message || "");
                return (
                  <span className="md:truncate wrap-break-word md:break-normal">
                    {message.substring(0, 50)}
                    {message.length > 50 ? "..." : ""}
                  </span>
                );
              },
              cellClassName: "min-w-0",
            },
            { key: "active", label: "Ativo", sortable: false, render: (item: Notification) => item.active ? "Sim" : "Não", cellClassName: "min-w-0" },
            { key: "email_enabled", label: "E-mail", sortable: false, render: (item: Notification) => item.email_enabled ? "Sim" : "Não", cellClassName: "min-w-0" },
            { key: "whatsapp_enabled", label: "WhatsApp", sortable: false, render: (item: Notification) => item.whatsapp_enabled ? "Sim" : "Não", cellClassName: "min-w-0" },
            { key: "created_at", label: "Cadastro", sortable: true, render: (item: Notification) => item.created_at ? moment(item.created_at).format("DD/MM/YYYY") : "-", cellClassName: "min-w-0" },
          ]}
          data={notifications}
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

