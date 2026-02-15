import React from "react";
import { StoreList } from "./StoreList";
import { useStoreList } from "./storeListModel";

export function StoreListContainer() {
  const { stores, isLoading, handleEditClick, handleCreateClick, handleToggleActive, isToggling } = useStoreList();

  return (
    <StoreList
      stores={stores}
      isLoading={isLoading}
      handleEditClick={handleEditClick}
      handleCreateClick={handleCreateClick}
      handleToggleActive={handleToggleActive}
      isToggling={isToggling}
    />
  );
}

