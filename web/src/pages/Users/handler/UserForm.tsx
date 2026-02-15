import React, { useState } from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Form } from "../../../components/Form";
import { UserFormValues, UserFormField } from "../types";
import "react-quill/dist/quill.snow.css";

interface UserFormProps {
  values: UserFormValues;
  fields: UserFormField[];
  additionalFields: UserFormField[];
  isEditing: boolean;
  isLoadingUser: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  formKey: number;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  setFieldValue: (field: keyof UserFormValues, value: any) => void;
  deleteUser: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function UserForm({
  values,
  fields,
  additionalFields,
  isEditing,
  isLoadingUser,
  isSaving,
  isDeleting,
  formKey,
  imageFile,
  setImageFile,
  setFieldValue,
  deleteUser,
  handleSubmit,
  handleBack,
}: UserFormProps) {
  const [activeTab, setActiveTab] = useState("geral");

  const tabs = [
    { id: "geral", label: "Geral" },
    { id: "adicional", label: "Adicional" },
  ];

  if (isEditing && isLoadingUser) {
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
      <style>{`
        .user-description-editor .ql-container {
          min-height: 400px !important;
          height: 400px !important;
        }
        .user-description-editor .ql-editor {
          min-height: 350px !important;
          height: 350px !important;
        }
        .user-description-editor .ql-toolbar {
          border-top: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-bottom: none;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        .user-description-editor .ql-container {
          border-bottom: 1px solid #ccc;
          border-left: 1px solid #ccc;
          border-right: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
        }
      `}</style>
      <div className="flex items-center mt-4 md:mt-8 ml-4 md:ml-10 gap-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-surface-hover transition-all"
        >
          <Icon path={mdiArrowLeft} size={1.2} className="text-navy-900 dark:text-dark-text" />
        </button>
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
          {isEditing ? 'Editar usuário' : 'Criar usuário'}
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
                    onClick={deleteUser}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Apagando...' : 'Apagar usuário'}
                  </button>
                </div>
              )}
            </Form>
          )}

          {activeTab === "adicional" && (
            <Form
              fields={additionalFields}
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
                    onClick={deleteUser}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Apagando...' : 'Apagar usuário'}
                  </button>
                </div>
              )}
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}

