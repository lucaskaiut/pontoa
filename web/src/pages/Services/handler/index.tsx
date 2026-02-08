import React from "react";
import { ServiceForm } from "./ServiceForm";
import { useServiceHandler } from "./serviceHandlerModel";

export function ServiceHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingService,
    isSaving,
    isDeleting,
    setFieldValue,
    deleteService,
    handleSubmit,
    handleBack,
  } = useServiceHandler();

  return (
    <ServiceForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingService={isLoadingService}
      isSaving={isSaving}
      isDeleting={isDeleting}
      setFieldValue={setFieldValue}
      deleteService={deleteService}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}

