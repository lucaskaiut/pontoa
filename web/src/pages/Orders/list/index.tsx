import React from "react";
import { OrderList } from "./OrderList";
import { useOrderList } from "./orderListModel";

export function OrderListContainer() {
  const {
    orders,
    isLoading,
    pagination,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    filters,
    setFilters,
    formatPrice,
    getStatusLabel,
    getStatusColor,
  } = useOrderList();

  return (
    <OrderList
      orders={orders}
      isLoading={isLoading}
      pagination={pagination}
      handlePageChange={handlePageChange}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      handleSort={handleSort}
      filters={filters}
      setFilters={setFilters}
      formatPrice={formatPrice}
      getStatusLabel={getStatusLabel}
      getStatusColor={getStatusColor}
    />
  );
}

