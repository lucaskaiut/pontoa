import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customerService";
import { schedulingService } from "../services/schedulingService";
import { useACL } from "../hooks/useACL";
import { useAuth } from "../hooks/useAuth";
import { Onboarding } from "../components/Onboarding";
import moment from "moment";
import "moment/locale/pt-br";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, LoadingSpinner, EmptyState, Avatar } from "../components/ui";
import toast from "react-hot-toast";
import {
  parseUTCDate,
  formatSchedulingDate,
  sortDates,
  now,
  isSameOrAfter,
  formatTime,
  formatDuration,
  toUTCDateTime,
  toUTCEndOfDay,
} from "../utils/dateUtils";

moment.locale("pt-br");

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && user.company && !user.company.onboarding_completed && !showOnboarding) {
      setShowOnboarding(true);
    } else if (user && user.company && user.company.onboarding_completed && showOnboarding) {
      setShowOnboarding(false);
    }
  }, [user, showOnboarding]);
  const nowMoment = now();
  const nowStringUTC = toUTCDateTime(nowMoment.format("YYYY-MM-DD HH:mm:ss"));
  const next7DaysLocal = nowMoment.clone().add(7, "days").format("YYYY-MM-DD");
  const next7DaysUTC = toUTCEndOfDay(next7DaysLocal);

  const { hasPermission } = useACL();
  const canViewCustomers = hasPermission("manage_customers");
  const canViewSchedulings = hasPermission("manage_schedulings");
  const canManageExecutions = hasPermission("manage_appointment_executions");

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers-recent"],
    queryFn: async () => {
      const result = await customerService.list({ perPage: 3, orderBy: "created_at", order: "desc" });
      return result;
    },
    enabled: canViewCustomers,
  });

  const { data: schedulingsData, isLoading: isLoadingSchedulings } = useQuery({
    queryKey: ["schedulings-next-7-days", { nowStringUTC, next7DaysUTC }],
    queryFn: async () => {
      const result = await schedulingService.list({
        dateFrom: nowStringUTC,
        dateTo: next7DaysUTC,
        status: "pending,confirmed",
      });
      return result;
    },
    enabled: canViewSchedulings,
  });

  const customers = Array.isArray(customersData) 
    ? customersData 
    : (customersData && typeof customersData === 'object' && 'data' in customersData && Array.isArray(customersData.data))
      ? customersData.data
      : [];

  const schedulings = Array.isArray(schedulingsData) 
    ? schedulingsData 
    : (schedulingsData && typeof schedulingsData === 'object' && 'data' in schedulingsData && Array.isArray(schedulingsData.data))
      ? schedulingsData.data
      : [];

  console.log('[Apontamento] Total de agendamentos buscados:', schedulings.length);
  console.log('[Apontamento] Agendamentos encontrados:', schedulings.map(s => ({
    id: s.id,
    status: s.status,
    date: s.date,
    customer: s.customer?.name,
    service: s.service?.name
  })));

  const nextSchedulings = sortDates(schedulings, 'asc');

  const currentTime = now();
  const cutoffTime = currentTime.clone().subtract(30, "minutes");

  const nextConfirmedScheduling = nextSchedulings.find((s) => {
    const schedulingDate = parseUTCDate(s.date);
    if (!schedulingDate || !schedulingDate.isValid()) return false;

    const isConfirmed = s.status === "confirmed";
    const isAfterCutoff = isSameOrAfter(s.date, cutoffTime.toISOString());
    const isSameUser = s.user_id === user?.id;
    const result = isConfirmed && isAfterCutoff && isSameUser;

    return result;
  });

  console.log('[Apontamento] Próximo agendamento confirmado encontrado:', nextConfirmedScheduling ? {
    id: nextConfirmedScheduling.id,
    status: nextConfirmedScheduling.status,
    date: nextConfirmedScheduling.date,
    customer: nextConfirmedScheduling.customer?.name
  } : null);

  const { data: executionsData } = useQuery({
    queryKey: ["executions", nextConfirmedScheduling?.id],
    queryFn: async () => {
      if (!nextConfirmedScheduling?.id) return null;
      try {
        const result = await schedulingService.getExecutions(nextConfirmedScheduling.id);
        return Array.isArray(result) ? result : [result].filter(Boolean);
      } catch (error) {
        return [];
      }
    },
    enabled: !!nextConfirmedScheduling?.id && canManageExecutions,
    refetchInterval: 5000,
  });

  const executions = executionsData || [];
  const currentExecutionInProgress = executions.find(
    (exec) => exec.status === "in_progress" && !exec.checked_out_at
  );
  const lastExecution = executions[0] || null;

  const checkInMutation = useMutation({
    mutationFn: async (schedulingId) => {
      return await schedulingService.checkIn(schedulingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executions", nextConfirmedScheduling?.id] });
      queryClient.invalidateQueries({ queryKey: ["schedulings-next-7-days"] });
      toast.success("Check-in realizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Erro ao realizar check-in");
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (schedulingId) => {
      return await schedulingService.checkOut(schedulingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executions", nextConfirmedScheduling?.id] });
      queryClient.invalidateQueries({ queryKey: ["schedulings-next-7-days"] });
      toast.success("Check-out realizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Erro ao realizar check-out");
    },
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "warning" },
      confirmed: { label: "Confirmado", variant: "success" },
      cancelled: { label: "Cancelado", variant: "default" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} size="sm">
        {config.label}
      </Badge>
    );
  };


  const recentCustomers = customers.slice(0, 3);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    if (user && user.company) {
      user.company.onboarding_completed = true;
    }
  };

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
        Dashboard
      </h1>

      {canManageExecutions && nextConfirmedScheduling && (
        <div className="m-4 md:m-10">
          <Card padding="md" hover={false} className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 border-2 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Próximo Atendimento
                </CardTitle>
                {currentExecutionInProgress && (
                  <Badge variant="warning" size="sm">
                    Em Andamento
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-900 dark:text-dark-text mb-1">
                    {nextConfirmedScheduling.customer?.name || "Cliente não informado"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2">
                    {nextConfirmedScheduling.service?.name || "Serviço"} • {nextConfirmedScheduling.user?.name || "Profissional"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatSchedulingDate(nextConfirmedScheduling.date)}</span>
                  </div>
                  {currentExecutionInProgress?.checked_in_at && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
                      <span>Iniciado às {formatTime(currentExecutionInProgress.checked_in_at)}</span>
                      {currentExecutionInProgress?.status === "in_progress" && (
                        <span className="ml-2">
                          • Tempo decorrido: {formatDuration(currentExecutionInProgress.checked_in_at, now().toISOString())}
                        </span>
                      )}
                    </div>
                  )}
                  {executions.length > 0 && !currentExecutionInProgress && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
                      <span>{executions.length} apontamento(s) realizado(s)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {currentExecutionInProgress ? (
                    <Button
                      onClick={() => checkOutMutation.mutate(nextConfirmedScheduling.id)}
                      disabled={checkOutMutation.isPending}
                      variant="warning"
                      size="lg"
                      className="flex items-center gap-2 px-6"
                    >
                      {checkOutMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Finalizando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>Finalizar</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => checkInMutation.mutate(nextConfirmedScheduling.id)}
                      disabled={checkInMutation.isPending}
                      variant="primary"
                      size="lg"
                      className="flex items-center gap-2 px-6"
                    >
                      {checkInMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Iniciando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          <span>Iniciar</span>
                        </>
                      )}
                    </Button>
                  )}
                  {lastExecution?.status === "completed" && !currentExecutionInProgress && (
                    <Badge variant="success" size="md" className="px-4 py-2">
                      Último: {lastExecution.actual_duration_minutes} min
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 m-4 md:m-10">
        {canViewCustomers && (
          <Card padding="md" hover={false}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Últimos Clientes
                </CardTitle>
                <span className="text-sm text-gray-500 dark:text-dark-text-secondary">{recentCustomers.length} cliente(s)</span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCustomers ? (
                <LoadingSpinner />
              ) : recentCustomers.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  title="Nenhum cliente cadastrado"
                  description="Comece adicionando seu primeiro cliente ao sistema"
                  action={
                    <Button onClick={() => navigate("/clientes/criar")} variant="primary" size="sm">
                      Adicionar Cliente
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {recentCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => navigate(`/clientes/${customer.id}/editar`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all border border-gray-100 dark:border-dark-border cursor-pointer"
                    >
                      <Avatar name={customer.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-dark-text truncate">{customer.name}</p>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">{customer.email || customer.phone}</p>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 hidden md:block">
                        {moment(customer.created_at).locale("pt-br").fromNow()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {canViewSchedulings && (
          <Card padding="md" hover={false}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Próximos Agendamentos
                </CardTitle>
                <span className="text-sm text-gray-500 dark:text-dark-text-secondary">{nextSchedulings.length} agendamento(s)</span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSchedulings ? (
                <LoadingSpinner />
              ) : nextSchedulings.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  title="Nenhum agendamento"
                  description="Não há agendamentos nos próximos 7 dias"
                  action={
                    <Button onClick={() => navigate("/agendamentos")} variant="primary" size="sm">
                      Ver Agendamentos
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto">
                  {nextSchedulings.map((scheduling) => (
                    <div
                      key={scheduling.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-all border border-gray-100 dark:border-dark-border"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-dark-text truncate">
                          {scheduling.customer?.name || "Cliente não informado"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                          {scheduling.service?.name || "Serviço"} • {scheduling.user?.name || "Profissional"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
                          {formatSchedulingDate(scheduling.date)}
                        </span>
                        {getStatusBadge(scheduling.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mx-4 md:mx-10 mb-4 md:mb-10">
        {canViewCustomers && (
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text">{customers.length}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-dark-text-secondary">Clientes</p>
              </div>
            </div>
          </Card>
        )}

        {canViewSchedulings && (
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text">{nextSchedulings.length}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-dark-text-secondary">Agendamentos</p>
              </div>
            </div>
          </Card>
        )}

        {canViewSchedulings && (
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text">
                  {nextSchedulings.filter((s) => s.status === "pending").length}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-dark-text-secondary">Pendentes</p>
              </div>
            </div>
          </Card>
        )}

        {canViewSchedulings && (
          <Card padding="md" hover>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text">
                  {nextSchedulings.filter((s) => s.status === "confirmed").length}
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-dark-text-secondary">Confirmados</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
