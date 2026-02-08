import { useState, useMemo } from "react";
import InputMask from "react-input-mask";
import { validateData } from "../../services/formValidation";
import classNames from "class-names";
import { TermsModal } from "../../components/TermsModal";
import { usePlans } from "../../hooks/usePlans";

export const Checkout = ({ submit, previousStep, data }) => {
  const { data: plans = [] } = usePlans();
  const [formErrors, setFormErrors] = useState([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Get selected plan from plans array
  const selectedPlan = useMemo(() => {
    const planType = data?.company?.plan_type || "basic";
    const recurrence = data?.company?.plan_recurrence || data?.company?.plan || "monthly";
    
    return plans.find(
      (plan) => plan.type === planType && plan.recurrence === recurrence
    ) || null;
  }, [plans, data?.company?.plan_type, data?.company?.plan_recurrence, data?.company?.plan]);
  
  // Fallback values
  const currentPlanPrice = selectedPlan?.price || (data?.company?.plan_recurrence === "yearly" ? 499.00 : 49.90);
  const currentPlanLabel = selectedPlan?.type_label || (data?.company?.plan_type === "pro" ? "PRO (com IA)" : "Básico");
  const currentPlanRecurrenceLabel = selectedPlan?.recurrence_label || (data?.company?.plan_recurrence === "yearly" ? "Anual" : "Mensal");
  const currentPlanPeriod = data?.company?.plan_recurrence === "yearly" || data?.company?.plan === "yearly" ? "ano" : "mês";
  const currentPlanTestDays = selectedPlan?.trial_days || (data?.company?.plan_recurrence === "yearly" || data?.company?.plan === "yearly" ? 30 : 7);
  const defaultCard = {
    number: "",
    holder_name: "",
    holder_document: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  };

  const [card, setCard] = useState(defaultCard);
  const [cardDue, setCardDue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  
  const defaultAddress = {
    postcode: "",
    address: "",
    number: "",
    complement: "",
    district: "",
    region: "",
    city: "",
  };

  const [address, setAddress] = useState(defaultAddress);

  const rules = {
    number: ["required", "length:16"],
    holder_name: ["required"],
    holder_document: ["required", "length:11"],
    exp_month: ["required", "length:2"],
    exp_year: ["required", "length:4"],
    cvv: ["required", "length:3"],
  };

  const addressRules = {
    postcode: ["required", "length:8"],
    address: ["required"],
    number: ["required"],
    district: ["required"],
    region: ["required", "length:2"],
    city: ["required"],
  };

  const setFieldValue = (field, value) => {
    setCard({ ...card, [field]: value });
  };

  const handleMaskedInput = (field, value) => {
    setFieldValue(field, value.replace(/\D/g, ""));
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

  const setAddressFieldValue = (field, value) => {
    setAddress({ ...address, [field]: value });
  };

  const fetchAddressByCep = async (cep) => {
    const cleanCep = cep.replace(/\D/g, "");
    
    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setIsLoadingCep(false);
        return;
      }

      setAddress({
        ...address,
        postcode: cleanCep,
        address: data.logradouro || "",
        district: data.bairro || "",
        city: data.localidade || "",
        region: data.uf || "",
      });
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (value) => {
    const cleanCep = value.replace(/\D/g, "");
    
    setAddress({
      ...address,
      postcode: cleanCep,
    });
    
    if (cleanCep.length === 8) {
      fetchAddressByCep(cleanCep);
    }
  };

  const handleSubmit = async () => {
    const cardErrors = validateData(card, rules);
    const addressErrors = validateData(address, addressRules);
    
    const allErrors = {
      ...Object.fromEntries(Object.entries(cardErrors.errors).map(([key, value]) => [`card_${key}`, value])),
      ...addressErrors.errors
    };
    const hasError = cardErrors.hasError || addressErrors.hasError;

    setFormErrors(allErrors);

    if (hasError) {
      return;
    }

    setIsLoading(true);
    try {
      await submit({ card, address });
    } finally {
      setIsLoading(false);
    }
  };

  const responsibleName = data?.name || "";
  const responsibleEmail = data?.email || "";
  const companyName = data?.company?.name || "";
  const companyEmail = data?.company?.email || "";
  const companyDocument = data?.company?.document || "";
  const companyPhone = data?.company?.phone || "";

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-purple-400 to-blue-500 text-3xl mb-4 shadow-lg">
          💳
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Finalize seu Cadastro
        </h2>
        <p className="text-gray-600">
          Última etapa! Confirme seus dados
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-4/12">
          <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-linear-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                  Resumo
                </p>
                <h3 className="text-base font-semibold text-gray-900">
                  Antes de confirmar
                </h3>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Confira se os dados estão corretos antes de finalizar.
            </p>

            <div className="space-y-3 text-sm">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👤</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Responsável
                  </p>
                </div>
                <p className="text-gray-900 font-semibold mb-1">
                  {responsibleName || "Nome não informado"}
                </p>
                <p className="text-xs text-gray-600">
                  {responsibleEmail || "E-mail não informado"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏢</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Empresa
                  </p>
                </div>
                <p className="text-gray-900 font-semibold mb-1">
                  {companyName || "Nome fantasia não informado"}
                </p>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>{companyEmail || "E-mail não informado"}</p>
                  <p>{companyPhone || "Telefone não informado"}</p>
                  <p>{companyDocument || "Documento não informado"}</p>
                </div>
              </div>

              <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⭐</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Plano escolhido
                  </p>
                </div>
                <p className="text-gray-900 font-semibold mb-1">
                  PontoA • {currentPlanLabel} • {currentPlanRecurrenceLabel}
                </p>
                <p className="text-sm text-gray-700 font-bold mb-1">
                  R${" "}
                  {currentPlanPrice.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /{currentPlanPeriod}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-emerald-600 text-sm">🎁</span>
                  <p className="text-xs font-semibold text-emerald-700">
                    {currentPlanTestDays} dias grátis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-8/12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📍</span>
                <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                  Endereço de Cobrança
                </p>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Informe o endereço de cobrança
              </h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">🔒 Seus dados estão seguros.</span> Este endereço será usado apenas para validação do cartão de crédito.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CEP
                  </label>
                  <div className="relative">
                    <InputMask
                      type="text"
                      placeholder="00000-000"
                      value={address.postcode || ""}
                      mask="99999-999"
                      onChange={(event) => handleCepChange(event.target.value)}
                    >
                      {(props) => (
                        <input
                          className={classNames(
                            "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white pr-12",
                            "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                            {
                              "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.postcode,
                              "border-gray-200 hover:border-gray-300": !formErrors.postcode
                            }
                          )}
                          {...props}
                        />
                      )}
                    </InputMask>
                    {isLoadingCep && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {formErrors.postcode && (
                    <p className="mt-1 text-sm text-red-600">⚠️ CEP inválido</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.address,
                        "border-gray-200 hover:border-gray-300": !formErrors.address
                      }
                    )}
                    type="text"
                    placeholder="Rua, Avenida, etc."
                    value={address.address}
                    onChange={(event) =>
                      setAddressFieldValue("address", event.target.value)
                    }
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha o endereço</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número
                  </label>
                  <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.number,
                        "border-gray-200 hover:border-gray-300": !formErrors.number
                      }
                    )}
                    type="text"
                    placeholder="123"
                    value={address.number}
                    onChange={(event) =>
                      setAddressFieldValue("number", event.target.value)
                    }
                  />
                  {formErrors.number && (
                    <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha o número</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complemento <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-gray-900 bg-white focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400"
                    type="text"
                    placeholder="Apartamento, Bloco, etc."
                    value={address.complement}
                    onChange={(event) =>
                      setAddressFieldValue("complement", event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bairro
                  </label>
                  <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.district,
                        "border-gray-200 hover:border-gray-300": !formErrors.district
                      }
                    )}
                    type="text"
                    placeholder="Bairro"
                    value={address.district}
                    onChange={(event) =>
                      setAddressFieldValue("district", event.target.value)
                    }
                  />
                  {formErrors.district && (
                    <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha o bairro</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado (UF)
                  </label>
                  <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white uppercase",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.region,
                        "border-gray-200 hover:border-gray-300": !formErrors.region
                      }
                    )}
                    type="text"
                    placeholder="SP"
                    maxLength="2"
                    value={address.region}
                    onChange={(event) =>
                      setAddressFieldValue("region", event.target.value.toUpperCase())
                    }
                  />
                  {formErrors.region && (
                    <p className="mt-1 text-sm text-red-600">⚠️ Estado inválido</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.city,
                        "border-gray-200 hover:border-gray-300": !formErrors.city
                      }
                    )}
                    type="text"
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(event) =>
                      setAddressFieldValue("city", event.target.value)
                    }
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha a cidade</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💳</span>
                <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                  Pagamento Seguro
                </p>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Dados do cartão de crédito
              </h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">🔒 Pagamento 100% seguro.</span> O primeiro pagamento só será cobrado
                  após o término do período de teste grátis de {currentPlanTestDays} dias.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Titular
                </label>
                <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.card_holder_name,
                        "border-gray-200 hover:border-gray-300": !formErrors.card_holder_name
                      }
                    )}
                  type="text"
                  placeholder="Nome como está no cartão"
                  value={card.holder_name}
                  onChange={(event) =>
                    setFieldValue("holder_name", event.target.value)
                  }
                />
                {formErrors.card_holder_name && (
                  <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha o nome do titular</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CPF do Titular
                </label>
                <InputMask
                  type="text"
                  placeholder="000.000.000-00"
                  value={card.holder_document}
                  mask="999.999.999-99"
                  onChange={(event) =>
                    handleMaskedInput("holder_document", event.target.value)
                  }
                >
                  {(props) => (
                    <input
                      className={classNames(
                        "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                        "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                        {
                          "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.card_holder_document,
                          "border-gray-200 hover:border-gray-300": !formErrors.card_holder_document
                        }
                      )}
                      {...props}
                    />
                  )}
                </InputMask>
                {formErrors.card_holder_document && (
                  <p className="mt-1 text-sm text-red-600">⚠️ CPF inválido</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número do Cartão
              </label>
              <InputMask
                type="text"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(event) =>
                  handleMaskedInput("number", event.target.value)
                }
                mask="9999 9999 9999 9999"
              >
                {(props) => (
                  <input
                    className={classNames(
                      "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white font-mono text-lg",
                      "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                      {
                        "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.card_number,
                        "border-gray-200 hover:border-gray-300": !formErrors.card_number
                      }
                    )}
                    {...props}
                  />
                )}
              </InputMask>
              {formErrors.card_number && (
                <p className="mt-1 text-sm text-red-600">⚠️ Número do cartão inválido</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Validade
                </label>
                <InputMask
                  type="text"
                  placeholder="MM/AA"
                  value={cardDue}
                  onChange={(event) => handleDueInput(event.target.value)}
                  mask="99/99"
                >
                  {(props) => (
                    <input
                      className={classNames(
                        "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white font-mono",
                        "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                        {
                          "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": 
                            formErrors.card_exp_month || formErrors.card_exp_year,
                          "border-gray-200 hover:border-gray-300": !formErrors.card_exp_month && !formErrors.card_exp_year
                        }
                      )}
                      {...props}
                    />
                  )}
                </InputMask>
                {(formErrors.card_exp_month || formErrors.card_exp_year) && (
                  <p className="mt-1 text-sm text-red-600">⚠️ Data inválida</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CVV
                </label>
                <InputMask
                  type="text"
                  placeholder="123"
                  value={card.cvv}
                  onChange={(event) => setFieldValue("cvv", event.target.value)}
                  mask="999"
                >
                  {(props) => (
                    <input
                      className={classNames(
                        "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white font-mono",
                        "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                        {
                          "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.card_cvv,
                          "border-gray-200 hover:border-gray-300": !formErrors.card_cvv
                        }
                      )}
                      {...props}
                    />
                  )}
                </InputMask>
                {formErrors.card_cvv && (
                  <p className="mt-1 text-sm text-red-600">⚠️ CVV inválido</p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Ao se cadastrar, você concorda com os{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-semibold underline transition-colors"
                  >
                    termos e condições
                  </button>
                </p>
              </div>
              <button
                className="w-full bg-linear-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando sua conta...
                  </span>
                ) : (
                  "🎉 Confirmar e Criar Conta"
                )}
              </button>
              <button
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                type="button"
                onClick={previousStep}
              >
                ← Voltar para escolha do plano
              </button>
            </div>
          </div>
        </div>
      </div>
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}