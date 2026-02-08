import React from "react";
import { UserList } from "./UserList";
import { useUserList } from "./userListModel";

export function UserListContainer() {
  const {
    users,
    isLoading,
    pagination,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    filters,
    handleFilterChange,
    handleClearFilters,
  } = useUserList();

  return (
    <UserList
      users={users}
      isLoading={isLoading}
      pagination={pagination}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
      handlePageChange={handlePageChange}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      handleSort={handleSort}
      filters={filters}
      handleFilterChange={handleFilterChange}
      handleClearFilters={handleClearFilters}
    />
  );
}

