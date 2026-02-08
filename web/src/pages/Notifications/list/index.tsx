import React from "react";
import { NotificationList } from "./NotificationList";
import { useNotificationList } from "./notificationListModel";

export function NotificationListContainer() {
  const {
    notifications,
    isLoading,
    pagination,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    getTimeDisplay,
    stripHtml,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
  } = useNotificationList();

  return (
    <NotificationList
      notifications={notifications}
      isLoading={isLoading}
      pagination={pagination}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
      getTimeDisplay={getTimeDisplay}
      stripHtml={stripHtml}
      handlePageChange={handlePageChange}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      handleSort={handleSort}
    />
  );
}

