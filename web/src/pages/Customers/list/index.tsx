import React from "react";
import { CustomerList } from "./CustomerList";
import { useCustomerList } from "./customerListModel";

export function CustomerListContainer() {
  const {
    customers,
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
  } = useCustomerList();

  return (
    <CustomerList
      customers={customers}
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

