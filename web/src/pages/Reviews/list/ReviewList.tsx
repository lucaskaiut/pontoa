import React from "react";
import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { Review } from "../types";

interface ReviewListProps {
  reviews: Review[];
  isLoading: boolean;
  selectedClassification: string | null;
  setSelectedClassification: (classification: string | null) => void;
  handleDelete: (review: Review) => void;
  getClassificationLabel: (classification: string) => string;
  getClassificationColor: (classification: string) => string;
}

export function ReviewList({
  reviews,
  isLoading,
  selectedClassification,
  setSelectedClassification,
  handleDelete,
  getClassificationLabel,
  getClassificationColor,
}: ReviewListProps) {
  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
        Avaliações
      </h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedClassification(null)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedClassification === null
                  ? "bg-primary dark:bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedClassification("promoter")}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedClassification === "promoter"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text"
              }`}
            >
              Promotores
            </button>
            <button
              onClick={() => setSelectedClassification("neutral")}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedClassification === "neutral"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text"
              }`}
            >
              Neutros
            </button>
            <button
              onClick={() => setSelectedClassification("detractor")}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedClassification === "detractor"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text"
              }`}
            >
              Detratores
            </button>
          </div>
        </div>
        <DataTable
          columns={[
            {
              key: "score",
              label: "Nota",
              render: (item: Review) => (
                <span className="font-bold text-lg">{item.score}</span>
              ),
            },
            {
              key: "classification",
              label: "Classificação",
              render: (item: Review) => (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getClassificationColor(
                    item.classification
                  )}`}
                >
                  {getClassificationLabel(item.classification)}
                </span>
              ),
            },
            {
              key: "customer",
              label: "Cliente",
              render: (item: Review) => item.customer?.name || "Cliente",
            },
            {
              key: "comment",
              label: "Comentário",
              render: (item: Review) => (
                <span className="max-w-md truncate block">
                  {item.comment || "-"}
                </span>
              ),
            },
            {
              key: "is_public",
              label: "Público",
              render: (item: Review) => (item.is_public ? "Sim" : "Não"),
            },
            {
              key: "created_at",
              label: "Data",
              render: (item: Review) =>
                item.created_at
                  ? moment(item.created_at).format("DD/MM/YYYY HH:mm")
                  : "-",
            },
          ]}
          data={reviews}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

