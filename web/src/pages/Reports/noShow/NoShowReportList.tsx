import React from "react";
import moment from "moment";
import { Oval } from 'react-loader-spinner';
import { useNoShowReportList } from "./noShowReportModel";
import { NoShowReportItem, NoShowReportGroupedItem, NoShowReportGroupedByCustomerItem } from "../types";

export function NoShowReportList() {
  const {
    reportData,
    isLoading,
    filters,
    appliedFilters,
    setFilter,
    applyFilters,
    totals,
    users,
    services,
    customers,
    isLoadingUsers,
    isLoadingServices,
    isLoadingCustomers,
  } = useNoShowReportList();

  const isGrouped = !!appliedFilters?.group_by;
  const isGroupedByCustomer = appliedFilters?.group_by === 'customer';
  const hasData = reportData && reportData.length > 0;

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = moment(dateString);
    if (appliedFilters?.group_by === 'day') {
      return date.format('DD/MM/YYYY');
    } else if (appliedFilters?.group_by === 'month') {
      return date.format('MM/YYYY');
    } else if (appliedFilters?.group_by === 'year') {
      return date.format('YYYY');
    }
    return date.format('DD/MM/YYYY HH:mm');
  };

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue || 0);
  };

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
        Relatório de Não Comparecimento
      </h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 mb-6">
          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text">
              Agrupar por
            </label>
            <select
              value={filters.group_by || ''}
              onChange={(e) => setFilter('group_by', e.target.value)}
              className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm"
              style={{ height: '38px', boxSizing: 'border-box' }}
            >
              <option value="">Não agrupar</option>
              <option value="day">Dia</option>
              <option value="month">Mês</option>
              <option value="year">Ano</option>
              <option value="customer">Cliente</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.date_start_at || ''}
              onChange={(e) => setFilter('date_start_at', e.target.value)}
              className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm"
              style={{ height: '38px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text">
              Data Final
            </label>
            <input
              type="date"
              value={filters.date_end_at || ''}
              onChange={(e) => setFilter('date_end_at', e.target.value)}
              className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm"
              style={{ height: '38px', boxSizing: 'border-box' }}
            />
          </div>

          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text">
              Cliente
            </label>
            <select
              value={filters.customer_id || ''}
              onChange={(e) => setFilter('customer_id', e.target.value)}
              disabled={isLoadingCustomers}
              className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm disabled:opacity-50"
              style={{ height: '38px', boxSizing: 'border-box' }}
            >
              <option value="">Todos</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text">
              Profissional
            </label>
            <select
              value={filters.user_id || ''}
              onChange={(e) => setFilter('user_id', e.target.value)}
              disabled={isLoadingUsers}
              className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm disabled:opacity-50"
              style={{ height: '38px', boxSizing: 'border-box' }}
            >
              <option value="">Todos</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text">
              Serviço
            </label>
            <select
              value={filters.service_id || ''}
              onChange={(e) => setFilter('service_id', e.target.value)}
              disabled={isLoadingServices}
              className="bg-white dark:bg-dark-surface rounded-md py-2 px-3 w-full border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text text-sm disabled:opacity-50"
              style={{ height: '38px', boxSizing: 'border-box' }}
            >
              <option value="">Todos</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-dark-text opacity-0 pointer-events-none">
              Botão
            </label>
            <button
              onClick={applyFilters}
              className="bg-primary dark:bg-blue-600 px-4 py-2 rounded-lg text-white hover:opacity-90 dark:hover:opacity-80 transition-all w-full text-sm whitespace-nowrap"
              style={{ height: '38px', boxSizing: 'border-box' }}
            >
              Filtrar
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <Oval
            height={40}
            width={40}
            color="#7b2cbf"
            wrapperStyle={{}}
            wrapperClass=""
            visible={isLoading}
            ariaLabel="oval-loading"
            secondaryColor="#7b2cbf"
            strokeWidth={4}
            strokeWidthSecondary={4}
          />
        </div>

        {!isLoading && hasData && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border pb-5">
                    {isGroupedByCustomer ? (
                      <>
                        <th className="text-left py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Cliente</th>
                        <th className="text-right py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Quantidade</th>
                        <th className="text-right py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Valor Perdido</th>
                      </>
                    ) : isGrouped ? (
                      <>
                        <th className="text-left py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Data</th>
                        <th className="text-right py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Quantidade</th>
                        <th className="text-right py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Valor Perdido</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Cliente</th>
                        <th className="text-left py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Serviço</th>
                        <th className="text-left py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Profissional</th>
                        <th className="text-left py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Data</th>
                        <th className="text-right py-4 px-4 text-gray-400 dark:text-gray-500 font-bold">Valor Perdido</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isGroupedByCustomer ? (
                    (reportData as NoShowReportGroupedByCustomerItem[]).map((item, index) => {
                      const totalPrice = typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price)) || 0;
                      return (
                        <tr key={index} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-hover">
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary">
                            {item.customer?.name || '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary text-right">{item.count || 0}</td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary text-right">{formatCurrency(totalPrice)}</td>
                        </tr>
                      );
                    })
                  ) : isGrouped ? (
                    (reportData as NoShowReportGroupedItem[]).map((item, index) => {
                      const totalPrice = typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price)) || 0;
                      return (
                        <tr key={index} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-hover">
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary">{formatDate(item.date)}</td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary text-right">{item.count || 0}</td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary text-right">{formatCurrency(totalPrice)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    (reportData as NoShowReportItem[]).map((item, index) => {
                      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
                      return (
                        <tr key={item.id || index} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface-hover">
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary">
                            {item.customer?.name || '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary">
                            {item.service?.name || '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary">
                            {item.user?.name || '-'}
                          </td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary">
                            {formatDate(item.date || '')}
                          </td>
                          <td className="py-4 px-4 text-gray-500 dark:text-dark-text-secondary text-right">
                            {formatCurrency(price)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 dark:bg-dark-surface-hover font-bold">
                    {isGroupedByCustomer ? (
                      <>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text">Total</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text text-right">{totals.totalCount}</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text text-right">{formatCurrency(totals.totalPrice)}</td>
                      </>
                    ) : isGrouped ? (
                      <>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text">Total</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text text-right">{totals.totalCount}</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text text-right">{formatCurrency(totals.totalPrice)}</td>
                      </>
                    ) : (
                      <>
                        <td colSpan={4} className="py-4 px-4 text-gray-900 dark:text-dark-text">Total</td>
                        <td className="py-4 px-4 text-gray-900 dark:text-dark-text text-right">{formatCurrency(totals.totalPrice)}</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {isGroupedByCustomer ? (
                (reportData as NoShowReportGroupedByCustomerItem[]).map((item, index) => {
                  const totalPrice = typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price)) || 0;
                  return (
                    <div key={index} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Cliente:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary text-right wrap-break-word">{item.customer?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Quantidade:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary">{item.count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center border-t dark:border-dark-border pt-2 mt-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Valor Perdido:</span>
                        <span className="text-primary dark:text-blue-400 font-bold">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  );
                })
              ) : isGrouped ? (
                (reportData as NoShowReportGroupedItem[]).map((item, index) => {
                  const totalPrice = typeof item.total_price === 'number' ? item.total_price : parseFloat(String(item.total_price)) || 0;
                  return (
                    <div key={index} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Data:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary">{formatDate(item.date)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Quantidade:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary">{item.count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center border-t dark:border-dark-border pt-2 mt-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Valor Perdido:</span>
                        <span className="text-primary dark:text-blue-400 font-bold">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                (reportData as NoShowReportItem[]).map((item, index) => {
                  const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
                  return (
                    <div key={item.id || index} className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Cliente:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary text-right wrap-break-word">{item.customer?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Serviço:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary text-right wrap-break-word">{item.service?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Profissional:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary text-right wrap-break-word">{item.user?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Data:</span>
                        <span className="text-gray-500 dark:text-dark-text-secondary">{formatDate(item.date || '')}</span>
                      </div>
                      <div className="flex justify-between items-center border-t dark:border-dark-border pt-2 mt-2">
                        <span className="font-bold text-gray-900 dark:text-dark-text">Valor Perdido:</span>
                        <span className="text-primary dark:text-blue-400 font-bold">{formatCurrency(price)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="bg-gray-100 dark:bg-dark-surface-hover border border-gray-200 dark:border-dark-border rounded-lg p-4 font-bold">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 dark:text-dark-text">Total Quantidade:</span>
                  <span className="text-gray-900 dark:text-dark-text">{totals.totalCount}</span>
                </div>
                <div className="flex justify-between items-center border-t dark:border-dark-border pt-2 mt-2">
                  <span className="text-gray-900 dark:text-dark-text">Total Valor Perdido:</span>
                  <span className="text-primary dark:text-blue-400">{formatCurrency(totals.totalPrice)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {!isLoading && !hasData && (
          <div className="text-center py-8 text-gray-500 dark:text-dark-text-secondary">
            Nenhum dado encontrado. Aplique os filtros para visualizar o relatório.
          </div>
        )}
      </div>
    </div>
  );
}

