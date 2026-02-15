import React from "react";
import { CompanyGeneralView } from "./CompanyGeneralView";
import { useCompanyModel } from "../models/useCompanyModel";

export function CompanyGeneralTab() {
  const {
    company,
    formValues,
    setFieldValue,
    logoFile,
    setLogoFile,
    bannerFile,
    setBannerFile,
    handleSave,
    isSaving,
  } = useCompanyModel();

  if (!company) {
    return null;
  }

  return (
    <CompanyGeneralView
      formValues={formValues}
      setFieldValue={setFieldValue}
      logoFile={logoFile}
      setLogoFile={setLogoFile}
      bannerFile={bannerFile}
      setBannerFile={setBannerFile}
      companyLogo={company.logo}
      companyBanner={company.banner}
      handleSave={handleSave}
      isSaving={isSaving}
    />
  );
}


