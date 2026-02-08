import React, { useState } from 'react';
import { userService } from '../../../services/userService';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  { id: 0, name: 'Dom', label: 'Domingo' },
  { id: 1, name: 'Seg', label: 'Segunda' },
  { id: 2, name: 'Ter', label: 'Terça' },
  { id: 3, name: 'Qua', label: 'Quarta' },
  { id: 4, name: 'Qui', label: 'Quinta' },
  { id: 5, name: 'Sex', label: 'Sexta' },
  { id: 6, name: 'Sáb', label: 'Sábado' },
];

export function ScheduleStep({ onNext, onSkip, onBack, availableServices, currentUser }) {
  const [isCreating, setIsCreating] = useState(false);
  
  console.log('ScheduleStep - Recebeu props:', { availableServices, currentUser });
  
  const users = currentUser ? [currentUser] : [];
  
  const services = availableServices || [];
  
  console.log('ScheduleStep - users:', users);
  console.log('ScheduleStep - services:', services);
  console.log('ScheduleStep - services.length:', services.length);
  
  const [formData, setFormData] = useState({
    start_at: '08:00',
    end_at: '18:00',
    days: [1, 2, 3, 4, 5],
    user_id: users.length > 0 ? users[0].id : null,
    service_ids: [],
  });

  const handleToggleDay = (dayId) => {
    if (formData.days.includes(dayId)) {
      setFormData({
        ...formData,
        days: formData.days.filter(d => d !== dayId),
      });
    } else {
      setFormData({
        ...formData,
        days: [...formData.days, dayId].sort(),
      });
    }
  };

  const handleToggleService = (serviceId) => {
    if (formData.service_ids.includes(serviceId)) {
      setFormData({
        ...formData,
        service_ids: formData.service_ids.filter(id => id !== serviceId),
      });
    } else {
      setFormData({
        ...formData,
        service_ids: [...formData.service_ids, serviceId],
      });
    }
  };

  const handleCreate = async () => {
    if (!formData.start_at || !formData.end_at || formData.days.length === 0) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (!formData.user_id) {
      toast.error('Selecione um profissional');
      return;
    }

    if (services.length === 0) {
      toast.error('É necessário cadastrar pelo menos um serviço antes de criar horários');
      return;
    }

    if (formData.service_ids.length === 0) {
      toast.error('Selecione pelo menos um serviço');
      return;
    }

    setIsCreating(true);
    try {
      const scheduleData = {
        start_at: formData.start_at,
        end_at: formData.end_at,
        days: formData.days.join(','),
        services: formData.service_ids,
      };

      console.log('ScheduleStep - Enviando schedule:', scheduleData);
      console.log('ScheduleStep - Para usuário ID:', formData.user_id);

      const response = await userService.update(formData.user_id, {
        schedules: [scheduleData]
      });

      console.log('ScheduleStep - Response:', response);

      toast.success('Horário adicionado com sucesso!');
      onNext(true);
    } catch (error) {
      console.error('Erro ao criar horário:', error);
      toast.error('Erro ao adicionar horário. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">⏰</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Configure Horários de Trabalho
        </h3>
        <p className="text-gray-600">
          Defina os horários em que sua equipe estará disponível
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="grid gap-6">
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
            </div>
          )}

          {users.length === 1 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800">
                📋 Horário será criado para: <strong>{users[0].name}</strong>
              </p>
            </div>
          )}

          {services.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Atenção:</strong> Você precisa cadastrar pelo menos um serviço 
                antes de criar horários. Volte para a etapa anterior.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Início *
              </label>
              <input
                type="time"
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Término *
              </label>
              <input
                type="time"
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dias da Semana *
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleToggleDay(day.id)}
                  className={`
                    py-3 px-2 rounded-lg font-medium text-sm transition-all
                    ${formData.days.includes(day.id)
                      ? 'bg-linear-to-r from-purple-400 to-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-300'
                    }
                  `}
                  title={day.label}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>

          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Serviços Disponíveis *
              </label>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {services.map((service) => (
                  <label
                    key={service.id || service.data?.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.service_ids.includes(service.id || service.data?.id)}
                      onChange={() => handleToggleService(service.id || service.data?.id)}
                      className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                    />
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">
                        {service.name || service.data?.name}
                      </span>
                      {(service.duration || service.data?.duration) && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({service.duration || service.data?.duration} min)
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Você poderá adicionar horários específicos para diferentes 
              profissionais e serviços depois na área de Agendas.
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
            disabled={isCreating || services.length === 0}
            className="bg-linear-to-r from-purple-400 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isCreating ? 'Adicionando...' : 'Adicionar e Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

