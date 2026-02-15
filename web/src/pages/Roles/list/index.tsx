import React from "react";
import { RoleList } from "./RoleList";
import { useRoleList } from "./roleListModel";

export function RoleListContainer() {
  const {
    roles,
    isLoading,
    pagination,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
  } = useRoleList();

  return (
    <RoleList
      roles={roles}
      isLoading={isLoading}
      pagination={pagination}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
      handlePageChange={handlePageChange}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      handleSort={handleSort}
    />
  );
}


