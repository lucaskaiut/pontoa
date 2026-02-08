import React from "react";
import { PackageForm } from "./PackageForm";
import { usePackageHandler } from "./packageHandlerModel";

export function PackageHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingPackage,
    isSaving,
    isDeleting,
    setFieldValue,
    deletePackage,
    handleSubmit,
    handleBack,
  } = usePackageHandler();

  return (
    <PackageForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingPackage={isLoadingPackage}
      isSaving={isSaving}
      isDeleting={isDeleting}
      setFieldValue={setFieldValue}
      deletePackage={deletePackage}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}

