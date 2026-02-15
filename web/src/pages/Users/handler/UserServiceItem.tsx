import React, { useState } from "react";
import { Icon } from "@mdi/react";
import { mdiDelete, mdiChevronDown, mdiChevronUp } from "@mdi/js";
import { UserServiceFormValue } from "../types";

interface UserServiceItemProps {
  service: UserServiceFormValue;
  index: number;
  onChange: (index: number, field: keyof UserServiceFormValue, value: any) => void;
  onRemove: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function UserServiceItem({
  service,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: UserServiceItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const reverseString = (str: string): string => {
    return str.split("").reverse().join("");
  };

  const maskCurrency = (value: string): { amount: number; maskedAmount: string } => {
    // Remove tudo que não for dígito e converte para string
    const digitsOnly = String(value).replace(/[^\d]+/gi, "");
    
    // Se estiver vazio ou for "0", retorna vazio
    if (!digitsOnly || digitsOnly === "0") {
      return { amount: 0, maskedAmount: "" };
    }

    // Remove zeros à esquerda desnecessários (exceto se for apenas "0")
    const cleanDigits = digitsOnly.replace(/^0+/, "") || "0";
    if (cleanDigits === "0") {
      return { amount: 0, maskedAmount: "" };
    }

    // Para formatação visual, se tiver apenas 1 dígito, adiciona zero à esquerda
    // Isso é apenas para exibição, o valor numérico usa os dígitos originais
    let digitsForMask = cleanDigits;
    if (digitsForMask.length === 1) {
      digitsForMask = "0" + digitsForMask; // Se digitar "5", mostra como "05" (cinco centavos)
    }

    // Reverte a string para aplicar a máscara da direita para esquerda
    let reversedDigits = reverseString(digitsForMask);
    const mask = reverseString("###.###.###.###.###,##");
    let result = "";

    // Aplica a máscara
    for (let x = 0, y = 0; x < mask.length && y < reversedDigits.length;) {
      if (mask.charAt(x) !== "#") {
        result += mask.charAt(x);
        x++;
      } else {
        result += reversedDigits.charAt(y);
        y++;
        x++;
      }
    }

    result = reverseString(result);
    
    // Converte os dígitos limpos (sem zeros à esquerda) para número
    // Trata como centavos: se digitou "1570", são 1570 centavos = 15,70 reais
    const amount = parseFloat(cleanDigits) / 100;

    return {
      amount,
      maskedAmount: result || ""
    };
  };

  const getCurrencyDisplay = (value: number | undefined): string => {
    if (value === undefined || value === null) return "";
    if (value === 0) return ""; // Retorna vazio quando o valor é 0 e não está sendo editado
    
    // Converte o número para centavos de forma precisa
    // Multiplica por 100 e arredonda para evitar problemas de precisão de ponto flutuante
    // Exemplo: 15.70 * 100 = 1570.0000000000002 -> Math.round() = 1570
    const cents = Math.round(value * 100);
    
    // Converte para string sem zeros à esquerda desnecessários
    const valueStr = cents.toString();
    
    if (!valueStr || valueStr === "0") return "";
    return maskCurrency(valueStr).maskedAmount;
  };

  // Estado local para controlar o valor digitado antes de formatar
  const [currencyInputs, setCurrencyInputs] = React.useState<{
    price?: string;
    cost?: string;
    commission?: string;
  }>({});

  const handleCurrencyChange = (field: 'price' | 'cost' | 'commission', value: string) => {
    // Salva o valor digitado (apenas dígitos) para manter o controle
    // IMPORTANTE: Extrai APENAS os dígitos, ignorando qualquer formatação existente
    const digitsOnly = value.replace(/[^\d]+/gi, "");
    
    // Se não há dígitos, limpa o estado local e o valor
    if (!digitsOnly) {
      setCurrencyInputs(prev => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
      });
      onChange(index, field, 0);
      return;
    }
    
    // Atualiza o estado local APENAS com os dígitos puros (não formata aqui)
    setCurrencyInputs(prev => ({
      ...prev,
      [field]: digitsOnly
    }));

    // Aplica a máscara e converte para número
    // Se tiver apenas zeros, mantém 0
    if (digitsOnly === "0") {
      onChange(index, field, 0);
      return;
    }
    
    // Converte os dígitos para valor numérico (trata como centavos)
    const amount = parseFloat(digitsOnly) / 100;
    onChange(index, field, amount);
  };

  // Função para obter o valor exibido (usa estado local se disponível, senão formata o valor numérico)
  const getCurrencyInputValue = (field: 'price' | 'cost' | 'commission', numericValue: number | undefined): string => {
    // Se há um valor no estado local (durante digitação), usa ele para formatar
    const localValue = currencyInputs[field];
    if (localValue !== undefined && localValue !== null && localValue !== "") {
      // Formata o valor digitado (mesmo que seja "0")
      const formatted = maskCurrency(localValue).maskedAmount;
      return formatted;
    }
    
    // Se o valor local está vazio string, retorna vazio
    if (localValue === "") {
      return "";
    }
    
    // Senão, formata o valor numérico
    return getCurrencyDisplay(numericValue);
  };

  return (
    <div className="border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-surface">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Icon 
            path={isExpanded ? mdiChevronUp : mdiChevronDown} 
            size={1.2} 
            className="text-gray-600 dark:text-dark-text-secondary"
          />
          <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text">
            Serviço {index + 1}
            {service.name && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-dark-text-secondary">- {service.name}</span>
            )}
          </h4>
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {onMoveUp && (
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={!canMoveUp}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mover para cima"
            >
              <Icon path={mdiChevronUp} size={1} className="text-gray-600 dark:text-dark-text-secondary" />
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={!canMoveDown}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mover para baixo"
            >
              <Icon path={mdiChevronDown} size={1} className="text-gray-600 dark:text-dark-text-secondary" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            title="Remover serviço"
          >
            <Icon path={mdiDelete} size={1} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Nome do Serviço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={service.name || ""}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                placeholder="Ex: Corte de Cabelo"
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Descrição
              </label>
              <textarea
                value={service.description || ""}
                onChange={(e) => onChange(index, 'description', e.target.value)}
                placeholder="Descrição do serviço"
                rows={2}
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Duração (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={service.duration || ""}
                onChange={(e) => onChange(index, 'duration', parseInt(e.target.value) || 0)}
                placeholder="30"
                min="1"
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Preço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={getCurrencyInputValue('price', service.price)}
                onChange={(e) => handleCurrencyChange('price', e.target.value)}
                onBlur={() => {
                  setCurrencyInputs(prev => {
                    const newState = { ...prev };
                    delete newState.price;
                    return newState;
                  });
                }}
                placeholder="0,00"
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Custo
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={getCurrencyInputValue('cost', service.cost)}
                onChange={(e) => handleCurrencyChange('cost', e.target.value)}
                onBlur={() => {
                  setCurrencyInputs(prev => {
                    const newState = { ...prev };
                    delete newState.cost;
                    return newState;
                  });
                }}
                placeholder="0,00"
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-dark-text">
                Comissão
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={getCurrencyInputValue('commission', service.commission)}
                onChange={(e) => handleCurrencyChange('commission', e.target.value)}
                onBlur={() => {
                  setCurrencyInputs(prev => {
                    const newState = { ...prev };
                    delete newState.commission;
                    return newState;
                  });
                }}
                placeholder="0,00"
                className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-hidden focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={service.status ?? true}
                  onChange={(e) => onChange(index, 'status', e.target.checked)}
                  className="w-5 h-5 accent-primary dark:accent-blue-400"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                  Serviço ativo
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

