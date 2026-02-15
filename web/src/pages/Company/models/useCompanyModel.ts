import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { CompanyFormValues, Company } from "../types";

export function useCompanyModel() {
  const { user, me } = useAuth();
  const company = user?.company as Company | undefined;

  const [formValues, setFormValues] = useState<CompanyFormValues>({
    name: "",
    email: "",
    document: "",
    domain: "",
    phone: "",
    support_phone: "",
    logo: "",
    banner: "",
    terms_and_conditions: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    if (company) {
      setFormValues({
        name: company?.name || "",
        email: company?.email || "",
        document: company?.document || "",
        domain: company?.domain || "",
        phone: company?.phone || "",
        support_phone: company?.support_phone || "",
        logo: company?.logo || "",
        banner: company?.banner || "",
        terms_and_conditions: company?.terms_and_conditions || "",
      });
    }
  }, [company]);

  const setFieldValue = (field: keyof CompanyFormValues, value: any) => {
    setFormValues({ ...formValues, [field]: value });
  };

  const extension = (filename: string): string => {
    return filename.substring(filename.lastIndexOf(".") + 1, filename.length) || filename;
  };

  const submitFile = async (file: File, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append("name", filename);
    formData.append("file", file);
    const response = await api.post("/files", formData);
    return response.data.path;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: CompanyFormValues) => {
      const finalPayload = { ...payload };

      if (logoFile) {
        const logo = await submitFile(logoFile, `logo.${extension(logoFile.name)}`);
        finalPayload.logo = logo;
      }

      if (bannerFile) {
        const banner = await submitFile(bannerFile, `banner.${extension(bannerFile.name)}`);
        finalPayload.banner = banner;
      }

      await api.put(`/companies/${company?.id}`, finalPayload);
    },
    onSuccess: async () => {
      toast.success("Dados salvos com sucesso!");
      await me();
    },
    onError: () => {
      toast.error("Erro ao salvar dados. Tente novamente.");
    },
  });

  const handleSave = async () => {
    await saveMutation.mutateAsync(formValues);
  };

  return {
    company,
    formValues,
    setFieldValue,
    logoFile,
    setLogoFile,
    bannerFile,
    setBannerFile,
    handleSave,
    isSaving: saveMutation.isPending,
  };
}






