import InputMask from "react-input-mask";
import { InputPhone } from "../../components/InputPhone";
import { useState } from "react";
import { validateData } from "../../services/formValidation";
import classNames from 'class-names';

export const CompanyForm = ({ nextStep, setFieldValue, data, previousStep }) => {
    const [documentMask, setDocumentMask] = useState('999.999.999-99');
    const [documentType, setDocumentType] = useState('cpf');
    const [formErrors, setFormErrors] = useState([]);
 
    const setField = (field, value) => {
        const {company} = data;

        setFieldValue('company', {
            ...company,
            [field]: value,
        });
    }

    const handleMaskedInput = (field, value) => {
        setField(field, value.replace(/\D/g, ''));
    }

    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
        setDocumentMask(type === 'cpf' ? '999.999.999-99' : '99.999.999/9999-99');
    }

    const rules = {
        name: ['required'],
        email: ['required'],
        document: ['required', 'max:14', 'min:11'],
        phone: ['required', 'max:11', 'min:10'],
    }

    const handleNextStepButton = () => {
        const { errors, hasError } = validateData(data.company, rules);

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
                    🏢
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Dados da Empresa
                </h2>
                <p className="text-gray-600">
                    Agora nos conte sobre o seu negócio
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Fantasia
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
                        placeholder="Nome do seu negócio"
                        value={data.company.name}
                        onChange={event => setField('name', event.target.value)}
                    />
                    {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha o nome da empresa</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-mail da Empresa
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
                        placeholder="contato@empresa.com"
                        value={data.company.email}
                        onChange={event => setField('email', event.target.value)}
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Por favor, preencha um e-mail válido</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone da Empresa
                    </label>
                    <InputPhone 
                        onChange={event => handleMaskedInput('phone', event.target.value)} 
                        value={data.company.phone}
                        hasError={formErrors.phone != undefined && formErrors.phone == true}    
                    />
                    {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Telefone inválido</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Documento da Empresa
                    </label>
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="inline-flex bg-gray-100 rounded-xl p-1 md:w-auto">
                            <button
                                type="button"
                                className={classNames(
                                    "px-4 py-3 rounded-lg font-medium transition-all duration-200",
                                    documentType === 'cpf'
                                        ? "bg-white text-purple-600 shadow-md"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                                onClick={() => handleDocumentTypeChange('cpf')}
                            >
                                CPF
                            </button>
                            <button
                                type="button"
                                className={classNames(
                                    "px-4 py-3 rounded-lg font-medium transition-all duration-200",
                                    documentType === 'cnpj'
                                        ? "bg-white text-purple-600 shadow-md"
                                        : "text-gray-600 hover:text-gray-900"
                                )}
                                onClick={() => handleDocumentTypeChange('cnpj')}
                            >
                                CNPJ
                            </button>
                        </div>
                        <InputMask 
                            type="text"
                            placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                            value={data.company.document}
                            onChange={event => handleMaskedInput('document', event.target.value)}
                            mask={documentMask}
                        >
                            {props => (
                                <input
                                    className={classNames(
                                        "flex-1 px-4 py-4 rounded-xl border-2 transition-all duration-200 text-gray-900 bg-white",
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
                    </div>
                    {formErrors.document && (
                        <p className="mt-1 text-sm text-red-600">⚠️ Documento inválido</p>
                    )}
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button
                    className="w-full bg-linear-to-r from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                    onClick={handleNextStepButton}
                >
                    Continuar →
                </button>

                <button
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    type="button"
                    onClick={previousStep}
                >
                    ← Voltar
                </button>
            </div>
        </div>
    );
}