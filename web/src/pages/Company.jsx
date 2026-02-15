import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { companyService } from "../services/companyService";
import toast from "react-hot-toast";
import classNames from "classnames";
import moment from "moment";
import "moment/locale/pt-br";
import { DescriptionEditor } from "./Users/components/DescriptionEditor";
import { Icon } from "@mdi/react";
import {
  mdiCrown,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiCancel,
  mdiCalendarClock,
  mdiCreditCard,
  mdiArrowRight,
  mdiRefresh,
  mdiPlus,
  mdiCheck,
} from "@mdi/js";
import { useCards } from "../hooks/useCards";
import InputMask from "react-input-mask";
import { validateData } from "../services/formValidation";
import { InputPhone } from "../components/InputPhone";


export function Company() {
  const { user, me } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("geral");
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsMetadata, setSettingsMetadata] = useState({});
  const { data: cards = [], isLoading: cardsLoading, refetch: refetchCards } = useCards();
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [card, setCard] = useState({
    number: "",
    holder_name: "",
    holder_document: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });
  const [cardDue, setCardDue] = useState("");
  const [cardFormErrors, setCardFormErrors] = useState({});
  
  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data?.data || response.data || {};
    },
    enabled: activeTab === "configuracoes",
  });

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
  
  if (!user || !user.company) {
    return null;
  }
  
  const { company } = user;
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [formValues, setFormValues] = useState({
    name: company?.name || '',
    email: company?.email || '',
    document: company?.document || '',
    domain: company?.domain || '',
    phone: company?.phone || '',
    support_phone: company?.support_phone || '',
    logo: company?.logo || '',
    banner: company?.banner || '',
    terms_and_conditions: company?.terms_and_conditions || '',
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
      });
    }
  }, [company]);

  const setFieldValue = (field, value) => {
    setFormValues({...formValues, [field]: value});
  }

  const setSettingValue = (key, value) => {
    setSettingsForm({...settingsForm, [key]: value});
  }

  const getFreePlanEndDate = () => {
    // New format: use plan_trial_ends_at
    if (company?.plan_trial_ends_at) {
      return moment(company.plan_trial_ends_at).format("DD/MM/YYYY");
    }
    
    // Legacy format fallback
    if (company?.created_at && company?.plan?.free != null) {
      const freeDays = Number(company.plan.free) || 0;
      return moment(company.created_at).add(freeDays, "days").format("DD/MM/YYYY");
    }

    return "";
  };

  const getNextBillingDate = () => {
    console.log(company);
    if (company?.is_free && company?.plan_trial_ends_at && moment(company.plan_trial_ends_at).isAfter(moment())) {
      return moment(company.plan_trial_ends_at).format("DD/MM/YYYY");
    }

    if (company?.last_billed_at) {
      let daysToAdd = 30;
      
      if (company.plan_recurrence === "yearly") {
        daysToAdd = 365;
      } else if (company.plan_recurrence === "monthly") {
        daysToAdd = 30;
      } else if (company.plan?.days) {
        daysToAdd = Number(company.plan.days) || 30;
      }

      return moment(company.last_billed_at).add(daysToAdd, "days").format("DD/MM/YYYY");
    }

    // If no last_billed_at but has trial_end, use trial_end
    if (company?.plan_trial_ends_at) {
      return moment(company.plan_trial_ends_at).format("DD/MM/YYYY");
    }

    return "";
  };

  const getPlanLabel = () => {
    if (company?.plan_name && company?.plan_recurrence) {
      const planTypeLabel = company.plan_name === "pro" ? "PRO (com IA)" : "Básico";
      const recurrenceLabel = company.plan_recurrence === "yearly" ? "Anual" : "Mensal";
      return `${planTypeLabel} - ${recurrenceLabel}`;
    }
    
    if (company?.plan?.name) {
      return company.plan.name;
    }
    
    return "Plano";
  };

  const getSubscriptionStatusLabel = () => {
    if (!company?.subscription_status) {
      return null;
    }

    const status = company.subscription_status;
    
    if (status === "CANCELED" && !!company?.cancel_at_period_end) {
      if (company?.current_period_end) {
        const endDate = moment(company.current_period_end);
        if (endDate.isAfter(moment())) {
          return `Cancelamento agendado - Ativo até ${endDate.format("DD/MM/YYYY")}`;
        }
      }
      return "Cancelamento agendado";
    }

    if (status === "EXPIRED") {
      return "Plano expirado";
    }

    if (status === "SUSPENDED") {
      return "Plano suspenso";
    }

    if (status === "ACTIVE" && company?.current_period_end) {
      return `Ativo até ${moment(company.current_period_end).format("DD/MM/YYYY")}`;
    }

    return "Ativo";
  };

  const getSubscriptionStatusColor = () => {
    if (!company?.subscription_status) {
      return "bg-primary";
    }

    const status = company.subscription_status;
    
    if (status === "CANCELED" && company?.cancel_at_period_end) {
      return "bg-yellow-500 dark:bg-yellow-600";
    }

    if (status === "EXPIRED") {
      return "bg-red-500 dark:bg-red-600";
    }

    if (status === "SUSPENDED") {
      return "bg-orange-500 dark:bg-orange-600";
    }

    return "bg-green-500 dark:bg-green-600";
  };

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await companyService.cancelSubscription();
    },
    onSuccess: async () => {
      toast.success("Assinatura cancelada com sucesso. Você terá acesso até o fim do período pago.");
      try {
        await me();
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao cancelar assinatura. Tente novamente.";
      toast.error(message);
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await companyService.reactivateSubscription();
    },
    onSuccess: async () => {
      toast.success("Assinatura reativada com sucesso!");
      try {
        await me();
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao reativar assinatura. Tente novamente.";
      toast.error(message);
    },
  });

  const handleCancelSubscription = () => {
    if (window.confirm("Tem certeza que deseja cancelar sua assinatura? Você terá acesso até o fim do período pago, mas a assinatura não será renovada.")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handleReactivateSubscription = () => {
    if (window.confirm("Deseja reativar sua assinatura? A renovação automática será restaurada.")) {
      reactivateSubscriptionMutation.mutate();
    }
  };

  const handleMaskedInput = (field, value) => {
    setCard({ ...card, [field]: value.replace(/\D/g, "") });
  };

  const handlePhoneInput = (field, value) => {
    setFieldValue(field, value.replace(/\D/g, ''));
  };

  const handleDueInput = (value) => {
    setCardDue(value);
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length >= 2) {
      const month = numericValue.substring(0, 2);
      const year = numericValue.substring(2);
      if (year.length === 2) {
        const fullYear = `20${year}`;
        setCard({
          ...card,
          exp_month: month,
          exp_year: fullYear,
        });
      } else if (year.length === 4) {
        setCard({
          ...card,
          exp_month: month,
          exp_year: year,
        });
      } else {
        setCard({
          ...card,
          exp_month: month,
          exp_year: "",
        });
      }
    }
  };

  const validateCard = () => {
    const rules = {
      number: ["required", "length:16"],
      holder_name: ["required"],
      holder_document: ["required", "length:11"],
      exp_month: ["required", "length:2"],
      exp_year: ["required", "length:4"],
      cvv: ["required", "length:3"],
    };

    const errors = validateData(card, rules);
    setCardFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addCardMutation = useMutation({
    mutationFn: async (cardData) => {
      return await companyService.updateCreditCard(cardData);
    },
    onSuccess: async () => {
      toast.success("Cartão adicionado com sucesso!");
      setShowCreditCardForm(false);
      setCard({
        number: "",
        holder_name: "",
        holder_document: "",
        exp_month: "",
        exp_year: "",
        cvv: "",
      });
      setCardDue("");
      setCardFormErrors({});
      try {
        await me();
        await refetchCards();
      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao adicionar cartão. Tente novamente.";
      toast.error(message);
    },
  });

  const setActiveCardMutation = useMutation({
    mutationFn: async (cardId) => {
      return await companyService.setActiveCard(cardId);
    },
    onSuccess: async () => {
      toast.success("Cartão ativo atualizado com sucesso!");
      try {
        await me();
        await refetchCards();
      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao atualizar cartão ativo. Tente novamente.";
      toast.error(message);
    },
  });

  const handleAddCard = () => {
    if (!validateCard()) {
      toast.error("Por favor, preencha todos os dados do cartão corretamente");
      return;
    }

    addCardMutation.mutate(card);
  };

  const handleSetActiveCard = (cardId) => {
    if (window.confirm("Deseja definir este cartão como ativo?")) {
      setActiveCardMutation.mutate(cardId);
    }
  };

  const saveCompanyMutation = useMutation({
    mutationFn: async (payload) => {
      return await companyService.update(company.id, payload);
    },
    onSuccess: async () => {
      toast.success("Dados salvos com sucesso!");
      try {
        await me();
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao salvar dados. Tente novamente.";
      toast.error(message);
    },
  });

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

    saveCompanyMutation.mutate(payload);
  }

  const saveSettingsMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post("/settings", payload);
    },
    onSuccess: () => {
      toast.success("Configurações salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações");
    },
  });

  const handleSaveSettings = async () => {
    saveSettingsMutation.mutate(settingsForm);
  }

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
                        setSettingValue(
                          key,
                          arrayValue.filter((v) => v !== option.value)
                        );
                      }
                    }}
                    className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2 dark:bg-dark-surface dark:border-dark-border"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-dark-text">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (type === 'array') {
      const arrayValue = Array.isArray(value) ? value : [];
      const arrayString = JSON.stringify(arrayValue, null, 2);
      
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
  }

  const extension = (filename) => {
    return filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename;
  }

  const submitFile = async (file, filename) => {
    const formData = new FormData();

    formData.append('name', filename);
    formData.append('file', file);

    const response = await api.post('/files', formData);
    return response.data.path;
  }

  const tabs = [
    { id: "geral", label: "Geral" },
    { id: "configuracoes", label: "Configurações" },
    { id: "pagamento", label: "Pagamento" },
  ];

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="mt-4 md:mt-10 px-4 md:px-10">
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold mb-6">
          Configurações
        </h1>
      </div>
      
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl max-w-full border border-gray-100 dark:border-dark-border">
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
            <div className="flex flex-col gap-3">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={handleSave} 
                  disabled={saveCompanyMutation.isPending}
                  className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveCompanyMutation.isPending ? "Salvando..." : "Salvar"}
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
                    value={company?.logo || ''}
                    setSelectedFile={setLogoFile}
                    selectedFile={logoFile}
                  />
                </div>
                <div className="w-full">
                  <FileUpload
                    label="Banner"
                    value={company?.banner || ''}
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

          {activeTab === "configuracoes" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end mb-4">
                <button 
                  onClick={handleSaveSettings} 
                  disabled={saveSettingsMutation.isPending}
                  className="bg-primary dark:bg-blue-600 px-6 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveSettingsMutation.isPending ? "Salvando..." : "Salvar"}
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

          {activeTab === "pagamento" && (
            <div className="flex flex-col gap-6">
              {company?.plan_name && company?.plan_recurrence && (
                <div className="relative overflow-hidden bg-linear-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="relative p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                            <Icon path={mdiCrown} size={1.5} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-dark-text">
                              {getPlanLabel()}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Plano {company.plan_name === "pro" ? "Premium" : "Básico"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {!!company?.is_free && (
                            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm rounded-xl border border-green-200 dark:border-green-800">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Icon path={mdiCheckCircle} size={1.2} className="text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Período Grátis</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                                  Até {getFreePlanEndDate()}
                                </p>
                              </div>
                            </div>
                          )}

                          {getSubscriptionStatusLabel() && (
                            <div className={classNames(
                              "flex items-center gap-3 p-4 backdrop-blur-sm rounded-xl border",
                              company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                                ? "bg-yellow-50/60 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                : company.subscription_status === "EXPIRED"
                                ? "bg-red-50/60 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                : "bg-blue-50/60 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            )}>
                              <div className={classNames(
                                "p-2 rounded-lg",
                                company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                                  : company.subscription_status === "EXPIRED"
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-blue-100 dark:bg-blue-900/30"
                              )}>
                                <Icon 
                                  path={
                                    company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                                      ? mdiAlertCircle
                                      : company.subscription_status === "EXPIRED"
                                      ? mdiCancel
                                      : mdiCheckCircle
                                  } 
                                  size={1.2} 
                                  className={classNames(
                                    company.subscription_status === "CANCELED" && !!company?.cancel_at_period_end
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : company.subscription_status === "EXPIRED"
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-blue-600 dark:text-blue-400"
                                  )} 
                                />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Status</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                                  {getSubscriptionStatusLabel()}
                                </p>
                              </div>
                            </div>
                          )}

                          {!!company?.last_billed_at && !company?.cancel_at_period_end && (
                            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm rounded-xl border border-blue-200 dark:border-blue-800">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Icon path={mdiCalendarClock} size={1.2} className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Próxima Cobrança</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                                  {getNextBillingDate()}
                                </p>
                              </div>
                            </div>
                          )}

                          {company?.current_period_end && (
                            <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-dark-surface/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-border">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Icon path={mdiCreditCard} size={1.2} className="text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Período Atual</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-dark-text">
                                  Até {moment(company.current_period_end).format("DD/MM/YYYY")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:min-w-[220px]">
                        {!company?.cancel_at_period_end && (
                          <>
                            <button
                              onClick={() => navigate("/upgrade")}
                              className="group flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                              <span>Alterar Plano</span>
                              <Icon path={mdiArrowRight} size={1} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                              onClick={handleCancelSubscription}
                              disabled={cancelSubscriptionMutation.isPending}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-dark-surface hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                            >
                              {cancelSubscriptionMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 dark:border-red-400 border-t-transparent"></div>
                                  <span>Cancelando...</span>
                                </>
                              ) : (
                                <>
                                  <Icon path={mdiCancel} size={1} />
                                  <span>Cancelar Plano</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                        {!!company?.cancel_at_period_end && (
                          <button
                            onClick={handleReactivateSubscription}
                            disabled={reactivateSubscriptionMutation.isPending}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            {reactivateSubscriptionMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Reativando...</span>
                              </>
                            ) : (
                              <>
                                <Icon path={mdiRefresh} size={1} />
                                <span>Reativar Assinatura</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border shadow-lg">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-1">
                        Cartões de Crédito
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gerencie seus cartões de pagamento
                      </p>
                    </div>
                    {!showCreditCardForm && (
                      <button
                        onClick={() => setShowCreditCardForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Icon path={mdiPlus} size={1} />
                        <span>Adicionar Cartão</span>
                      </button>
                    )}
                  </div>

                  {cardsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : cards.length === 0 && !showCreditCardForm ? (
                    <div className="text-center py-12">
                      <Icon path={mdiCreditCard} size={3} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum cartão cadastrado</p>
                      <button
                        onClick={() => setShowCreditCardForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Icon path={mdiPlus} size={1} />
                        <span>Adicionar Primeiro Cartão</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cards.map((cardItem) => (
                        <div
                          key={cardItem.id}
                          className={classNames(
                            "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                            company?.card_id === cardItem.id
                              ? "bg-purple-50 dark:bg-purple-900/20 border-purple-400 dark:border-purple-600"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-dark-border hover:border-purple-300 dark:hover:border-purple-700"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-linear-to-br from-purple-500 to-blue-500 rounded-lg">
                              <Icon path={mdiCreditCard} size={1.5} className="text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-dark-text">
                                {cardItem.card_number || `${cardItem.first_six_digits || "****"}******${cardItem.last_four_digits || "****"}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {company?.card_id === cardItem.id && (
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full flex items-center gap-1">
                                <Icon path={mdiCheck} size={0.8} />
                                Ativo
                              </span>
                            )}
                            {company?.card_id !== cardItem.id && (
                              <button
                                onClick={() => handleSetActiveCard(cardItem.id)}
                                disabled={setActiveCardMutation.isPending}
                                className="px-4 py-2 bg-white dark:bg-dark-surface hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Definir como Ativo
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showCreditCardForm && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                          Adicionar Novo Cartão
                        </h4>
                        <button
                          onClick={() => {
                            setShowCreditCardForm(false);
                            setCard({
                              number: "",
                              holder_name: "",
                              holder_document: "",
                              exp_month: "",
                              exp_year: "",
                              cvv: "",
                            });
                            setCardDue("");
                            setCardFormErrors({});
                          }}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <Icon path={mdiCancel} size={1.2} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Nome do Portador
                          </label>
                          <input
                            type="text"
                            placeholder="Nome como está no cartão"
                            value={card.holder_name}
                            onChange={(e) => setCard({ ...card, holder_name: e.target.value })}
                            className={classNames(
                              "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface",
                              "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                              {
                                "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.holder_name,
                                "border-gray-200 dark:border-dark-border": !cardFormErrors.holder_name
                              }
                            )}
                          />
                          {cardFormErrors.holder_name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">Nome obrigatório</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            CPF do Portador
                          </label>
                          <InputMask
                            type="text"
                            placeholder="000.000.000-00"
                            value={card.holder_document}
                            onChange={(e) => handleMaskedInput("holder_document", e.target.value)}
                            mask="999.999.999-99"
                          >
                            {(props) => (
                              <input
                                className={classNames(
                                  "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface",
                                  "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                                  {
                                    "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.holder_document,
                                    "border-gray-200 dark:border-dark-border": !cardFormErrors.holder_document
                                  }
                                )}
                                {...props}
                              />
                            )}
                          </InputMask>
                          {cardFormErrors.holder_document && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">CPF inválido</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Número do Cartão
                          </label>
                          <InputMask
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={card.number}
                            onChange={(e) => handleMaskedInput("number", e.target.value)}
                            mask="9999 9999 9999 9999"
                          >
                            {(props) => (
                              <input
                                className={classNames(
                                  "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono text-lg",
                                  "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                                  {
                                    "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.number,
                                    "border-gray-200 dark:border-dark-border": !cardFormErrors.number
                                  }
                                )}
                                {...props}
                              />
                            )}
                          </InputMask>
                          {cardFormErrors.number && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">Número do cartão inválido</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Validade
                            </label>
                            <InputMask
                              type="text"
                              placeholder="MM/AA"
                              value={cardDue}
                              onChange={(e) => handleDueInput(e.target.value)}
                              mask="99/99"
                            >
                              {(props) => (
                                <input
                                  className={classNames(
                                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono",
                                    "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                                    {
                                      "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.exp_month || cardFormErrors.exp_year,
                                      "border-gray-200 dark:border-dark-border": !cardFormErrors.exp_month && !cardFormErrors.exp_year
                                    }
                                  )}
                                  {...props}
                                />
                              )}
                            </InputMask>
                            {(cardFormErrors.exp_month || cardFormErrors.exp_year) && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Data inválida</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              CVV
                            </label>
                            <InputMask
                              type="text"
                              placeholder="123"
                              value={card.cvv}
                              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                              mask="999"
                            >
                              {(props) => (
                                <input
                                  className={classNames(
                                    "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono",
                                    "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                                    {
                                      "border-red-300 bg-red-50 dark:bg-red-900/20": cardFormErrors.cvv,
                                      "border-gray-200 dark:border-dark-border": !cardFormErrors.cvv
                                    }
                                  )}
                                  {...props}
                                />
                              )}
                            </InputMask>
                            {cardFormErrors.cvv && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">CVV inválido</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleAddCard}
                            disabled={addCardMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addCardMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Adicionando...</span>
                              </>
                            ) : (
                              <>
                                <Icon path={mdiPlus} size={1} />
                                <span>Adicionar Cartão</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowCreditCardForm(false);
                              setCard({
                                number: "",
                                holder_name: "",
                                holder_document: "",
                                exp_month: "",
                                exp_year: "",
                                cvv: "",
                              });
                              setCardDue("");
                              setCardFormErrors({});
                            }}
                            className="px-6 py-3 bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
