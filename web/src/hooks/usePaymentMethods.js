import api from "../services/api";

export const usePaymentMethods = () => {
  const pagarMe = async (card) => {
    const expYear =
      card.exp_year.length === 2 ? `20${card.exp_year}` : card.exp_year;
    const { data } = await api.post("payments/token", {
      method: "pagarmeCreditCard",
      number: card.number,
      holder_name: card.holder_name,
      holder_document: card.holder_document,
      exp_month: card.exp_month,
      exp_year: expYear,
      cvv: card.cvv,
    });

    return {
      token: data.token,
    };
  };

  const buildPayload = async (card) => {
    const payload = await pagarMe(card);

    return payload;
  };

  return { buildPayload };
};
