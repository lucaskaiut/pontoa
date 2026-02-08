import React from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Form } from "../../../components/Form";
import { ServiceFormValues, ServiceFormField } from "../types";

interface ServiceFormProps {
  values: ServiceFormValues;
  fields: ServiceFormField[];
  isEditing: boolean;
  isLoadingService: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof ServiceFormValues, value: any) => void;
  deleteService: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function ServiceForm({
  values,
  fields,
  isEditing,
  isLoadingService,
  isSaving,
  isDeleting,
  setFieldValue,
  deleteService,
  handleSubmit,
  handleBack,
}: ServiceFormProps) {
  if (isEditing && isLoadingService) {
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
          {isEditing ? 'Editar serviço' : 'Criar serviço'}
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
            gridCols={3}
          />
        </div>
      </div>
    </div>
  );
}

