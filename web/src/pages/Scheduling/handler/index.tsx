import React from "react";
import { SchedulingForm } from "./SchedulingForm";
import { useSchedulingHandler } from "./schedulingHandlerModel";

export function SchedulingHandler() {
  const {
    isEditing,
    values,
    fields,
    isLoading,
    isSaving,
    setFieldValue,
    handleSubmit,
    handleBack,
  } = useSchedulingHandler();

  return (
    <SchedulingForm
      isEditing={isEditing}
      values={values}
      fields={fields}
      isLoading={isLoading}
      isSaving={isSaving}
      setFieldValue={setFieldValue}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}

