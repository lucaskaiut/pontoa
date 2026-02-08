import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { CompanyGeneralTab } from "./tabs/general";
import { CompanySettingsTab } from "./tabs/settings";
import { CompanyPaymentTab } from "./tabs/payment";

export function Company() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  if (!user || !user.company) {
    return null;
  }

  const tabs = [
    { id: "general", label: "Geral" },
    { id: "settings", label: "Configurações" },
    { id: "payment", label: "Pagamento" },
  ];

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="mt-4 md:mt-10 px-4 md:px-10">
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold mb-6">
          Configurações
        </h1>
      </div>

      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl max-w-full border border-gray-100 dark:border-dark-border">
        <div className="border-b border-gray-200 dark:border-dark-border">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary dark:border-blue-400 text-primary dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-dark-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 md:px-10 py-6 md:py-10">
          {activeTab === "general" && <CompanyGeneralTab />}
          {activeTab === "settings" && <CompanySettingsTab activeTab={activeTab} />}
          {activeTab === "payment" && <CompanyPaymentTab />}
        </div>
      </div>
    </div>
  );
}


