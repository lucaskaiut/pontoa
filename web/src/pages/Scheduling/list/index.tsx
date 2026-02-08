import React from "react";
import { SchedulingList } from "./SchedulingList";
import { useSchedulingList } from "./schedulingListModel";

export function SchedulingListContainer() {
  const {
    schedulings,
    events,
    hours,
    services,
    users,
    isLoading,
    pagination,
    handleNewSchedulingClick,
    handleEditSchedulingClick,
    handleEventDrop,
    handleSlotClick,
    handleDelete,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    filters,
    handleFilterChange,
    handleClearFilters,
  } = useSchedulingList();

  return (
    <SchedulingList
      schedulings={schedulings}
      events={events}
      hours={hours}
      services={services}
      users={users}
      isLoading={isLoading}
      pagination={pagination}
      handleNewSchedulingClick={handleNewSchedulingClick}
      handleEditSchedulingClick={handleEditSchedulingClick}
      handleEventDrop={handleEventDrop}
      handleSlotClick={handleSlotClick}
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

