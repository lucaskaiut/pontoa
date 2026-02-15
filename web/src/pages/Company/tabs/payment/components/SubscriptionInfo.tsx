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
} from "@mdi/js";
import classNames from "classnames";
import moment from "moment";
import { Company } from "../../../types";

interface SubscriptionInfoProps {
  company: Company;
  getPlanLabel: () => string;
  getFreePlanEndDate: () => string;
  getNextBillingDate: () => string;
  getSubscriptionStatusLabel: () => string | null;
  onNavigateToUpgrade: () => void;
  onCancelSubscription: () => void;
  onReactivateSubscription: () => void;
  isCanceling: boolean;
  isReactivating: boolean;
}

export function SubscriptionInfo({
  company,
  getPlanLabel,
  getFreePlanEndDate,
  getNextBillingDate,
  getSubscriptionStatusLabel,
  onNavigateToUpgrade,
  onCancelSubscription,
  onReactivateSubscription,
  isCanceling,
  isReactivating,
}: SubscriptionInfoProps) {
  const statusLabel = getSubscriptionStatusLabel();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Icon path={mdiCrown} size={1.5} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-dark-text">
                  {getPlanLabel()}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Plano {company.plan_name === "pro" ? "Premium" : "Básico"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {!!company?.is_free && (
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm rounded-xl border border-green-200 dark:border-green-800">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Icon path={mdiCheckCircle} size={1.2} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Período Grátis</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                      Até {getFreePlanEndDate()}
                    </p>
                  </div>
                </div>
              )}

              {statusLabel && (
                <div
                  className={classNames(
                    "flex items-center gap-3 p-4 backdrop-blur-sm rounded-xl border",
                    company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                      ? "bg-yellow-50/60 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      : company.subscription_status === "EXPIRED"
                      ? "bg-red-50/60 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : "bg-blue-50/60 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  )}
                >
                  <div
                    className={classNames(
                      "p-2 rounded-lg",
                      company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : company.subscription_status === "EXPIRED"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                    )}
                  >
                    <Icon
                      path={
                        company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                          ? mdiAlertCircle
                          : company.subscription_status === "EXPIRED"
                          ? mdiCancel
                          : mdiCheckCircle
                      }
                      size={1.2}
                      className={classNames(
                        company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                          ? "text-yellow-600 dark:text-yellow-400"
                          : company.subscription_status === "EXPIRED"
                          ? "text-red-600 dark:text-red-400"
                          : "text-blue-600 dark:text-blue-400"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Status</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text">{statusLabel}</p>
                  </div>
                </div>
              )}

              {!!company?.last_billed_at && !company?.cancel_at_period_end && (
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon path={mdiCalendarClock} size={1.2} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Próxima Cobrança</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                      {getNextBillingDate()}
                    </p>
                  </div>
                </div>
              )}

              {company?.current_period_end && (
                <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-border">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Icon path={mdiCreditCard} size={1.2} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Período Atual</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                      Até {moment(company.current_period_end).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[220px]">
            {!company?.cancel_at_period_end && (
              <>
                <button
                  onClick={onNavigateToUpgrade}
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <span>Alterar Plano</span>
                  <Icon path={mdiArrowRight} size={1} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onCancelSubscription}
                  disabled={isCanceling}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-dark-surface hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isCanceling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 dark:border-red-400 border-t-transparent"></div>
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    <>
                      <Icon path={mdiCancel} size={1} />
                      <span>Cancelar Plano</span>
                    </>
                  )}
                </button>
              </>
            )}
            {!!company?.cancel_at_period_end && (
              <button
                onClick={onReactivateSubscription}
                disabled={isReactivating}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isReactivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Reativando...</span>
                  </>
                ) : (
                  <>
                    <Icon path={mdiRefresh} size={1} />
                    <span>Reativar Assinatura</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


