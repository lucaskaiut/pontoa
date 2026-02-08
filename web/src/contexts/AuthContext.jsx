import { createContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const DEFAULT_VALUE = { 
    user: {},
    login: (email, password) => {},
    isUserLogged: false,
    register: (data) => {},
    me: async () => {},
    isFetching: true,
}

export const AuthContext = createContext(DEFAULT_VALUE);

export function AuthContextProvider ({ children }) {
    const [user, setUser] = useState(null);

    const [isUserLogged, setIsUserLogged] = useState(false);

    const [isFetching, setIsFetching] = useState(true)

    useEffect(() => {
        me();
    }, []);

    async function register(data) {
        await api.post('/users/register', data).finally(() => setIsFetching(false));
    }

    async function login (email, password) {
        try {
            const { data } = await api.post('/users/login', {
                email,
                password
            });

            const {token, user: userData} = data;

            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;

            localStorage.setItem('access_token', token);

            // Processar permissões dos roles e adicionar ao objeto user
            if (userData && userData.roles && Array.isArray(userData.roles)) {
                const allPermissions = new Set();
                
                userData.roles.forEach(role => {
                    if (role.permissions && Array.isArray(role.permissions)) {
                        role.permissions.forEach(permission => {
                            allPermissions.add(permission);
                        });
                    }
                });

                // Adiciona array de permissões ao objeto user para facilitar acesso
                userData.permissions = Array.from(allPermissions);
            } else {
                userData.permissions = [];
            }

            if (userData.company && !userData.company.id && userData.company_id) {
                userData.company.id = userData.company_id;
            }

            if (userData.company?.id) {
                localStorage.setItem('user_company_id', String(userData.company.id));
            }

            setUser(userData);

            setIsUserLogged(true);

            setIsFetching(false);

            return true;
        } catch ({ response }) {
            toast.error("Oops! Tivemos um problema ao realizar login. Verifique suas credenciais e tente novamente.");

            setIsFetching(false);

            return false;
        }
    }

    async function logout () {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_company_id');
        localStorage.removeItem('selected_company_id');

        api.defaults.headers.common['Authorization'] = null;

        setUser(null);

        setIsUserLogged(false);

        setIsFetching(false);
    }

    async function me() {
        const access_token = localStorage.getItem('access_token');

        if (!access_token) {
            logout();

            setIsFetching(false);

            return;
        }

        api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;

        try {
            const { data } = await api.post('/users/me');

            const userData = data.data;

            // Processar permissões dos roles e adicionar ao objeto user
            if (userData && userData.roles && Array.isArray(userData.roles)) {
                const allPermissions = new Set();
                
                userData.roles.forEach(role => {
                    if (role.permissions && Array.isArray(role.permissions)) {
                        role.permissions.forEach(permission => {
                            allPermissions.add(permission);
                        });
                    }
                });

                // Adiciona array de permissões ao objeto user para facilitar acesso
                userData.permissions = Array.from(allPermissions);
            } else {
                userData.permissions = [];
            }

            if (userData.company && !userData.company.id && userData.company_id) {
                userData.company.id = userData.company_id;
            }

            if (userData.company?.id) {
                localStorage.setItem('user_company_id', String(userData.company.id));
            }

            setUser(userData);

            setIsUserLogged(true);
        } catch (error) {
            logout();
        }

        setIsFetching(false);
    }

    const contextValues = {
        user: user || null,
        isUserLogged,
        login,
        logout,
        register,
        me,
        isFetching
    }

    return (
        <AuthContext.Provider
            value={contextValues}
        >
            { children }
        </AuthContext.Provider>
    );
} 