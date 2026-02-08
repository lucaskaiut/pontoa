import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { validateData } from "../../services/formValidation";
import toast from "react-hot-toast";
import { UserForm } from './UserForm';
import { CompanyForm } from './CompanyForm';
import { Plan } from "./Plan";
import { Checkout } from "./Checkout";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import { analytics } from "../../services/analytics";

const STEPS_INFO = {
    userForm: { number: 1, title: 'Seus Dados', icon: '👤' },
    companyForm: { number: 2, title: 'Sua Empresa', icon: '🏢' },
    plan: { number: 3, title: 'Plano', icon: '⭐' },
    checkout: { number: 4, title: 'Pagamento', icon: '💳' }
};

export function Register () {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState('userForm');
    const { buildPayload } = usePaymentMethods();

    const formValidation = {
        name: [
            'required'
        ],
        email: [
            'required',
        ],
        password: [
            'required',
        ],
        phone: [
            'required'
        ],
    }

    const defaultData = {
        name: '',
        email: '',
        password: '',
        phone: '',
        document: '',
        company: {
            name: '',
            email: '',
            phone: '',
            document: '',
            plan: '',
            plan_type: '',
            plan_recurrence: '',
        }
    };

    const [data, setData] = useState(defaultData);

    const setFieldValue = (field, value) => {
        setData({
            ...data,
            [field]: value
        });
    }

    const handleSubmit = async ({ card, address }) => {
        try {
            const registerData = {
                use_platform_payment: true,
                user: {...data},
                company: {
                    ...data.company,
                    credit_card: card,
                    address: address
                }
            }

            await register(registerData);
            
            analytics.trackSignUp({
                method: 'email',
                page_type: 'registration',
                plan: data.company.plan,
                plan_type: data.company.plan_type,
                plan_recurrence: data.company.plan_recurrence,
            });
            
            navigate('/login');
            toast.success('Usuário criado com sucesso!');
        } catch ({ response }) {
            const errorMessage = response?.data?.message || 'Erro ao criar usuário. Tente novamente.';
            toast.error(errorMessage);
        }
    }

    const steps = {
        userForm: {
            component: UserForm,
            props: {
                nextStep: () => setStep('companyForm'), 
                setFieldValue: setFieldValue, 
                data: data 
            }
        },
        companyForm: {
            component: CompanyForm,
            props: {
                nextStep: () => setStep('plan'), 
                previousStep: () => setStep('userForm'),
                setFieldValue: setFieldValue, 
                data: data 
            }
        },
        plan: {
            component: Plan,
            props: {
                nextStep: () => setStep('checkout'),
                previousStep: () => setStep('companyForm'),
                setFieldValue,
                data
            }
        },
        checkout: {
            component: Checkout,
            props: {
                submit: handleSubmit,
                previousStep: () => setStep('plan'),
                data,
            }
        }
    }

    const CurrentStep = steps[step]?.component;
    
    if (!CurrentStep) {
        return null;
    }

    const currentStepNumber = STEPS_INFO[step]?.number || 1;

    return (
        <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-white overflow-y-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-block bg-linear-to-r from-purple-400 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
                            🚀 Comece Gratuitamente
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                            Crie sua conta no{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-600">
                                Nox Agenda
                            </span>
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Configure em minutos e comece a automatizar seus agendamentos
                        </p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 md:gap-4">
                            {Object.entries(STEPS_INFO).map(([key, info], index) => {
                                const isActive = step === key;
                                const isPast = info.number < currentStepNumber;
                                const isLast = index === Object.keys(STEPS_INFO).length - 1;

                                return (
                                    <React.Fragment key={key}>
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`
                                                    flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full text-xl md:text-2xl
                                                    transition-all duration-300 shadow-lg
                                                    ${isActive 
                                                        ? 'bg-linear-to-r from-purple-400 to-blue-500 scale-110 ring-4 ring-purple-200' 
                                                        : isPast
                                                        ? 'bg-linear-to-r from-emerald-400 to-emerald-500'
                                                        : 'bg-gray-200'
                                                    }
                                                `}
                                            >
                                                {isPast ? '✓' : info.icon}
                                            </div>
                                            <span 
                                                className={`
                                                    text-xs md:text-sm mt-2 font-medium hidden md:block
                                                    ${isActive ? 'text-purple-600' : isPast ? 'text-emerald-600' : 'text-gray-500'}
                                                `}
                                            >
                                                {info.title}
                                            </span>
                                        </div>
                                        {!isLast && (
                                            <div 
                                                className={`
                                                    h-1 w-8 md:w-16 rounded-full transition-all duration-300
                                                    ${isPast ? 'bg-linear-to-r from-emerald-400 to-emerald-500' : 'bg-gray-200'}
                                                `}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xs rounded-3xl shadow-2xl border border-gray-100 p-6 md:p-10">
                        <CurrentStep {...steps[step].props} />
                    </div>

                    <div className="text-center mt-6 text-sm text-gray-600">
                        <p>
                            ⚡ Teste grátis por 7-30 dias • Cancele quando quiser
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}