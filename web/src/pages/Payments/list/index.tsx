import React from "react";
import { PaymentList } from "./PaymentList";
import { usePaymentList } from "./paymentListModel";

export function PaymentListContainer() {
  const {
    payments,
    isLoading,
    pagination,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
  } = usePaymentList();

  return (
    <PaymentList
      payments={payments}
      isLoading={isLoading}
      pagination={pagination}
      handlePageChange={handlePageChange}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      handleSort={handleSort}
    />
  );
}

