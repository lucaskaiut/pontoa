import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FileUpload from "../../components/FileUpload";
import { Input } from "../../components/Input";
import { InputPhone } from "../../components/InputPhone";
import { DescriptionEditor } from "../Users/components/DescriptionEditor";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useCompany } from "../../contexts/CompanyContext";
import { Loading } from "../../components/ui/atoms";
import classNames from "classnames";
import moment from "moment";
import "moment/locale/pt-br";

export function StoreForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userCompanyId, isSuperadmin } = useCompany();
  const isCreating = !id;
  const [activeTab, setActiveTab] = useState("geral");
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsMetadata, setSettingsMetadata] = useState({});
  const [planType, setPlanType] = useState("basic");
  const [recurrenceType, setRecurrenceType] = useState("monthly");
  const [planCalculation, setPlanCalculation] = useState(null);
  const [isCalculatingPlan, setIsCalculatingPlan] = useState(false);
  const [planFields, setPlanFields] = useState({
    current_period_end: '',
    is_free: false,
    plan_price: '',
  });
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    document: '',
    domain: '',
    phone: '',
    support_phone: '',
    logo: '',
    banner: '',
    terms_and_conditions: '',
    active: true,
  });

  const { data: company, isLoading } = useQuery({
    queryKey: ["store", id],
    queryFn: async () => {
      if (!isSuperadmin || !userCompanyId) {
        throw new Error("Acesso negado");
      }

      const response = await api.get(`/companies/${id}`);
      return response.data?.data || response.data;
    },
    enabled: !!id && isSuperadmin && !!userCompanyId,
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["store-settings", id],
    queryFn: async () => {
      const response = await api.get("/settings", {
        params: {
          company_id: id,
        },
      });
      return response.data?.data || response.data || {};
    },
    enabled: activeTab === "configuracoes" && !!id && !isCreating && isSuperadmin && !!userCompanyId,
  });

  useEffect(() => {
    if (company) {
      setFormValues({
        name: company?.name || '',
        email: company?.email || '',
        document: company?.document || '',
        domain: company?.domain || '',
        phone: company?.phone || '',
        support_phone: company?.support_phone || '',
        logo: company?.logo || '',
        banner: company?.banner || '',
        terms_and_conditions: company?.terms_and_conditions || '',
        active: company?.active ?? true,
      });
      
      if (company.plan_name) {
        setPlanType(company.plan_name);
      }
      if (company.plan_recurrence) {
        setRecurrenceType(company.plan_recurrence);
      }
      
      setPlanFields({
        current_period_end: company?.current_period_end ? moment.utc(company.current_period_end).format('YYYY-MM-DDTHH:mm') : '',
        is_free: company?.is_free ?? false,
        plan_price: company?.plan_price || '',
      });
    }
  }, [company]);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      const formValues = {};
      const metadata = {};
      
      Object.keys(settings).forEach((key) => {
        const setting = settings[key];
        if (setting && typeof setting === 'object' && 'value' in setting) {
          formValues[key] = setting.value;
          metadata[key] = {
            label: setting.label || key,
            type: setting.type || 'text',
            options: setting.options
          };
        } else {
          formValues[key] = setting;
          metadata[key] = {
            label: key,
            type: 'text'
          };
        }
      });
      
      setSettingsForm(formValues);
      setSettingsMetadata(metadata);
    }
  }, [settings]);

  const setFieldValue = (field, value) => {
    setFormValues({...formValues, [field]: value});
  };

  const handlePhoneInput = (field, value) => {
    setFieldValue(field, value.replace(/\D/g, ''));
  };

  const extension = (filename) => {
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
  };

  const submitFile = async (file, filename) => {
    const formData = new FormData();
    formData.append('name', filename);
    formData.append('file', file);
    const response = await api.post('/files', formData);
    return response.data.path;
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post("/companies", payload);
    },
    onSuccess: () => {
      toast.success("Loja criada com sucesso!");
      navigate("/lojas");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao criar loja. Tente novamente.";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.put(`/companies/${id}`, payload);
    },
    onSuccess: () => {
      toast.success("Loja atualizada com sucesso!");
      navigate("/lojas");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao atualizar loja. Tente novamente.";
      toast.error(message);
    },
  });

  const setSettingValue = (key, value) => {
    setSettingsForm({...settingsForm, [key]: value});
  };

  const handleSave = async () => {
    const payload = { ...formValues };

    if (logoFile) {
      const logo = await submitFile(logoFile, 'logo.' + extension(logoFile.name));
      payload.logo = logo;
    }
    
    if (bannerFile) {
      const banner = await submitFile(bannerFile, 'banner.' + extension(bannerFile.name));
      payload.banner = banner;
    }

    if (isCreating) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post("/settings", settingsForm, {
        params: {
          company_id: id,
        },
      });
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  const calculatePlanChange = async () => {
    if (!id) return;
    
    setIsCalculatingPlan(true);
    try {
      const response = await api.post("/companies/calculate-plan-change", {
        plan_type: planType,
        recurrence_type: recurrenceType,
        company_id: id,
      });
      setPlanCalculation(response.data?.data);
    } catch (error) {
      toast.error("Erro ao calcular alteração do plano");
    } finally {
      setIsCalculatingPlan(false);
    }
  };

  useEffect(() => {
    if (activeTab === "plano" && id && planType && recurrenceType && company) {
      const timeoutId = setTimeout(() => {
        calculatePlanChange();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, planType, recurrenceType, id, company?.plan_name, company?.plan_recurrence]);

  const changePlanMutation = useMutation({
    mutationFn: async () => {
      return await api.post("/companies/change-plan", {
        plan_type: planType,
        recurrence_type: recurrenceType,
        company_id: id,
      });
    },
    onSuccess: () => {
      toast.success("Plano alterado com sucesso!");
      navigate("/lojas");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao alterar plano. Tente novamente.";
      toast.error(message);
    },
  });

  const handleChangePlan = () => {
    if (!planCalculation) {
      toast.error("Calcule a alteração do plano primeiro");
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja alterar o plano? Valor final: R$ ${planCalculation.final_amount?.toFixed(2) || '0.00'}`)) {
      changePlanMutation.mutate();
    }
  };

  const updatePlanFieldsMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.put(`/companies/${id}`, payload);
    },
    onSuccess: () => {
      toast.success("Campos do plano atualizados com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["store", id] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao atualizar campos do plano. Tente novamente.";
      toast.error(message);
    },
  });

  const updateFreePeriodMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post(`/companies/${id}/update-free-period`, payload);
    },
    onSuccess: () => {
      toast.success("Período grátis atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["store", id] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao atualizar período grátis. Tente novamente.";
      toast.error(message);
    },
  });

  const handleSavePlanFields = async () => {
    const payload = {
      current_period_end: planFields.current_period_end ? moment.utc(planFields.current_period_end).toISOString() : null,
      is_free: planFields.is_free,
      plan_price: planFields.plan_price ? parseFloat(planFields.plan_price) : null,
    };

    updatePlanFieldsMutation.mutate(payload);
  };

  const handleSaveFreePeriod = async () => {
    if (planFields.is_free && !planFields.current_period_end) {
      toast.error("O campo 'Data da Próxima Cobrança' é obrigatório quando o período é grátis");
      return;
    }

    const payload = {
      is_free: planFields.is_free,
      current_period_end: planFields.current_period_end ? moment.utc(planFields.current_period_end).toISOString() : null,
    };

    updateFreePeriodMutation.mutate(payload);
  };

  const setPlanFieldValue = (field, value) => {
    setPlanFields({...planFields, [field]: value});
  };

  const getPlanLabel = () => {
    if (!company?.plan_name || !company?.plan_recurrence) {
      return "Sem plano";
    }
    const planLabels = {
      basic: "Básico",
      pro: "Premium",
    };
    const recurrenceLabels = {
      monthly: "Mensal",
      yearly: "Anual",
    };
    return `${planLabels[company.plan_name] || company.plan_name} - ${recurrenceLabels[company.plan_recurrence] || company.plan_recurrence}`;
  };

  const renderSettingField = (key) => {
    const value = settingsForm[key];
    const metadata = settingsMetadata[key] || { label: key, type: 'text' };
    const type = metadata.type?.toLowerCase() || 'text';
    
    if (type === 'boolean' || type === 'bool') {
      return (
        <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-dark-text">{metadata.label}</span>
          </div>
          <button
            type="button"
            onClick={() => setSettingValue(key, !value)}
            className={classNames(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              {
                'bg-primary dark:bg-blue-600': value,
                'bg-gray-300 dark:bg-gray-600': !value
              }
            )}
          >
            <span
              className={classNames(
                "inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform",
                {
                  'translate-x-6': value,
                  'translate-x-1': !value
                }
              )}
            />
          </button>
        </div>
      );
    }
    
    if (type === 'multiselect') {
      const arrayValue = Array.isArray(value) ? value : [];
      const options = metadata.options || [];

      return (
        <div className="w-full">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
            {metadata.label}
          </label>
          <div className="space-y-2">
            {options.map((option) => {
              const isChecked = arrayValue.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSettingValue(key, [...arrayValue, option.value]);
                      } else {
                        setSettingValue(key, arrayValue.filter(v => v !== option.value));
                      }
                    }}
                    className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-dark-text">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (type === 'select') {
      const options = metadata.options || [];
      return (
        <div className="w-full">
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-dark-text">
            {metadata.label}
          </label>
          <select
            value={value ?? ''}
            onChange={(e) => setSettingValue(key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
          >
            <option value="">Selecione...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    
    if (type === 'array' || type === 'json-array') {
      const arrayString = Array.isArray(value) ? JSON.stringify(value, null, 2) : (value || '[]');
      return (
        <div className="w-full">
          <label className="block mb-1 text-gray-700 dark:text-dark-text">{metadata.label}</label>
          <textarea
            value={arrayString}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                if (Array.isArray(parsed)) {
                  setSettingValue(key, parsed);
                } else {
                  setSettingValue(key, [parsed]);
                }
              } catch {
                const lines = e.target.value.split('\n').filter(line => line.trim());
                setSettingValue(key, lines);
              }
            }}
            placeholder='["item1", "item2"]'
            rows={4}
            className={classNames(
              "bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none font-mono text-sm",
              "border-gray-300 dark:border-dark-border"
            )}
          />
        </div>
      );
    }
    
    if (type === 'int' || type === 'integer' || type === 'float' || type === 'double') {
      return (
        <Input
          type="number"
          label={metadata.label}
          placeholder=""
          onChange={(event) => {
            const numValue = type === 'float' || type === 'double' 
              ? parseFloat(event.target.value) 
              : parseInt(event.target.value, 10);
            setSettingValue(key, isNaN(numValue) ? 0 : numValue);
          }}
          value={value ?? ''}
        />
      );
    }
    
    if (type === 'json') {
      return (
        <div className="w-full">
          <label className="block mb-1 text-gray-700 dark:text-dark-text">{metadata.label}</label>
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : (value || '')}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setSettingValue(key, parsed);
              } catch {
                setSettingValue(key, e.target.value);
              }
            }}
            placeholder=""
            rows={4}
            className={classNames(
              "bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 resize-none",
              "border-gray-300 dark:border-dark-border"
            )}
          />
        </div>
      );
    }
    
    return (
      <Input
        type="text"
        label={metadata.label}
        placeholder=""
        onChange={(event) => setSettingValue(key, event.target.value)}
        value={value ?? ''}
      />
    );
  };

  if (!isCreating && isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!isCreating && !company) {
    return (
      <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
        <div className="mt-4 md:mt-10 px-4 md:px-10">
          <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold mb-6">
            Loja não encontrada
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="mt-4 md:mt-10 px-4 md:px-10">
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold mb-6">
          {isCreating ? "Criar Nova Loja" : `Editar Loja: ${company.name}`}
        </h1>
      </div>
      
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl max-w-full border border-gray-100 dark:border-dark-border">
        <div className="border-b border-gray-200 dark:border-dark-border">
            <nav className="flex -mb-px">
            {[
              { id: "geral", label: "Geral" },
              ...(isCreating ? [] : [
                { id: "configuracoes", label: "Configurações" },
                { id: "plano", label: "Plano" },
              ]),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={classNames(
                  "py-4 px-6 text-sm font-medium border-b-2 transition-colors",
                  {
                    "border-primary dark:border-blue-400 text-primary dark:text-blue-400": activeTab === tab.id,
                    "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-dark-text hover:border-gray-300 dark:hover:border-dark-border": activeTab !== tab.id,
                  }
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 md:px-10 py-6 md:py-10">
          {activeTab === "geral" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={handleSave} 
                  disabled={isCreating ? createMutation.isPending : updateMutation.isPending}
                  className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isCreating ? createMutation.isPending : updateMutation.isPending) ? "Salvando..." : "Salvar"}
                </button>
              </div>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Nome
                </label>
                <Input
                  type="text"
                  placeholder="Nome"
                  onChange={(event) => setFieldValue('name', event.target.value)}
                  value={formValues.name}
                  hideLabel
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  E-mail
                </label>
                <Input
                  type="text"
                  placeholder="E-mail"
                  onChange={(event) => setFieldValue('email', event.target.value)}
                  value={formValues.email}
                  hideLabel
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Telefone
                </label>
                <InputPhone
                  value={formValues.phone}
                  onChange={(event) => handlePhoneInput('phone', event.target.value)}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Telefone de suporte
                </label>
                <InputPhone
                  value={formValues.support_phone}
                  onChange={(event) => handlePhoneInput('support_phone', event.target.value)}
                />
              </div>
              <div className="w-full md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Documento
                </label>
                <Input
                  type="text"
                  placeholder="Documento"
                  onChange={(event) => setFieldValue('document', event.target.value)}
                  value={formValues.document}
                  hideLabel
                />
              </div>
              <div className="w-full md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Domínio
                </label>
                <Input
                  type="text"
                  placeholder="Domínio"
                  onChange={(event) => setFieldValue('domain', event.target.value)}
                  value={formValues.domain}
                  hideLabel
                />
              </div>
              <div className="w-full">
                <FileUpload
                  label="Logo"
                  value={formValues.logo || ""}
                  setSelectedFile={setLogoFile}
                  selectedFile={logoFile}
                />
              </div>
              <div className="w-full">
                <FileUpload
                  label="Banner"
                  value={formValues.banner || ""}
                  setSelectedFile={setBannerFile}
                  selectedFile={bannerFile}
                />
              </div>
              <div className="w-full md:col-span-2 lg:col-span-3">
                <DescriptionEditor
                  label="Termos e Condições"
                  value={formValues.terms_and_conditions}
                  onChange={(value) => setFieldValue('terms_and_conditions', value)}
                />
              </div>
              </div>
            </div>
          )}

          {!isCreating && activeTab === "configuracoes" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={handleSaveSettings} 
                  className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all"
                >
                  Salvar
                </button>
              </div>
              
              {settingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.keys(settingsForm).map((key) => (
                    <div key={key} className="w-full">
                      {renderSettingField(key)}
                    </div>
                  ))}
                  {Object.keys(settingsForm).length === 0 && !settingsLoading && (
                    <p className="text-gray-500 col-span-full">Nenhuma configuração disponível.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!isCreating && activeTab === "plano" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">
                  Plano Atual
                </h3>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-surface-hover rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                      {getPlanLabel()}
                    </p>
                    {company?.plan_price && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        R$ {company.plan_price.toFixed(2)} / {company.plan_recurrence === 'monthly' ? 'mês' : 'ano'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">
                  Alterar Plano
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      Tipo de Plano
                    </label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
                    >
                      <option value="basic">Básico</option>
                      <option value="pro">Premium</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      Recorrência
                    </label>
                    <select
                      value={recurrenceType}
                      onChange={(e) => setRecurrenceType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>

                {isCalculatingPlan ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : planCalculation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-dark-text mb-2">
                      Cálculo da Alteração
                    </h4>
                    {planCalculation.current_plan && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Plano Atual: {planCalculation.current_plan.type_label} - {planCalculation.current_plan.recurrence_label} (R$ {planCalculation.current_plan.price?.toFixed(2)})
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Novo Plano: {planCalculation.new_plan.type_label} - {planCalculation.new_plan.recurrence_label} (R$ {planCalculation.new_plan.price?.toFixed(2)})
                    </p>
                    {planCalculation.prorated_discount > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                        Desconto Proporcional: R$ {planCalculation.prorated_discount?.toFixed(2)}
                      </p>
                    )}
                    <p className="text-lg font-bold text-gray-900 dark:text-dark-text">
                      Valor Final: R$ {planCalculation.final_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleChangePlan}
                    disabled={changePlanMutation.isPending || !planCalculation}
                    className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePlanMutation.isPending ? "Alterando..." : "Alterar Plano"}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">
                  Gerenciar Período Grátis
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Controle seguro do período grátis. Quando ativado, a cobrança será baseada na data da próxima cobrança definida manualmente.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      É Período Grátis?
                    </label>
                    <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                          {planFields.is_free ? 'Sim - Período Grátis Ativo' : 'Não - Cobrança Normal'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {planFields.is_free ? 'A cobrança será baseada na data da próxima cobrança' : 'A cobrança será baseada na última cobrança realizada'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlanFieldValue('is_free', !planFields.is_free)}
                        className={classNames(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          {
                            'bg-primary dark:bg-blue-600': planFields.is_free,
                            'bg-gray-300 dark:bg-gray-600': !planFields.is_free
                          }
                        )}
                      >
                        <span
                          className={classNames(
                            "inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform",
                            {
                              'translate-x-6': planFields.is_free,
                              'translate-x-1': !planFields.is_free
                            }
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      Data da Próxima Cobrança {planFields.is_free && '*'}
                    </label>
                    <input
                      type="datetime-local"
                      value={planFields.current_period_end}
                      onChange={(e) => setPlanFieldValue('current_period_end', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
                      required={planFields.is_free}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {planFields.is_free 
                        ? 'Quando esta data passar, a empresa será cobrada (se tiver cartão)'
                        : 'Data opcional para controle manual da próxima cobrança'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveFreePeriod}
                    disabled={updateFreePeriodMutation.isPending}
                    className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateFreePeriodMutation.isPending ? "Salvando..." : "Salvar Período Grátis"}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">
                  Controle Manual do Plano
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Campos para controle manual pelo superadmin
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      Data da Próxima Cobrança
                    </label>
                    <input
                      type="datetime-local"
                      value={planFields.current_period_end}
                      onChange={(e) => setPlanFieldValue('current_period_end', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-700 dark:text-dark-text"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      Preço do Plano
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(event) => setPlanFieldValue('plan_price', event.target.value)}
                      value={planFields.plan_price}
                      hideLabel
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                      É Grátis?
                    </label>
                    <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                          {planFields.is_free ? 'Sim' : 'Não'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPlanFieldValue('is_free', !planFields.is_free)}
                        className={classNames(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          {
                            'bg-primary dark:bg-blue-600': planFields.is_free,
                            'bg-gray-300 dark:bg-gray-600': !planFields.is_free
                          }
                        )}
                      >
                        <span
                          className={classNames(
                            "inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform",
                            {
                              'translate-x-6': planFields.is_free,
                              'translate-x-1': !planFields.is_free
                            }
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePlanFields}
                    disabled={updatePlanFieldsMutation.isPending}
                    className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePlanFieldsMutation.isPending ? "Salvando..." : "Salvar Campos do Plano"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

