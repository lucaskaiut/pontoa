import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { CustomersService, type FirstAccessPayload } from "../services/CustomersService";

interface FormErrors {
  password?: string;
  password_confirmation?: string;
  general?: string;
}

function FirstAccessPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FirstAccessPayload>({
    password: "",
    password_confirmation: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = "A senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "A confirmação de senha é obrigatória";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!token) {
      setErrors({ general: "Token não encontrado na URL" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await CustomersService.firstAccess(token, formData);
      
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      
      navigate("/");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        setErrors({
          general: axiosError.response?.data?.message || "Token inválido ou expirado",
        });
      } else {
        setErrors({ general: "Erro ao definir senha. Tente novamente." });
      }
    } finally {
      setLoading(false);
    }
  }

  function getPasswordStrength(password: string): { label: string; color: string; percentage: number } {
    if (!password) return { label: "", color: "", percentage: 0 };

    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 15;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    if (strength < 40) return { label: "Fraca", color: "bg-error", percentage: strength };
    if (strength < 70) return { label: "Média", color: "bg-warning", percentage: strength };
    return { label: "Forte", color: "bg-success", percentage: strength };
  }

  const passwordStrength = getPasswordStrength(formData.password);

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-5" style={{ minHeight: "calc(100vh - 4rem)" }}>
          <div className="w-full max-w-md bg-surface backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Link Inválido</h2>
            <p className="text-text-secondary text-sm">O link de primeiro acesso não é válido.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center p-5" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Defina sua Senha
          </h1>
          <p className="text-text-secondary text-sm">
            Crie uma senha segura para acessar sua conta
          </p>
        </div>

        <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Nova Senha
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
              {formData.password && passwordStrength.percentage > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary">Força da senha:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color.replace('bg-', 'text-')
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-text-primary mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl bg-white border ${
                    errors.password_confirmation ? "border-error" : "border-gray-300"
                  } text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 pr-12`}
                  placeholder="Digite sua senha novamente"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showConfirmPassword ? (
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
              {errors.password_confirmation && (
                <p className="text-error text-xs mt-1.5">{errors.password_confirmation}</p>
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
              disabled={loading || !formData.password || !formData.password_confirmation}
              className="w-full px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Definindo senha...</span>
                </>
              ) : (
                <>
                  <span>Definir Senha</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-text-secondary/80 text-xs">
            Após definir sua senha, você será automaticamente conectado à sua conta
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default FirstAccessPage;

