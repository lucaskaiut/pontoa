import React from "react";
import { RoleForm } from "./RoleForm";
import { useRoleHandler } from "./roleHandlerModel";

export function RoleHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingRole,
    isSaving,
    isDeleting,
    setFieldValue,
    deleteRole,
    handleSubmit,
    handleBack,
  } = useRoleHandler();

  return (
    <RoleForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingRole={isLoadingRole}
      isSaving={isSaving}
      isDeleting={isDeleting}
      setFieldValue={setFieldValue}
      deleteRole={deleteRole}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}


