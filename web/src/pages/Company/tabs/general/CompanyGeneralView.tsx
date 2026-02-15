import React from "react";
import FileUpload from "../../../components/FileUpload";
import { Input } from "../../../components/Input";
import { DescriptionEditor } from "../../Users/components/DescriptionEditor";
import { CompanyFormValues } from "../../types";

interface CompanyGeneralViewProps {
  formValues: CompanyFormValues;
  setFieldValue: (field: keyof CompanyFormValues, value: any) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  bannerFile: File | null;
  setBannerFile: (file: File | null) => void;
  companyLogo?: string;
  companyBanner?: string;
  handleSave: () => void;
  isSaving: boolean;
}

export function CompanyGeneralView({
  formValues,
  setFieldValue,
  logoFile,
  setLogoFile,
  bannerFile,
  setBannerFile,
  companyLogo,
  companyBanner,
  handleSave,
  isSaving,
}: CompanyGeneralViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>
      </div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="w-full">
          <Input
            type="text"
            placeholder="Nome"
            onChange={(event) => setFieldValue("name", event.target.value)}
            value={formValues.name}
          />
        </div>
        <div className="w-full">
          <Input
            type="text"
            placeholder="E-mail"
            onChange={(event) => setFieldValue("email", event.target.value)}
            value={formValues.email}
          />
        </div>
        <div className="w-full">
          <Input
            type="text"
            placeholder="Telefone"
            onChange={(event) => setFieldValue("phone", event.target.value)}
            value={formValues.phone}
          />
        </div>
        <div className="w-full md:col-span-2 lg:col-span-1">
          <Input
            type="text"
            placeholder="Documento"
            onChange={(event) => setFieldValue("document", event.target.value)}
            value={formValues.document}
          />
        </div>
        <div className="w-full md:col-span-2">
          <Input
            type="text"
            placeholder="Domínio"
            onChange={(event) => setFieldValue("domain", event.target.value)}
            value={formValues.domain}
          />
        </div>
        <div className="w-full">
          <FileUpload
            label="Logo"
            value={companyLogo || ""}
            setSelectedFile={setLogoFile}
            selectedFile={logoFile}
          />
        </div>
        <div className="w-full">
          <FileUpload
            label="Banner"
            value={companyBanner || ""}
            setSelectedFile={setBannerFile}
            selectedFile={bannerFile}
          />
        </div>
        <div className="w-full md:col-span-2 lg:col-span-3">
          <DescriptionEditor
            label="Termos e Condições"
            value={formValues.terms_and_conditions}
            onChange={(value) => setFieldValue("terms_and_conditions", value)}
          />
        </div>
      </div>
    </div>
  );
}


