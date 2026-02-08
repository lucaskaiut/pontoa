import { useState } from "react";
import toast from "react-hot-toast";
import type { PaymentData, CreditCardData } from "../../types";
import { PaymentsService } from "../../services/PaymentsService";

interface PagarmeCreditCardFormProps {
  onPaymentComplete: (paymentData: PaymentData) => void;
  loading: boolean;
}

export function PagarmeCreditCardForm({
  onPaymentComplete,
  loading,
}: PagarmeCreditCardFormProps) {
  const [cardData, setCardData] = useState<CreditCardData>({
    card_number: "",
    card_holder_name: "",
    card_expiration_date: "",
    card_cvv: "",
    card_holder_document: "",
  });
  const [errors, setErrors] = useState<Partial<CreditCardData>>({});
  const [processing, setProcessing] = useState(false);

  function formatCardNumber(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8, 12)} ${numbers.slice(12, 16)}`;
  }

  function formatExpirationDate(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
  }

  function formatCVV(value: string): string {
    return value.replace(/\D/g, "").slice(0, 3);
  }

  function formatDocument(value: string): string {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) return numbers;
    return `${numbers.slice(0, 11)}-${numbers.slice(11, 12)}`;
  }

  function handleCardChange(field: keyof CreditCardData, value: string) {
    let formattedValue = value;

    if (field === "card_number") {
      formattedValue = formatCardNumber(value);
    } else if (field === "card_expiration_date") {
      formattedValue = formatExpirationDate(value);
    } else if (field === "card_cvv") {
      formattedValue = formatCVV(value);
    } else if (field === "card_holder_document") {
      formattedValue = formatDocument(value);
    }

    setCardData((prev) => ({ ...prev, [field]: formattedValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateCard(): boolean {
    const newErrors: Partial<CreditCardData> = {};

    const cardNumber = cardData.card_number.replace(/\D/g, "");
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.card_number = "Número do cartão inválido";
    }

    if (!cardData.card_holder_name.trim()) {
      newErrors.card_holder_name = "Nome do portador é obrigatório";
    }

    const expiration = cardData.card_expiration_date.replace(/\D/g, "");
    if (expiration.length !== 4) {
      newErrors.card_expiration_date = "Data de validade inválida";
    } else {
      const month = parseInt(expiration.slice(0, 2));
      const year = parseInt("20" + expiration.slice(2, 4));
      const currentDate = new Date();
      const expirationDate = new Date(year, month - 1);
      if (month < 1 || month > 12 || expirationDate < currentDate) {
        newErrors.card_expiration_date = "Data de validade inválida";
      }
    }

    if (cardData.card_cvv.length < 3) {
      newErrors.card_cvv = "CVV inválido";
    }

    const document = cardData.card_holder_document.replace(/\D/g, "");
    if (document.length !== 11 && document.length !== 14) {
      newErrors.card_holder_document = "CPF/CNPJ inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function generateCardToken(): Promise<string> {
    const cardNumber = cardData.card_number.replace(/\D/g, "");
    const expiration = cardData.card_expiration_date.replace(/\D/g, "");
    const month = expiration.slice(0, 2).padStart(2, "0");
    const year = `20${expiration.slice(2, 4)}`;

    try {
      const token = await PaymentsService.generateCardToken({
        method: "pagarmeCreditCard",
        number: cardNumber,
        holder_name: cardData.card_holder_name,
        holder_document: cardData.card_holder_document.replace(/\D/g, ""),
        exp_month: month,
        exp_year: year,
        cvv: cardData.card_cvv,
      });

      return token;
    } catch (error) {
      console.error("Erro ao gerar card token:", error);
      throw error;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateCard()) {
      return;
    }

    setProcessing(true);
    try {
      const cardToken = await generateCardToken();

      const paymentData: PaymentData = {
        method: "pagarmeCreditCard",
        card_token: cardToken,
      };

      onPaymentComplete(paymentData);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar pagamento. Verifique os dados do cartão e tente novamente.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="card_number" className="block text-sm font-medium text-text-primary mb-1.5">
          Número do Cartão
        </label>
        <input
          type="text"
          id="card_number"
          value={cardData.card_number}
          onChange={(e) => handleCardChange("card_number", e.target.value)}
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          className={`
            w-full px-4 py-3 rounded-xl bg-surface border-2 text-text-primary placeholder-text-secondary
            focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300
            ${errors.card_number ? "border-danger" : "border-white/20 focus:border-primary"}
          `}
        />
        {errors.card_number && <p className="text-danger text-sm mt-1">{errors.card_number}</p>}
      </div>

      <div>
        <label htmlFor="card_holder_name" className="block text-sm font-medium text-text-primary mb-1.5">
          Nome no Cartão
        </label>
        <input
          type="text"
          id="card_holder_name"
          value={cardData.card_holder_name}
          onChange={(e) => handleCardChange("card_holder_name", e.target.value.toUpperCase())}
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          className={`
            w-full px-4 py-3 rounded-xl bg-surface border-2 text-text-primary placeholder-text-secondary
            focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300
            ${errors.card_holder_name ? "border-danger" : "border-white/20 focus:border-primary"}
          `}
        />
        {errors.card_holder_name && <p className="text-danger text-sm mt-1">{errors.card_holder_name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card_expiration_date" className="block text-sm font-medium text-text-primary mb-1.5">
            Validade
          </label>
          <input
            type="text"
            id="card_expiration_date"
            value={cardData.card_expiration_date}
            onChange={(e) => handleCardChange("card_expiration_date", e.target.value)}
            placeholder="MM/AA"
            maxLength={5}
            className={`
              w-full px-4 py-3 rounded-xl bg-surface border-2 text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300
              ${errors.card_expiration_date ? "border-danger" : "border-white/20 focus:border-primary"}
            `}
          />
          {errors.card_expiration_date && (
            <p className="text-danger text-sm mt-1">{errors.card_expiration_date}</p>
          )}
        </div>

        <div>
          <label htmlFor="card_cvv" className="block text-sm font-medium text-text-primary mb-1.5">
            CVV
          </label>
          <input
            type="text"
            id="card_cvv"
            value={cardData.card_cvv}
            onChange={(e) => handleCardChange("card_cvv", e.target.value)}
            placeholder="000"
            maxLength={3}
            className={`
              w-full px-4 py-3 rounded-xl bg-surface border-2 text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300
              ${errors.card_cvv ? "border-danger" : "border-white/20 focus:border-primary"}
            `}
          />
          {errors.card_cvv && <p className="text-danger text-sm mt-1">{errors.card_cvv}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="card_holder_document" className="block text-sm font-medium text-text-primary mb-1.5">
          CPF/CNPJ do Portador
        </label>
        <input
          type="text"
          id="card_holder_document"
          value={cardData.card_holder_document}
          onChange={(e) => handleCardChange("card_holder_document", e.target.value)}
          placeholder="000.000.000-00"
          className={`
            w-full px-4 py-3 rounded-xl bg-surface border-2 text-text-primary placeholder-text-secondary
            focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300
            ${errors.card_holder_document ? "border-danger" : "border-white/20 focus:border-primary"}
          `}
        />
        {errors.card_holder_document && (
          <p className="text-danger text-sm mt-1">{errors.card_holder_document}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={processing || loading}
        className="w-full px-5 py-3 bg-success hover:bg-success/80 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing || loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Finalizar Pagamento
          </>
        )}
      </button>
    </form>
  );
}

