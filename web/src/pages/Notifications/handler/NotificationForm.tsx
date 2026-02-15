import React from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Form } from "../../../components/Form";
import { NotificationFormValues, NotificationFormField } from "../types";
import "react-quill/dist/quill.snow.css";

interface NotificationFormProps {
  values: NotificationFormValues;
  fields: NotificationFormField[];
  isEditing: boolean;
  isLoadingNotification: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof NotificationFormValues, value: any) => void;
  deleteNotification: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function NotificationForm({
  values,
  fields,
  isEditing,
  isLoadingNotification,
  isSaving,
  isDeleting,
  setFieldValue,
  deleteNotification,
  handleSubmit,
  handleBack,
}: NotificationFormProps) {
  if (isEditing && isLoadingNotification) {
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
        .notification-message-editor .ql-container {
          min-height: 200px !important;
        }
        .notification-message-editor .ql-editor {
          min-height: 200px !important;
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
          {isEditing ? 'Editar notificação' : 'Criar notificação'}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl border border-gray-100 dark:border-dark-border">
        <div className="px-4 md:px-10 py-6 md:py-10">
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
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button 
                  type="button"
                  className="border-danger border py-3 px-6 rounded-lg text-danger hover:bg-danger hover:text-white transition-all text-sm" 
                  onClick={deleteNotification}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Apagando...' : 'Apagar notificação'}
                </button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

