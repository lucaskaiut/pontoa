import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { CustomersService, type LoginPayload } from "../services/CustomersService";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "O e-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "A senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await CustomersService.login(formData);
      
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      const from = (location.state as { from?: string })?.from || "/";
      navigate(from);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setErrors({
          general: axiosError.response?.data?.message || "E-mail ou senha incorretos",
        });
      } else {
        setErrors({ general: "Erro ao fazer login. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center p-5" style={{ minHeight: "calc(100vh - 4rem)" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Entrar na Conta
            </h1>
            <p className="text-text-secondary text-sm">
              Acesse sua conta para gerenciar seus agendamentos
            </p>
          </div>

          <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-white border ${
                    errors.email ? "border-error" : "border-gray-300"
                  } text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200`}
                  placeholder="seu@email.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-error text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-white border ${
                      errors.password ? "border-error" : "border-gray-300"
                    } text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 pr-12`}
                    placeholder="Digite sua senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs mt-1.5">{errors.password}</p>
                )}
              </div>

              {errors.general && (
                <div className="bg-error/10 border border-error/50 rounded-xl p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-error text-sm">{errors.general}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-text-secondary text-sm">
              Ainda não tem uma conta? Entre em contato com a empresa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;


