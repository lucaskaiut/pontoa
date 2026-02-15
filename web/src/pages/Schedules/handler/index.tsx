import { ScheduleForm } from "./ScheduleForm";
import { useScheduleHandler } from "./scheduleHandlerModel";

export function ScheduleHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingSchedule,
    isSaving,
    isDeleting,
    setFieldValue,
    deleteSchedule,
    handleSubmit,
    handleBack,
  } = useScheduleHandler();

  return (
    <ScheduleForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingSchedule={isLoadingSchedule}
      isSaving={isSaving}
      isDeleting={isDeleting}
      setFieldValue={setFieldValue}
      deleteSchedule={deleteSchedule}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}

