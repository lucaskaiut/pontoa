import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import moment from "moment";
import { customerPackageService } from "../../../services/customerPackageService";

interface CustomerPackage {
  id: number;
  company_id: number;
  customer_id: number;
  package_id: number;
  order_id: number | null;
  total_sessions: number;
  remaining_sessions: number;
  expires_at: string | null;
  is_expired: boolean;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
  package?: {
    id: number;
    name: string;
    description: string | null;
    total_sessions: number;
    bonus_sessions: number;
    expires_in_days: number | null;
    price: number | null;
  };
  usages?: Array<{
    id: number;
    customer_package_id: number;
    appointment_id: number;
    used_at: string;
    scheduling?: {
      id: number;
      date: string;
      time: string;
      service?: {
        name: string;
      };
    };
  }>;
}

export function CustomerPackages() {
  const { id } = useParams<{ id: string }>();

  const { data: packagesResponse, isLoading } = useQuery({
    queryKey: ["customer-packages", id],
    queryFn: () => customerPackageService.getPackages(id!),
    enabled: !!id,
  });

  const packages = Array.isArray(packagesResponse?.data) 
    ? packagesResponse.data 
    : packagesResponse?.data?.data || [];

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "-";
    return moment(dateStr).format("DD/MM/YYYY");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text">Carregando pacotes...</p>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-dark-text mb-2">Nenhum pacote encontrado</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Este cliente ainda não possui pacotes ativos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map((pkg: CustomerPackage) => (
        <div
          key={pkg.id}
          className={`border rounded-xl p-4 transition-colors ${
            pkg.is_valid
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border opacity-60"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-navy-900 dark:text-dark-text font-medium mb-1">
                {pkg.package?.name || "Pacote"}
              </h3>
              {pkg.package?.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{pkg.package.description}</p>
              )}
            </div>
            {pkg.is_valid ? (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Ativo
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                {pkg.is_expired ? "Expirado" : "Esgotado"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sessões totais</p>
              <p className="text-navy-900 dark:text-dark-text font-medium">{pkg.total_sessions}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sessões disponíveis</p>
              <p className={`font-bold text-lg ${pkg.remaining_sessions > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {pkg.remaining_sessions}
              </p>
            </div>
            {pkg.expires_at && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Validade</p>
                <p className={`text-navy-900 dark:text-dark-text font-medium ${pkg.is_expired ? "text-red-600 dark:text-red-400" : ""}`}>
                  {formatDate(pkg.expires_at)}
                </p>
              </div>
            )}
            {!pkg.expires_at && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Validade</p>
                <p className="text-navy-900 dark:text-dark-text font-medium">Ilimitado</p>
              </div>
            )}
            {pkg.usages && pkg.usages.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sessões utilizadas</p>
                <p className="text-navy-900 dark:text-dark-text font-medium">
                  {pkg.total_sessions - pkg.remaining_sessions}
                </p>
              </div>
            )}
          </div>

          {pkg.usages && pkg.usages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Histórico de uso</p>
              <div className="space-y-2">
                {pkg.usages.slice(0, 5).map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {usage.scheduling?.service?.name || "Serviço"}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(usage.used_at)}
                    </span>
                  </div>
                ))}
                {pkg.usages.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +{pkg.usages.length - 5} {pkg.usages.length - 5 === 1 ? "uso" : "usos"} adicionais
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

