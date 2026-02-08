import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const DEFAULT_VALUE = {
  selectedCompany: null,
  availableCompanies: [],
  selectCompany: (companyId) => {},
  isLoadingCompanies: true,
  isSuperadmin: false,
  userCompanyId: null,
};

export const CompanyContext = createContext(DEFAULT_VALUE);

export function CompanyContextProvider({ children }) {
  const { user, isUserLogged, isFetching: isAuthFetching, me } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperadmin = user?.type === 'superadmin';
  const userCompanyId = user?.company?.id || null;

  const fetchCompanies = useCallback(async () => {
    if (!isUserLogged || isAuthFetching) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userCompanyResponse = await api.get('/companies/me');
      const userCompanyData = userCompanyResponse.data?.data || userCompanyResponse.data;
      
      const userCompany = {
        id: userCompanyId,
        name: userCompanyData?.name || user?.company?.name || 'Minha Empresa',
        email: userCompanyData?.email || user?.company?.email,
        domain: userCompanyData?.domain,
      };

      let companies = [userCompany];

      if (isSuperadmin && userCompanyId) {
        try {
          const childCompaniesResponse = await api.get('/companies', {
            params: {
              parent_id: userCompanyId,
            },
          });

          const childCompanies = (childCompaniesResponse.data?.data || childCompaniesResponse.data || []).map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            domain: c.domain,
          }));
          companies = [...companies, ...childCompanies];
        } catch (error) {
          console.error("Failed to fetch child companies:", error);
          toast.error("Erro ao carregar empresas filhas.");
        }
      }
      
      setAvailableCompanies(companies);

      const storedCompanyId = localStorage.getItem('selected_company_id');
      let initialSelectedCompany = userCompany;
      
      if (storedCompanyId && storedCompanyId.trim() !== '' && storedCompanyId !== String(userCompanyId)) {
        const foundCompany = companies.find(c => String(c.id) === String(storedCompanyId));
        if (foundCompany) {
          initialSelectedCompany = foundCompany;
        } else {
          initialSelectedCompany = userCompany;
          localStorage.setItem('selected_company_id', String(userCompanyId));
        }
      } else {
        initialSelectedCompany = userCompany;
        localStorage.setItem('selected_company_id', String(userCompanyId));
      }

      setSelectedCompany(initialSelectedCompany);
    } catch (error) {
      console.error("Failed to fetch company data:", error);
      toast.error("Erro ao carregar dados da empresa.");
      setSelectedCompany(null);
      setAvailableCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, [isUserLogged, isAuthFetching, isSuperadmin, userCompanyId, user?.company?.name, user?.company?.email]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany && selectedCompany.id) {
      const currentStored = localStorage.getItem('selected_company_id');
      if (currentStored !== String(selectedCompany.id)) {
        localStorage.setItem('selected_company_id', String(selectedCompany.id));
      }
    }
  }, [selectedCompany]);

  const selectCompany = useCallback(async (companyId) => {
    const companyToSelect = availableCompanies.find(c => c.id === companyId);
    if (companyToSelect) {
      localStorage.setItem('selected_company_id', String(companyId));
      setSelectedCompany(companyToSelect);
      
      queryClient.invalidateQueries();
      
      if (me && typeof me === 'function') {
        try {
          await me();
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    } else {
      toast.error("Empresa selecionada não encontrada.");
    }
  }, [availableCompanies, queryClient, me]);

  const contextValues = {
    selectedCompany,
    availableCompanies,
    selectCompany,
    isLoadingCompanies: isLoading,
    isSuperadmin,
    userCompanyId,
  };

  return (
    <CompanyContext.Provider value={contextValues}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}

