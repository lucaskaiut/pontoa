import React from "react";
import { UserForm } from "./UserForm";
import { useUserHandler } from "./userHandlerModel";

export function UserHandler() {
  const {
    values,
    fields,
    additionalFields,
    isEditing,
    isLoadingUser,
    isSaving,
    isDeleting,
    formKey,
    imageFile,
    setImageFile,
    setFieldValue,
    deleteUser,
    handleSubmit,
    handleBack,
  } = useUserHandler();

  return (
    <UserForm
      values={values}
      fields={fields}
      additionalFields={additionalFields}
      isEditing={isEditing}
      isLoadingUser={isLoadingUser}
      isSaving={isSaving}
      isDeleting={isDeleting}
      formKey={formKey}
      imageFile={imageFile}
      setImageFile={setImageFile}
      setFieldValue={setFieldValue}
      deleteUser={deleteUser}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}

