import classNames from "classnames";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export function Login () {
    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const { login } = useAuth();

    const navigate = useNavigate();

    async function handleLoginSubmit(event) {
        event.preventDefault();

        const userHasLogged = await login(email, password);

        if (userHasLogged) {
            navigate('/');
        } else {

        }
    }

    return (
        <div className="flex grow bg-white dark:bg-dark-bg">
            <div className="h-screen flex-2 flex flex-col justify-center items-center px-3">
                <h1 className="text-gray-700 dark:text-dark-text text-2xl">
                    Acesse sua conta
                </h1>
                <form 
                    className="flex flex-col justify-center items-center gap-4 w-full mt-4"
                    onSubmit={handleLoginSubmit}    
                >
                    <input
                        className={classNames("bg-white dark:bg-dark-surface rounded-md py-4 px-4 sm:w-4/12 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500", {
                            "border-gray-300 dark:border-dark-border": true,
                            "border-danger-500": false,
                        })}
                        type="email"
                        placeholder="E-Mail"
                        onChange={event => setEmail(event.target.value)}
                    />
                    <input
                        className={classNames("bg-white dark:bg-dark-surface rounded-md py-4 px-4 sm:w-4/12 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500", {
                            "border-gray-300 dark:border-dark-border": true,
                            "border-danger-500": false,
                        })}
                        type="password"
                        placeholder="Senha"
                        onChange={event => setPassword(event.target.value)}
                    />
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text transition-colors">Esqueci minha senha</a>
                        <Link to="/cadastro" className="text-gray-900 dark:text-blue-400 hover:text-gray-700 dark:hover:text-blue-300 transition-colors">Criar conta</Link>
                    </div>
                    <button
                        className="bg-primary dark:bg-blue-600 hover:opacity-90 dark:hover:opacity-80 text-white transition-all rounded-md py-4 px-4 sm:w-4/12 w-full"
                        type="submit"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}