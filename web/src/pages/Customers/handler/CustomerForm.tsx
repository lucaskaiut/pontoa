import React, { useState } from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Form } from "../../../components/Form";
import { MarkdownEditor } from "../../../components/MarkdownEditor/MarkdownEditor";
import { CustomerPackages } from "./CustomerPackages";
import { CustomerFormValues, CustomerFormField } from "../types";

interface CustomerFormProps {
  values: CustomerFormValues;
  fields: CustomerFormField[];
  isEditing: boolean;
  isLoadingCustomer: boolean;
  isSaving: boolean;
  isSavingContext: boolean;
  isDeleting: boolean;
  context: string;
  setContext: (value: string) => void;
  setFieldValue: (field: keyof CustomerFormValues, value: any) => void;
  deleteCustomer: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleSaveContext: () => Promise<void>;
  handleBack: () => void;
}

export function CustomerForm({
  values,
  fields,
  isEditing,
  isLoadingCustomer,
  isSaving,
  isSavingContext,
  isDeleting,
  context,
  setContext,
  setFieldValue,
  deleteCustomer,
  handleSubmit,
  handleSaveContext,
  handleBack,
}: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState<"geral" | "contexto" | "pacotes">("geral");

  const tabs = [
    { id: "geral" as const, label: "Geral" },
    ...(isEditing ? [{ id: "contexto" as const, label: "Contexto" }] : []),
    ...(isEditing ? [{ id: "pacotes" as const, label: "Pacotes" }] : []),
  ];

  if (isEditing && isLoadingCustomer) {
    return (
      <div className="overflow-auto min-h-full w-full">
        <div className="flex justify-center items-center min-h-full">
          <Oval
            height={40}
            width={40}
            color="#7b2cbf"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#7b2cbf"
            strokeWidth={4}
            strokeWidthSecondary={4}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="flex items-center mt-4 md:mt-8 ml-4 md:ml-10 gap-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-surface-hover transition-all"
        >
          <Icon path={mdiArrowLeft} size={1.2} className="text-navy-900 dark:text-dark-text" />
        </button>
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
          {isEditing ? 'Editar cliente' : 'Criar cliente'}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl border border-gray-100 dark:border-dark-border">
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
          {activeTab === "geral" && (
            <Form
              fields={fields}
              values={values}
              onChange={setFieldValue}
              onSubmit={handleSubmit}
              isSubmitting={isSaving}
              submitLabel="Salvar"
              submittingLabel="Salvando..."
              gridCols={2}
            >
              {isEditing && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-border">
                  <button 
                    type="button"
                    className="border-danger border py-3 px-6 rounded-lg text-danger hover:bg-danger hover:text-white transition-all text-sm" 
                    onClick={deleteCustomer}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Apagando...' : 'Apagar cliente'}
                  </button>
                </div>
              )}
            </Form>
          )}

          {activeTab === "contexto" && isEditing && (
            <div className="w-full">
              <MarkdownEditor
                value={context}
                onChange={setContext}
                placeholder="Digite o contexto do cliente em Markdown..."
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveContext}
                  disabled={isSavingContext}
                  className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50"
                >
                  {isSavingContext ? "Salvando..." : "Salvar Contexto"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "pacotes" && isEditing && (
            <div className="w-full">
              <CustomerPackages />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

