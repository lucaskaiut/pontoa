import React from 'react';

export function Welcome({ onNext, isFirstStep }) {
  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-6">🎉</div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">
        Bem-vindo ao PontoA!
      </h3>
      <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
        Vamos configurar sua conta em poucos passos simples. Este processo é rápido 
        e você pode pular qualquer etapa se preferir configurar depois.
      </p>

      <div className="bg-purple-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 justify-center">
          <span className="text-2xl">✨</span>
          O que vamos configurar:
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div className="flex gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <p className="font-medium text-gray-900">Colaboradores</p>
              <p className="text-sm text-gray-600">Adicione sua equipe</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-medium text-gray-900">Horários</p>
              <p className="text-sm text-gray-600">Defina horários de trabalho</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🎭</span>
            <div>
              <p className="font-medium text-gray-900">Perfis</p>
              <p className="text-sm text-gray-600">Configure permissões</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-medium text-gray-900">Notificações</p>
              <p className="text-sm text-gray-600">Personalize alertas</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNext(false)}
        className="bg-linear-to-r from-purple-400 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
      >
        Começar Configuração
      </button>
    </div>
  );
}

