import { ScheduleList } from "./ScheduleList";
import { useScheduleList } from "./scheduleListModel";

export function ScheduleListContainer() {
  const {
    schedules,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    formatDays,
  } = useScheduleList();

  return (
    <ScheduleList
      schedules={schedules}
      isLoading={isLoading}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
      formatDays={formatDays}
    />
  );
}

