import React from "react";
import { ReviewList } from "./ReviewList";
import { useReviewList } from "./reviewListModel";

export function ReviewListContainer() {
  const {
    reviews,
    isLoading,
    selectedClassification,
    setSelectedClassification,
    handleDelete,
    getClassificationLabel,
    getClassificationColor,
  } = useReviewList();

  return (
    <ReviewList
      reviews={reviews}
      isLoading={isLoading}
      selectedClassification={selectedClassification}
      setSelectedClassification={setSelectedClassification}
      handleDelete={handleDelete}
      getClassificationLabel={getClassificationLabel}
      getClassificationColor={getClassificationColor}
    />
  );
}

