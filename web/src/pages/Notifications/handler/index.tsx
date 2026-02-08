import React from "react";
import { NotificationForm } from "./NotificationForm";
import { useNotificationHandler } from "./notificationHandlerModel";

export function NotificationHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingNotification,
    isSaving,
    isDeleting,
    setFieldValue,
    deleteNotification,
    handleSubmit,
    handleBack,
  } = useNotificationHandler();

  return (
    <NotificationForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingNotification={isLoadingNotification}
      isSaving={isSaving}
      isDeleting={isDeleting}
      setFieldValue={setFieldValue}
      deleteNotification={deleteNotification}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}

