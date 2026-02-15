import React from 'react';

export function Completion({ onNext, isCompleting }) {
  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-6">🎊</div>
      <h3 className="text-3xl font-bold text-gray-900 mb-4">
        Tudo Pronto!
      </h3>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
        Sua conta está configurada e pronta para uso. Agora você pode começar a 
        gerenciar seus agendamentos e fazer sua empresa crescer!
      </p>

      <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
        <h4 className="font-semibold text-gray-900 mb-6 text-xl">
          Próximos Passos Sugeridos:
        </h4>
        <div className="grid gap-4 text-left">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Configure seus Serviços</p>
              <p className="text-sm text-gray-600">
                Adicione os serviços que você oferece com valores e duração
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Personalize sua Empresa</p>
              <p className="text-sm text-gray-600">
                Adicione logo, cores e informações da sua empresa
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Convide sua Equipe</p>
              <p className="text-sm text-gray-600">
                Adicione mais colaboradores e atribua perfis de acesso
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">
              4
            </div>
            <div>
              <p className="font-medium text-gray-900">Comece a Agendar</p>
              <p className="text-sm text-gray-600">
                Crie seu primeiro agendamento e teste o sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNext(false)}
        disabled={isCompleting}
        className="bg-linear-to-r from-purple-400 to-blue-500 text-white px-12 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCompleting ? 'Finalizando...' : 'Começar a Usar o PontoA'}
      </button>

      <p className="text-sm text-gray-500 mt-6">
        Você pode acessar todas essas configurações no menu lateral a qualquer momento
      </p>
    </div>
  );
}

