import React, { useState } from 'react';
import { userService } from '../../../services/userService';
import toast from 'react-hot-toast';
import InputMask from 'react-input-mask';

export function UserStep({ onNext, onSkip, onBack, onUserCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsCreating(true);
    try {
      const user = await userService.create(formData);
      toast.success('Colaborador adicionado com sucesso!');
      
      if (onUserCreated) {
        onUserCreated(user);
      }
      
      onNext(true);
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      toast.error('Erro ao adicionar colaborador. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">👥</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Adicione Colaboradores
        </h3>
        <p className="text-gray-600">
          Cadastre os profissionais que farão parte da sua equipe
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ex: joao@exemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <InputMask
              mask="(99) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            >
              {(inputProps) => (
                <input
                  {...inputProps}
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              )}
            </InputMask>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Senha de acesso"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Voltar
        </button>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={isCreating}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Pular esta etapa
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-linear-to-r from-purple-400 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isCreating ? 'Adicionando...' : 'Adicionar e Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

