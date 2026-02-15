import React, { useState } from 'react';
import { userService } from '../../../services/userService';
import toast from 'react-hot-toast';

export function ServiceStep({ onNext, onSkip, onBack, onServiceCreated, currentUser }) {
  const [isCreating, setIsCreating] = useState(false);
  
  const users = currentUser ? [currentUser] : [];
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    duration: 60,
    commission: '',
    status: true,
    user_id: users.length > 0 ? users[0].id : null,
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast.error('Preencha os campos obrigatórios (Nome, Preço e Duração)');
      return;
    }

    if (!formData.user_id) {
      toast.error('Selecione um profissional');
      return;
    }

    setIsCreating(true);
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : 0,
        duration: parseInt(formData.duration),
        commission: formData.commission ? parseFloat(formData.commission) : 0,
        status: formData.status,
      };

      const response = await userService.update(formData.user_id, {
        services: [serviceData]
      });
      
      toast.success('Serviço adicionado com sucesso!');
      
      const userData = response.data || response;
      
      console.log('ServiceStep - Response completo:', response);
      console.log('ServiceStep - userData:', userData);
      console.log('ServiceStep - services:', userData.services);
      
      if (onServiceCreated && userData.services && userData.services.length > 0) {
        const createdService = userData.services[userData.services.length - 1];
        console.log('ServiceStep - Serviço criado:', createdService);
        onServiceCreated(createdService);
      }
      
      onNext(true);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao adicionar serviço. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💼</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Cadastre seus Serviços
        </h3>
        <p className="text-gray-600">
          Adicione os serviços que sua empresa oferece
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="grid gap-4">
          {users.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional *
              </label>
              <select
                value={formData.user_id || ''}
                onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                O serviço será associado a este profissional
              </p>
            </div>
          )}

          {users.length === 1 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800">
                💼 Serviço será criado para: <strong>{users[0].name}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Serviço *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Corte de Cabelo, Consulta, Massagem"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o serviço oferecido"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração (minutos) *
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h 30min</option>
                <option value={120}>2 horas</option>
                <option value={180}>3 horas</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleChange('cost', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Custo operacional do serviço</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comissão (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.commission}
                onChange={(e) => handleChange('commission', e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Comissão do profissional</p>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => handleChange('status', e.target.checked)}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">Serviço ativo</span>
                <p className="text-xs text-gray-500 mt-1">
                  Serviços inativos não aparecem para agendamento
                </p>
              </div>
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Você pode adicionar mais serviços depois na área de Serviços. 
              Por enquanto, adicione pelo menos um serviço principal.
            </p>
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

