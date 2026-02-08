import React from "react";
import { PackageList } from "./PackageList";
import { usePackageList } from "./packageListModel";

export function PackageListContainer() {
  const {
    packages,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    handleToggleActive,
    formatPrice,
  } = usePackageList();

  return (
    <PackageList
      packages={packages}
      isLoading={isLoading}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
      handleToggleActive={handleToggleActive}
      formatPrice={formatPrice}
    />
  );
}

