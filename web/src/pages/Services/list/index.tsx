import React from "react";
import { ServiceList } from "./ServiceList";
import { useServiceList } from "./serviceListModel";

export function ServiceListContainer() {
  const {
    services,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    formatPrice,
  } = useServiceList();

  return (
    <ServiceList
      services={services}
      isLoading={isLoading}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
      formatPrice={formatPrice}
    />
  );
}

