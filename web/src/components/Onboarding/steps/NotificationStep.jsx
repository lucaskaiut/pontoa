import React, { useState } from 'react';
import { notificationService } from '../../../services/notificationService';
import toast from 'react-hot-toast';

export function NotificationStep({ onNext, onSkip, onBack }) {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    time_before: 24,
    time_unit: 'hours',
    message: '',
    active: true,
    email_enabled: true,
    whatsapp_enabled: true,
  });

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
  };

  const handleMessageChange = (e) => {
    setSettings({ ...settings, message: e.target.value });
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    if (!settings.message || settings.message.length < 3) {
      toast.error('A mensagem deve ter pelo menos 3 caracteres');
      return;
    }

    if (settings.time_before < 1) {
      toast.error('O tempo de antecedência deve ser maior que 0');
      return;
    }

    setIsSaving(true);
    try {
      console.log('NotificationStep - Criando notificação:', settings);
      
      await notificationService.create(settings);
      
      toast.success('Notificação criada com sucesso!');
      onNext(true);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar notificação. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🔔</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Configure Notificações
        </h3>
        <p className="text-gray-600">
          Escolha como você e seus clientes receberão as notificações
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
              <input
                type="checkbox"
                checked={settings.active}
                onChange={() => handleToggle('active')}
                className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
              />
              <div className="flex-1">
                <span className="text-gray-700 font-medium">Notificações ativas</span>
                <p className="text-xs text-gray-500 mt-1">
                  Ative ou desative o envio de notificações
                </p>
              </div>
            </label>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Canais de Notificação</h4>
            <p className="text-sm text-gray-600 mb-4">
              Selecione os canais que deseja utilizar para enviar notificações aos clientes
            </p>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-medium text-gray-900">E-mail</p>
                    <p className="text-sm text-gray-600">Enviar notificações por e-mail</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_enabled}
                  onChange={() => handleToggle('email_enabled')}
                  className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-sm text-gray-600">Enviar notificações via WhatsApp</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.whatsapp_enabled}
                  onChange={() => handleToggle('whatsapp_enabled')}
                  className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempo de Antecedência *
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Quando enviar a notificação antes do agendamento
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  min="1"
                  value={settings.time_before}
                  onChange={(e) => handleChange('time_before', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={settings.time_unit}
                  onChange={(e) => handleChange('time_unit', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="minutes">Minutos</option>
                  <option value="hours">Horas</option>
                  <option value="days">Dias</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de Notificação *
            </label>
            <textarea
              value={settings.message}
              onChange={handleMessageChange}
              placeholder="Digite a mensagem que será enviada aos clientes nas notificações..."
              rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Exemplo: Olá! Seu agendamento está confirmado. Aguardamos você!
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Configurações detalhadas de notificações podem ser 
              ajustadas a qualquer momento na área de configurações da empresa.
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
            disabled={isSaving}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Pular esta etapa
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-linear-to-r from-purple-400 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar e Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}

