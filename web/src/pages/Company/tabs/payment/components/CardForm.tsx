import React from "react";
import { Icon } from "@mdi/react";
import { mdiCancel, mdiPlus } from "@mdi/js";
import classNames from "classnames";
import InputMask from "react-input-mask";
import { CardFormValues } from "../../../types";

interface CardFormProps {
  card: CardFormValues;
  setCard: (card: CardFormValues) => void;
  cardDue: string;
  handleMaskedInput: (field: keyof CardFormValues, value: string) => void;
  handleDueInput: (value: string) => void;
  cardFormErrors: Record<string, string>;
  onAddCard: () => void;
  onCancel: () => void;
  isAdding: boolean;
}

export function CardForm({
  card,
  setCard,
  cardDue,
  handleMaskedInput,
  handleDueInput,
  cardFormErrors,
  onAddCard,
  onCancel,
  isAdding,
}: CardFormProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Adicionar Novo Cartão
          </h4>
          <button
            onClick={onCancel}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Icon path={mdiCancel} size={1.2} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nome do Portador
            </label>
            <input
              type="text"
              placeholder="Nome como está no cartão"
              value={card.holder_name}
              onChange={(e) => setCard({ ...card, holder_name: e.target.value })}
              className={classNames(
                "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface",
                "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                {
                  "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.holder_name,
                  "border-gray-200 dark:border-dark-border": !cardFormErrors.holder_name,
                }
              )}
            />
            {cardFormErrors.holder_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Nome obrigatório</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              CPF do Portador
            </label>
            <InputMask
              type="text"
              placeholder="000.000.000-00"
              value={card.holder_document}
              onChange={(e) => handleMaskedInput("holder_document", e.target.value)}
              mask="999.999.999-99"
            >
              {(props) => (
                <input
                  className={classNames(
                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface",
                    "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                    {
                      "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.holder_document,
                      "border-gray-200 dark:border-dark-border": !cardFormErrors.holder_document,
                    }
                  )}
                  {...props}
                />
              )}
            </InputMask>
            {cardFormErrors.holder_document && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">CPF inválido</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Número do Cartão
            </label>
            <InputMask
              type="text"
              placeholder="0000 0000 0000 0000"
              value={card.number}
              onChange={(e) => handleMaskedInput("number", e.target.value)}
              mask="9999 9999 9999 9999"
            >
              {(props) => (
                <input
                  className={classNames(
                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono text-lg",
                    "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                    {
                      "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.number,
                      "border-gray-200 dark:border-dark-border": !cardFormErrors.number,
                    }
                  )}
                  {...props}
                />
              )}
            </InputMask>
            {cardFormErrors.number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Número do cartão inválido</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Validade
              </label>
              <InputMask
                type="text"
                placeholder="MM/AA"
                value={cardDue}
                onChange={(e) => handleDueInput(e.target.value)}
                mask="99/99"
              >
                {(props) => (
                  <input
                    className={classNames(
                      "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 dark:bg-red-900/20":
                          cardFormErrors.exp_month || cardFormErrors.exp_year,
                        "border-gray-200 dark:border-dark-border":
                          !cardFormErrors.exp_month && !cardFormErrors.exp_year,
                      }
                    )}
                    {...props}
                  />
                )}
              </InputMask>
              {(cardFormErrors.exp_month || cardFormErrors.exp_year) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Data inválida</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                CVV
              </label>
              <InputMask
                type="text"
                placeholder="123"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                mask="999"
              >
                {(props) => (
                  <input
                    className={classNames(
                      "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.cvv,
                        "border-gray-200 dark:border-dark-border": !cardFormErrors.cvv,
                      }
                    )}
                    {...props}
                  />
                )}
              </InputMask>
              {cardFormErrors.cvv && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">CVV inválido</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onAddCard}
              disabled={isAdding}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Adicionando...</span>
                </>
              ) : (
                <>
                  <Icon path={mdiPlus} size={1} />
                  <span>Adicionar Cartão</span>
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
    </>
  );
}

