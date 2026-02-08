import React from "react";
import classNames from "classnames";
import { UserServiceItem } from "./UserServiceItem";
import { UserServiceFormValue } from "../types";

interface UserServicesFieldProps {
  value: UserServiceFormValue[];
  onChange: (services: UserServiceFormValue[]) => void;
  className?: string;
  error?: string;
  setFieldValue: (field: "services", value: UserServiceFormValue[]) => void;
}

export function UserServicesField({
  value,
  onChange,
  className,
  error,
  setFieldValue,
}: UserServicesFieldProps) {
  const services = Array.isArray(value) ? value : [];

  const handleAddService = () => {
    const newServices = [
      ...services,
      {
        name: "",
        duration: 0,
        price: 0,
        cost: 0,
        commission: 0,
        description: "",
        status: true,
      }
    ];
    setFieldValue("services", newServices);
  };

  const handleServiceChange = (index: number, fieldName: keyof UserServiceFormValue, fieldValue: any) => {
    const newServices = [...services];
    if (!newServices[index]) return;
    newServices[index] = {
      ...newServices[index],
      [fieldName]: fieldValue
    };
    setFieldValue("services", newServices);
  };

  const handleServiceRemove = (index: number) => {
    const newServices = services.filter((_: any, i: number) => i !== index);
    setFieldValue("services", newServices);
  };

  const handleServiceMoveUp = (index: number) => {
    if (index === 0) return;
    const newServices = [...services];
    if (!newServices[index] || !newServices[index - 1]) return;
    [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
    setFieldValue("services", newServices);
  };

  const handleServiceMoveDown = (index: number) => {
    const newServices = [...services];
    if (index >= newServices.length - 1) return;
    if (!newServices[index] || !newServices[index + 1]) return;
    [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
    setFieldValue("services", newServices);
  };

  return (
    <div className={classNames("w-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
          Serviços do Usuário
        </label>
        <button
          type="button"
          onClick={handleAddService}
          className="bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 dark:hover:opacity-80 transition-colors"
        >
          + Adicionar Serviço
        </button>
      </div>
      {services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service: UserServiceFormValue, index: number) => (
            <UserServiceItem
              key={index}
              service={service}
              index={index}
              onChange={handleServiceChange}
              onRemove={handleServiceRemove}
              onMoveUp={handleServiceMoveUp}
              onMoveDown={handleServiceMoveDown}
              canMoveUp={index > 0}
              canMoveDown={index < services.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg text-gray-500 dark:text-dark-text-secondary">
          <p>Nenhum serviço cadastrado</p>
          <p className="text-sm mt-1">Clique em "Adicionar Serviço" para começar</p>
        </div>
      )}
      {error && <span className="text-danger text-sm mt-1">{error}</span>}
    </div>
  );
}


