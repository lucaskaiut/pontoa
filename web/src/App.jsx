import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "./contexts/AuthContext";
import { CompanyContextProvider } from "./contexts/CompanyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Router } from "./Router";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AuthContextProvider>
              <CompanyContextProvider>
                <ErrorBoundary>
                  <Router />
                </ErrorBoundary>
              </CompanyContextProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  error: {
                    style: {
                      background: '#e52e4d',
                      color: '#fff'
                    },
                  },
                }} 
              />
            </AuthContextProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
