import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CustomersService } from "../services/CustomersService";
import { CustomerPackageService } from "../services/CustomerPackageService";
import type { Customer, Scheduling } from "../types";
import type { CustomerPackage } from "../services/CustomerPackageService";
import { Header } from "../components/Header";

function MyInfoPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/");
      return;
    }

    loadData();
  }, [navigate]);

  const { data: packagesResponse, isLoading: packagesLoading } = useQuery({
    queryKey: ["customer-packages"],
    queryFn: () => CustomerPackageService.getMyPackages(),
    enabled: !!localStorage.getItem("auth_token"),
  });

  const packages = packagesResponse?.data || [];

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const customerData = await CustomersService.getMe();
      const schedulingsData = await CustomersService.getMySchedulings(customerData.email);
      
      setCustomer(customerData);
      setSchedulings(schedulingsData);
      setEditData({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar suas informações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!customer) return;

    try {
      setLoading(true);
      const updatedCustomer = await CustomersService.updateMe(editData);
      setCustomer(updatedCustomer);
      setIsEditing(false);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
      toast.error("Erro ao atualizar suas informações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 3);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 3);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  function getStatusBadge(status: string | null) {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendente", color: "bg-warning/20 text-warning border-warning/50" },
      confirmed: { label: "Confirmado", color: "bg-success/20 text-success border-success/50" },
      cancelled: { label: "Cancelado", color: "bg-error/20 text-error border-error/50" },
      no_show: { label: "Não compareceu", color: "bg-orange-500/20 text-orange-600 border-orange-500/50" },
      completed: { label: "Concluído", color: "bg-primary/20 text-primary border-primary/50" },
    };

    const statusInfo = status ? statusMap[status] || { label: status, color: "bg-white/10 text-white/60 border-white/20" } : { label: "Agendado", color: "bg-success/20 text-success border-success/50" };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  }

  if (loading && !customer) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/")} />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary">Carregando suas informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/")} />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-text-primary mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBack={() => navigate("/")} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Minhas Informações</h1>
          <p className="text-text-secondary text-sm">Gerencie seus dados e veja seus agendamentos</p>
        </div>

        <div className="mb-6">
          <a
            href="/minhas-avaliacoes"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Minhas Avaliações
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Dados Pessoais</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (customer) {
                        setEditData({
                          name: customer.name,
                          email: customer.email,
                          phone: customer.phone,
                        });
                      }
                    }}
                    className="px-4 py-2 bg-surface hover:bg-primary-hover text-text-primary text-sm rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors disabled:opacity-30"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>

            {customer && !isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Nome</label>
                  <p className="text-text-primary">{customer.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">E-mail</label>
                  <p className="text-text-primary">{customer.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Telefone</label>
                  <p className="text-text-primary">{formatPhone(customer.phone)}</p>
                </div>
                {customer.document && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">CPF</label>
                    <p className="text-text-primary">{customer.document}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">Nome</label>
                  <input
                    type="text"
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">Telefone</label>
                  <input
                    type="tel"
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            </div>

            <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Meus Pacotes</h2>

              {packagesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                  <p className="text-text-secondary text-sm">Carregando pacotes...</p>
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-text-secondary text-sm mb-4">Você ainda não possui pacotes</p>
                  <button
                    onClick={() => navigate("/pacotes")}
                    className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-xl transition-colors"
                  >
                    Ver Pacotes Disponíveis
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                  {packages.map((pkg: CustomerPackage) => (
                    <div
                      key={pkg.id}
                      className={`bg-accent-soft border rounded-xl p-4 transition-colors ${
                        pkg.is_valid
                          ? "border-success/50 hover:bg-success/5"
                          : "border-white/20 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-text-primary font-medium mb-1">
                            {pkg.package?.name || "Pacote"}
                          </h3>
                          {pkg.package?.description && (
                            <p className="text-text-secondary text-xs mb-2">{pkg.package.description}</p>
                          )}
                        </div>
                        {pkg.is_valid ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-lg bg-success/20 text-success border border-success/50">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-500/20 text-gray-400 border border-gray-500/50">
                            {pkg.is_expired ? "Expirado" : "Esgotado"}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Sessões totais:</span>
                          <span className="text-text-primary font-medium">{pkg.total_sessions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Sessões disponíveis:</span>
                          <span className={`font-bold ${pkg.remaining_sessions > 0 ? "text-success" : "text-error"}`}>
                            {pkg.remaining_sessions}
                          </span>
                        </div>
                        {pkg.expires_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">Validade:</span>
                            <span className={`text-text-primary ${pkg.is_expired ? "text-error" : ""}`}>
                              {formatDate(pkg.expires_at)}
                            </span>
                          </div>
                        )}
                        {!pkg.expires_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">Validade:</span>
                            <span className="text-text-primary">Ilimitado</span>
                          </div>
                        )}
                        {pkg.usages && pkg.usages.length > 0 && (
                          <div className="pt-2 border-t border-white/10">
                            <p className="text-xs text-text-secondary mb-1">
                              Sessões utilizadas: {pkg.total_sessions - pkg.remaining_sessions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 border border-white/10 lg:row-span-2">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Meus Agendamentos</h2>

            {schedulings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm">Você ainda não possui agendamentos</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-xl transition-colors"
                >
                  Fazer um Agendamento
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {schedulings.map((scheduling) => (
                  <div
                    key={scheduling.id}
                    className="bg-accent-soft border border-white/60 rounded-xl p-4 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-text-primary font-medium">{scheduling.service.name}</h3>
                        <p className="text-text-secondary text-sm">com {scheduling.user.name}</p>
                      </div>
                      {getStatusBadge(scheduling.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(scheduling.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(scheduling.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>R$ {scheduling.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyInfoPage;

