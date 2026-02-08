import React from "react";
import { CompanyPaymentView } from "./CompanyPaymentView";
import { useSubscriptionModel } from "../models/useSubscriptionModel";
import { useCardsModel } from "../models/useCardsModel";

export function CompanyPaymentTab() {
  const {
    company,
    getFreePlanEndDate,
    getNextBillingDate,
    getPlanLabel,
    getSubscriptionStatusLabel,
    handleCancelSubscription,
    handleReactivateSubscription,
    isCanceling,
    isReactivating,
  } = useSubscriptionModel();

  const {
    cards,
    cardsLoading,
    showCreditCardForm,
    setShowCreditCardForm,
    card,
    setCard,
    cardDue,
    handleMaskedInput,
    handleDueInput,
    cardFormErrors,
    handleAddCard,
    handleSetActiveCard,
    resetCardForm,
    isAddingCard,
    isSettingActive,
  } = useCardsModel();

  return (
    <CompanyPaymentView
      company={company}
      getPlanLabel={getPlanLabel}
      getFreePlanEndDate={getFreePlanEndDate}
      getNextBillingDate={getNextBillingDate}
      getSubscriptionStatusLabel={getSubscriptionStatusLabel}
      handleCancelSubscription={handleCancelSubscription}
      handleReactivateSubscription={handleReactivateSubscription}
      isCanceling={isCanceling}
      isReactivating={isReactivating}
      cards={cards}
      cardsLoading={cardsLoading}
      showCreditCardForm={showCreditCardForm}
      setShowCreditCardForm={setShowCreditCardForm}
      card={card}
      setCard={setCard}
      cardDue={cardDue}
      handleMaskedInput={handleMaskedInput}
      handleDueInput={handleDueInput}
      cardFormErrors={cardFormErrors}
      handleAddCard={handleAddCard}
      handleSetActiveCard={handleSetActiveCard}
      resetCardForm={resetCardForm}
      isAddingCard={isAddingCard}
      isSettingActive={isSettingActive}
    />
  );
}


