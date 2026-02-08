import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartIcon } from "./CartIcon";

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({ showBackButton = false, onBack }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("auth_token");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/");
  }

  function handleLogin() {
    navigate("/login", { state: { from: location.pathname } });
  }

  function handleMyInfo() {
    navigate("/minhas-informacoes");
  }

  function handlePackages() {
    navigate("/pacotes");
  }

  function handleHome() {
    navigate("/");
    setIsMobileMenuOpen(false);
  }

  function handlePackagesClick() {
    handlePackages();
    setIsMobileMenuOpen(false);
  }

  function handleMyInfoClick() {
    handleMyInfo();
    setIsMobileMenuOpen(false);
  }

  function handleLogoutClick() {
    handleLogout();
    setIsMobileMenuOpen(false);
  }

  function handleLoginClick() {
    handleLogin();
    setIsMobileMenuOpen(false);
  }

  return (
    <header className="bg-surface/80 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBack || handleHome}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button onClick={handleHome} className="text-lg font-semibold text-white hover:text-white/80 transition-colors">
              NOX Agenda
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CartIcon />
            <button
              onClick={handleHome}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
            >
              Agendar
            </button>
            <button
              onClick={handlePackages}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
            >
              Pacotes
            </button>
            {isAuthenticated && (
              <button
                onClick={handleMyInfo}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
              >
                Minhas Informações
              </button>
            )}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-surface hover:bg-primary-hover text-text-primary text-sm rounded-lg transition-colors hidden sm:block"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors items-center gap-2 hidden sm:flex"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={handleHome}
                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
              >
                Agendar
              </button>
              <button
                onClick={handlePackagesClick}
                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
              >
                Pacotes
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleMyInfoClick}
                  className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
                >
                  Minhas Informações
                </button>
              )}
              {isAuthenticated ? (
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-sm bg-surface hover:bg-primary-hover text-text-primary rounded-lg transition-colors"
                >
                  Sair
                </button>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Entrar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

