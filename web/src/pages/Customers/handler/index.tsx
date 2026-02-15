import React from "react";
import { CustomerForm } from "./CustomerForm";
import { useCustomerHandler } from "./customerHandlerModel";

export function CustomerHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingCustomer,
    isSaving,
    isSavingContext,
    isDeleting,
    context,
    setContext,
    setFieldValue,
    deleteCustomer,
    handleSubmit,
    handleSaveContext,
    handleBack,
  } = useCustomerHandler();

  return (
    <CustomerForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingCustomer={isLoadingCustomer}
      isSaving={isSaving}
      isSavingContext={isSavingContext}
      isDeleting={isDeleting}
      context={context}
      setContext={setContext}
      setFieldValue={setFieldValue}
      deleteCustomer={deleteCustomer}
      handleSubmit={handleSubmit}
      handleSaveContext={handleSaveContext}
      handleBack={handleBack}
    />
  );
}

