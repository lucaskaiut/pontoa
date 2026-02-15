import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`
});

api.interceptors.request.use((config) => {
  const selectedCompanyId = localStorage.getItem('selected_company_id');
  const userCompanyId = localStorage.getItem('user_company_id');
  const accessToken = localStorage.getItem('access_token');
  
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const isCompaniesEndpoint = config.url && (
    config.url.includes('/companies') && 
    !config.url.includes('/companies/me') &&
    !config.url.includes('/companies/calculate-plan-change') &&
    !config.url.includes('/companies/change-plan')
  );

  const isUsersMeEndpoint = config.url && config.url.includes('/users/me');
  
  const isCompanyUpdateEndpoint = config.url && config.method && 
    ['put', 'patch'].includes(config.method.toLowerCase()) &&
    config.url.match(/\/companies\/\d+/);

  const isPlanChangeEndpoint = config.url && (
    config.url.includes('/companies/calculate-plan-change') ||
    config.url.includes('/companies/change-plan')
  );

  if (selectedCompanyId && userCompanyId && !isCompaniesEndpoint && !isUsersMeEndpoint) {
    if (!config.params) {
      config.params = {};
    }
    
    if (isCompanyUpdateEndpoint) {
      const companyIdMatch = config.url.match(/\/companies\/(\d+)/);
      if (companyIdMatch && companyIdMatch[1] !== String(userCompanyId)) {
        config.params.company_id = companyIdMatch[1];
      }
    } else if (isPlanChangeEndpoint) {
      if (config.data && typeof config.data === 'object' && !Array.isArray(config.data) && config.data.company_id) {
      }
    } else if (selectedCompanyId !== userCompanyId) {
      config.params.company_id = selectedCompanyId;
    }
  }

  return config;
});

export default api;