import moment from "moment";
import { DataTable } from "../../../components/DataTable";
import { Schedule } from "../types";

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (schedule: Schedule) => void;
  handleDelete: (schedule: Schedule) => void;
  formatDays: (days: string) => string;
}

export function ScheduleList({
  schedules,
  isLoading,
  handleCreateClick,
  handleEditClick,
  handleDelete,
  formatDays,
}: ScheduleListProps) {
  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Agenda e horários</h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex justify-end mb-4">
          <button onClick={handleCreateClick} className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all">Novo</button>
        </div>
        <DataTable
          columns={[
            { key: "days", label: "Dias", render: (item: Schedule) => formatDays(item.days) },
            { key: "start_at", label: "Horário", render: (item: Schedule) => `${item.start_at} - ${item.end_at}` },
            { key: "created_at", label: "Cadastro", render: (item: Schedule) => item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : '-' },
          ]}
          data={schedules}
          isLoading={isLoading}
          onRowClick={handleEditClick}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

