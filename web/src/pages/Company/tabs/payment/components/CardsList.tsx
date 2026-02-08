import React from "react";
import { Icon } from "@mdi/react";
import { mdiCreditCard, mdiPlus, mdiCheck } from "@mdi/js";
import classNames from "classnames";
import { Company, Card } from "../../../types";

interface CardsListProps {
  company: Company | undefined;
  cards: Card[];
  cardsLoading: boolean;
  showCreditCardForm: boolean;
  onShowForm: () => void;
  onSetActiveCard: (cardId: number) => void;
  isSettingActive: boolean;
}

export function CardsList({
  company,
  cards,
  cardsLoading,
  showCreditCardForm,
  onShowForm,
  onSetActiveCard,
  isSettingActive,
}: CardsListProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-1">
              Cartões de Crédito
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie seus cartões de pagamento
            </p>
          </div>
          {!showCreditCardForm && (
            <button
              onClick={onShowForm}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Icon path={mdiPlus} size={1} />
              <span>Adicionar Cartão</span>
            </button>
          )}
        </div>

        {cardsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cards.length === 0 && !showCreditCardForm ? (
          <div className="text-center py-12">
            <Icon path={mdiCreditCard} size={3} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum cartão cadastrado</p>
            <button
              onClick={onShowForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Icon path={mdiPlus} size={1} />
              <span>Adicionar Primeiro Cartão</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((cardItem) => (
              <div
                key={cardItem.id}
                className={classNames(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                  company?.card_id === cardItem.id
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-400 dark:border-purple-600"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-dark-border hover:border-purple-300 dark:hover:border-purple-700"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-linear-to-br from-purple-500 to-blue-500 rounded-lg">
                    <Icon path={mdiCreditCard} size={1.5} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-dark-text">
                      {cardItem.card_number ||
                        `${cardItem.first_six_digits || "****"}******${cardItem.last_four_digits || "****"}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {company?.card_id === cardItem.id && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Icon path={mdiCheck} size={0.8} />
                      Ativo
                    </span>
                  )}
                  {company?.card_id !== cardItem.id && (
                    <button
                      onClick={() => onSetActiveCard(cardItem.id)}
                      disabled={isSettingActive}
                      className="px-4 py-2 bg-white dark:bg-dark-surface hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Definir como Ativo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}

