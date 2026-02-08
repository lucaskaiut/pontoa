import { useState, useEffect, useCallback } from "react";
import { CustomersService } from "../services/CustomersService";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  document: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerData) => void;
  initialData: CustomerData;
  requireCheckout?: boolean;
}

export function CustomerForm({ onSubmit, initialData, requireCheckout = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerData>(initialData);
  const [errors, setErrors] = useState<Partial<CustomerData>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const loadUserData = useCallback(async () => {
    setIsLoadingUser(true);
    try {
      const userData = await CustomersService.getMe();
      setFormData((prev) => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
        document: userData.document || prev.document,
      }));
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
      loadUserData();
    }
  }, [loadUserData]);

  function formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  function formatDocument(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    } else {
      if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  }

  function handleChange(field: keyof CustomerData, value: string) {
    if (field === "phone") {
      value = formatPhone(value);
    } else if (field === "document") {
      value = formatDocument(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const newErrors: Partial<CustomerData> = {};

    if (!isAuthenticated) {
      if (!formData.name.trim()) {
        newErrors.name = "Nome é obrigatório";
      }

      if (!formData.email.trim()) {
        newErrors.email = "E-mail é obrigatório";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "E-mail inválido";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Telefone é obrigatório";
      } else if (formData.phone.replace(/\D/g, "").length < 10) {
        newErrors.phone = "Telefone inválido";
      }
    }

    if (requireCheckout) {
      if (!formData.document.trim()) {
        newErrors.document = "CPF/CNPJ é obrigatório";
      } else {
        const documentNumbers = formData.document.replace(/\D/g, "");
        if (documentNumbers.length !== 11 && documentNumbers.length !== 14) {
          newErrors.document = "CPF/CNPJ inválido";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-text-secondary">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-5">Seus Dados</h2>

      {isAuthenticated && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="text-xs text-text-secondary space-y-1">
            <p><strong>Nome:</strong> {formData.name}</p>
            <p><strong>E-mail:</strong> {formData.email}</p>
            <p><strong>Telefone:</strong> {formData.phone}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isAuthenticated && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Digite seu nome"
                className={`
                  w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200
                  ${errors.name ? "border-danger focus:ring-danger/40" : ""}
                `}
              />
              {errors.name && <p className="text-danger text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                className={`
                  w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200
                  ${errors.email ? "border-danger focus:ring-danger/40" : ""}
                `}
              />
              {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(00) 00000-0000"
                className={`
                  w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200
                  ${errors.phone ? "border-danger focus:ring-danger/40" : ""}
                `}
              />
              {errors.phone && <p className="text-danger text-sm mt-1">{errors.phone}</p>}
            </div>
          </>
        )}

        {requireCheckout && (
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-text-primary mb-1.5">
              CPF/CNPJ
            </label>
            <input
              type="text"
              id="document"
              value={formData.document}
              onChange={(e) => handleChange("document", e.target.value)}
              placeholder="000.000.000-00"
              className={`
                w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200
                ${errors.document ? "border-danger focus:ring-danger/40" : ""}
              `}
            />
            {errors.document && <p className="text-danger text-sm mt-1">{errors.document}</p>}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}

