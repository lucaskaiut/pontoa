import { Link } from "react-router-dom";
import InputMask from 'react-input-mask';
import { InputPhone } from '../../components/InputPhone';
import { validateData } from "../../services/formValidation";
import { useState } from "react";
import classNames from 'class-names';

export const UserForm = ({ nextStep, setFieldValue, data }) => {
    const [formErrors, setFormErrors] = useState([]);
    const handleMaskedInput = (field, value) => {
        setFieldValue(field, value.replace(/\D/g, ''));
    }

    const rules = {
        name: ['required'],
        email: ['required'],
        password: ['required'],
        document: ['required', 'length:11'],
        phone: ['required', 'max:11', 'min:10'],
    }

    const handleNextStepButton = () => {
        const {hasError, errors} = validateData(data, rules);

        setFormErrors(errors);

        if (hasError) {
            return;
        }

        nextStep();
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-purple-400 to-blue-500 text-3xl mb-4 shadow-lg">
                    👤
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Seus Dados Pessoais
                </h2>
                <p className="text-gray-600">
                    Comece nos contando um pouco sobre você
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Completo
                    </label>
                    <input
                        className={classNames(
                            "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                            "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                            {
                                "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.name,
                                "border-gray-200 hover:border-gray-300": !formErrors.name
                            }
                        )} 
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={data.name}
                        onChange={event => setFieldValue('name', event.target.value)}
                    />
                    {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha seu nome</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mail
                    </label>
                    <input
                        className={classNames(
                            "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                            "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                            {
                                "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.email,
                                "border-gray-200 hover:border-gray-300": !formErrors.email
                            }
                        )}
                        type="email"
                        placeholder="seu@email.com"
                        value={data.email}
                        onChange={event => setFieldValue('email', event.target.value)}
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha um e-mail válido</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Senha
                    </label>
                    <input
                        className={classNames(
                            "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                            "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                            {
                                "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.password,
                                "border-gray-200 hover:border-gray-300": !formErrors.password
                            }
                        )}
                        type="password"
                        placeholder="Crie uma senha segura"
                        value={data.password}
                        onChange={event => setFieldValue('password', event.target.value)}
                    />
                    {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Por favor, crie uma senha</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Telefone
                        </label>
                        <InputPhone 
                            value={data.phone} 
                            onChange={event => handleMaskedInput('phone', event.target.value)} 
                            hasError={formErrors.phone != undefined && formErrors.phone == true}
                        />
                        {formErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">⚠️ Telefone inválido</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            CPF
                        </label>
                        <InputMask 
                            type="text"
                            placeholder="000.000.000-00"
                            value={data.document}
                            mask="999.999.999-99"
                            onChange={event => handleMaskedInput('document', event.target.value)}
                        >
                            {props => (
                                <input
                                    className={classNames(
                                        "w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
                                        "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                                        {
                                            "border-red-300 bg-red-50 focus:ring-red-200 focus:border-red-400": formErrors.document,
                                            "border-gray-200 hover:border-gray-300": !formErrors.document
                                        }
                                    )}
                                    {...props}
                                />
                            )}
                        </InputMask>
                        {formErrors.document && (
                            <p className="mt-1 text-sm text-red-600">⚠️ CPF inválido</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-4">
                <button
                    className="w-full bg-linear-to-r from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    type="submit"
                    onClick={handleNextStepButton}
                >
                    Continuar →
                </button>

                <div className="text-center">
                    <Link 
                        to="/login" 
                        className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                    >
                        ← Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
}