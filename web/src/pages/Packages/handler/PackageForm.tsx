import React, { useMemo } from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft, mdiPackageVariant } from "@mdi/js";
import { Form } from "../../../components/Form";
import { PackageFormValues, PackageFormField } from "../types";

interface PackageFormProps {
  values: PackageFormValues;
  fields: PackageFormField[];
  isEditing: boolean;
  isLoadingPackage: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof PackageFormValues, value: any) => void;
  deletePackage: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

interface FieldSection {
  title: string;
  fields: PackageFormField[];
}

export function PackageForm({
  values,
  fields,
  isEditing,
  isLoadingPackage,
  isSaving,
  isDeleting,
  setFieldValue,
  deletePackage,
  handleSubmit,
  handleBack,
}: PackageFormProps) {
  const sections: FieldSection[] = useMemo(() => {
    const basicFields = fields.filter(f => 
      f.name === 'name' || f.name === 'description'
    );
    const configFields = fields.filter(f => 
      f.name === 'total_sessions' || f.name === 'bonus_sessions' || 
      f.name === 'expires_in_days' || f.name === 'price' || f.name === 'is_active'
    );
    const serviceFields = fields.filter(f => f.name === 'services');

    const sectionsList: FieldSection[] = [];

    if (basicFields.length > 0) {
      sectionsList.push({ title: 'Informações Básicas', fields: basicFields });
    }
    if (configFields.length > 0) {
      sectionsList.push({ title: 'Configurações do Pacote', fields: configFields });
    }
    if (serviceFields.length > 0) {
      sectionsList.push({ title: 'Serviços Incluídos', fields: serviceFields });
    }

    return sectionsList;
  }, [fields]);

  if (isEditing && isLoadingPackage) {
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
          aria-label="Voltar"
        >
          <Icon path={mdiArrowLeft} size={1.2} className="text-navy-900 dark:text-dark-text" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <Icon path={mdiPackageVariant} size={1.5} className="text-primary dark:text-blue-400" />
          </div>
          <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
            {isEditing ? 'Editar Pacote' : 'Criar Novo Pacote'}
          </h1>
        </div>
      </div>
      
      <div className="m-4 md:m-10 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div 
            key={sectionIndex}
            className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm"
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
                onSubmit={handleSubmit}
                isSubmitting={isSaving}
                submitLabel=""
                submittingLabel=""
                showSubmitButton={false}
                gridCols={section.title === 'Serviços Incluídos' ? 1 : 3}
              />
            </div>
          </div>
        ))}
        
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border px-4 md:px-10 py-6 md:py-8 flex justify-between items-center gap-4">
          <div className="flex-1">
            {isEditing && (
              <button
                onClick={deletePackage}
                disabled={isDeleting}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isDeleting ? "Excluindo..." : "Excluir Pacote"}
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={isSaving}
              className="px-6 py-3 bg-gray-200 dark:bg-dark-surface-hover hover:bg-gray-300 dark:hover:bg-dark-border text-gray-700 dark:text-dark-text rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
            >
              {isSaving ? "Salvando..." : "Salvar Pacote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

