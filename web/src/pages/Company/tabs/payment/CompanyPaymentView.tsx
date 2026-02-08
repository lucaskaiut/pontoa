import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@mdi/react";
import {
  mdiCrown,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiCancel,
  mdiCalendarClock,
  mdiCreditCard,
  mdiArrowRight,
  mdiRefresh,
  mdiPlus,
  mdiCheck,
} from "@mdi/js";
import classNames from "classnames";
import moment from "moment";
import InputMask from "react-input-mask";
import { Company, Card, CardFormValues } from "../../types";
import { SubscriptionInfo } from "./components/SubscriptionInfo";
import { CardsList } from "./components/CardsList";
import { CardForm } from "./components/CardForm";
import "moment/locale/pt-br";

interface CompanyPaymentViewProps {
  company: Company | undefined;
  getPlanLabel: () => string;
  getFreePlanEndDate: () => string;
  getNextBillingDate: () => string;
  getSubscriptionStatusLabel: () => string | null;
  handleCancelSubscription: () => void;
  handleReactivateSubscription: () => void;
  isCanceling: boolean;
  isReactivating: boolean;
  cards: Card[];
  cardsLoading: boolean;
  showCreditCardForm: boolean;
  setShowCreditCardForm: (show: boolean) => void;
  card: CardFormValues;
  setCard: (card: CardFormValues) => void;
  cardDue: string;
  handleMaskedInput: (field: keyof CardFormValues, value: string) => void;
  handleDueInput: (value: string) => void;
  cardFormErrors: Record<string, string>;
  handleAddCard: () => void;
  handleSetActiveCard: (cardId: number) => void;
  resetCardForm: () => void;
  isAddingCard: boolean;
  isSettingActive: boolean;
}

export function CompanyPaymentView({
  company,
  getPlanLabel,
  getFreePlanEndDate,
  getNextBillingDate,
  getSubscriptionStatusLabel,
  handleCancelSubscription,
  handleReactivateSubscription,
  isCanceling,
  isReactivating,
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
}: CompanyPaymentViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      {company?.plan_name && company?.plan_recurrence && (
        <SubscriptionInfo
          company={company}
          getPlanLabel={getPlanLabel}
          getFreePlanEndDate={getFreePlanEndDate}
          getNextBillingDate={getNextBillingDate}
          getSubscriptionStatusLabel={getSubscriptionStatusLabel}
          onNavigateToUpgrade={() => navigate("/upgrade")}
          onCancelSubscription={handleCancelSubscription}
          onReactivateSubscription={handleReactivateSubscription}
          isCanceling={isCanceling}
          isReactivating={isReactivating}
        />
      )}

      <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-lg">
        <div className="p-6 md:p-8">
          <CardsList
            company={company}
            cards={cards}
            cardsLoading={cardsLoading}
            showCreditCardForm={showCreditCardForm}
            onShowForm={() => setShowCreditCardForm(true)}
            onSetActiveCard={handleSetActiveCard}
            isSettingActive={isSettingActive}
          />

          {showCreditCardForm && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
              <CardForm
                card={card}
                setCard={setCard}
                cardDue={cardDue}
                handleMaskedInput={handleMaskedInput}
                handleDueInput={handleDueInput}
                cardFormErrors={cardFormErrors}
                onAddCard={handleAddCard}
                onCancel={resetCardForm}
                isAdding={isAddingCard}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

