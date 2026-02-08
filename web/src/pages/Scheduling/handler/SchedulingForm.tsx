import React, { useMemo } from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Form } from "../../../components/Form";
import { SchedulingFormValues, NewSchedulingFormValues, SchedulingFormField, SchedulingCreateFormField } from "../types";

interface SchedulingFormProps {
  isEditing: boolean;
  values: SchedulingFormValues | NewSchedulingFormValues;
  fields: SchedulingFormField[] | SchedulingCreateFormField[];
  isLoading: boolean;
  isSaving: boolean;
  setFieldValue: (field: string, value: any) => void;
  handleSubmit: () => void;
  handleBack: () => void;
}

interface FieldSection {
  title: string;
  fields: (SchedulingFormField | SchedulingCreateFormField)[];
}

export function SchedulingForm({
  isEditing,
  values,
  fields,
  isLoading,
  isSaving,
  setFieldValue,
  handleSubmit,
  handleBack,
}: SchedulingFormProps) {
  const sections = useMemo(() => {
    const sections: FieldSection[] = [];
    
    if (isEditing) {
      const schedulingFields = fields.filter(f => 
        f.name === 'service_id' || f.name === 'user_id' || f.name === 'date'
      );
      const serviceDetailsFields = fields.filter(f => 
        f.name === 'service_details' || f.name === 'created_at' || f.name === 'status'
      );
      const customerDetailsFields = fields.filter(f => 
        f.name === 'customer_details' || f.name === 'user_details'
      );
      const actionsFields = fields.filter(f => f.name === 'actions');
      
      if (schedulingFields.length > 0) {
        sections.push({ title: 'Informações do Agendamento', fields: schedulingFields });
      }
      if (serviceDetailsFields.length > 0) {
        sections.push({ title: 'Detalhes do Serviço', fields: serviceDetailsFields });
      }
      if (customerDetailsFields.length > 0) {
        sections.push({ title: 'Informações do Cliente e Profissional', fields: customerDetailsFields });
      }
      if (actionsFields.length > 0) {
        sections.push({ title: 'Ações', fields: actionsFields });
      }
    } else {
      const schedulingFields = fields.filter(f => 
        f.name === 'service_id' || f.name === 'user_id' || f.name === 'date' || f.name === 'time'
      );
      const customerModeFields = fields.filter(f => f.name === 'customer_mode');
      const customerFields = fields.filter(f => 
        f.name === 'customer_id' || f.name === 'name' || f.name === 'email' || f.name === 'phone'
      );
      
      if (schedulingFields.length > 0) {
        sections.push({ title: 'Informações do Agendamento', fields: schedulingFields });
      }
      if (customerModeFields.length > 0 || customerFields.length > 0) {
        sections.push({ 
          title: 'Informações do Cliente', 
          fields: [...customerModeFields, ...customerFields] 
        });
      }
    }
    
    return sections;
  }, [fields, isEditing]);

  if (isLoading) {
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
          {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
        </h1>
      </div>
      
      <div className="m-4 md:m-10 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div 
            key={sectionIndex}
            className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden"
          >
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-hover">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-dark-text">
                {section.title}
              </h2>
            </div>
            <div className="px-4 md:px-10 py-6 md:py-8">
              <Form
                fields={section.fields}
                values={values}
                onChange={setFieldValue}
                onSubmit={() => {}}
                isSubmitting={false}
                submitLabel=""
                submittingLabel=""
                showSubmitButton={false}
                gridCols={2}
              />
            </div>
          </div>
        ))}
        
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border px-4 md:px-10 py-6">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleBack}
              className="px-6 py-2.5 rounded-lg text-gray-700 dark:text-dark-text bg-gray-100 dark:bg-dark-surface-hover hover:bg-gray-200 dark:hover:bg-dark-border transition-all font-medium"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-primary dark:bg-blue-600 px-6 py-2.5 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSaving 
                ? (isEditing ? "Salvando..." : "Criando...") 
                : (isEditing ? "Salvar Alterações" : "Criar Agendamento")
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
