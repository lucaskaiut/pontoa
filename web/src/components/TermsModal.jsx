import React from "react";
import { createPortal } from "react-dom";

export function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-9999"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-linear-to-r from-purple-400 to-blue-500 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Termos e Condições de Uso</h2>
          <button
            className="text-white hover:text-gray-200 transition-colors"
            onClick={onClose}
            aria-label="Fechar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-6 md:p-8">
          <section id="terms-and-conditions">
            <p className="mb-6">
              <strong>Última atualização:</strong> 21/12/2025
            </p>

            <p className="mb-6">
              Ao realizar o cadastro e utilizar a plataforma <strong>PontoA</strong>,
              o usuário declara que leu, compreendeu e concorda integralmente com os presentes
              Termos e Condições de Uso. Caso não concorde com qualquer cláusula, o uso da
              plataforma deverá ser imediatamente interrompido.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Definições</h2>
            <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700">
              <li><strong>Plataforma:</strong> Sistema online de agendamento de serviços, gestão de horários, profissionais, clientes e comunicações automatizadas.</li>
              <li><strong>Usuário:</strong> Pessoa física ou jurídica que realiza o cadastro na plataforma.</li>
              <li><strong>Empresa:</strong> Estabelecimento ou profissional que utiliza a plataforma para gerenciar seus agendamentos.</li>
              <li><strong>Planos:</strong> Modalidades de assinatura disponíveis, com valores, funcionalidades e periodicidade previamente informados.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Objeto</h2>
            <p className="mb-6 text-gray-700">
              A plataforma tem como objetivo disponibilizar ferramentas digitais para gestão de
              agendamentos, organização de serviços, atendimento automatizado e funcionalidades
              correlatas, conforme o plano contratado.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Cadastro</h2>
            <p className="mb-6 text-gray-700">
              O cadastro é restrito a maiores de 18 anos ou representantes legais de pessoas jurídicas.
              O usuário declara que todas as informações fornecidas são verdadeiras, completas e
              atualizadas, responsabilizando-se integralmente por quaisquer dados incorretos ou
              desatualizados. Cada empresa é responsável por manter a confidencialidade de suas
              credenciais de acesso.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Planos, Pagamento e Cobrança Recorrente</h2>
            <p className="mb-4 text-gray-700">
              Ao se cadastrar, o usuário escolhe um plano de assinatura, cujas funcionalidades,
              valores e periodicidade são claramente informados no momento da contratação.
            </p>
            <p className="mb-4 text-gray-700">
              O usuário autoriza expressamente a cobrança recorrente, automática e periódica,
              de acordo com o plano selecionado, até que a assinatura seja cancelada.
            </p>
            <p className="mb-4 text-gray-700">
              A cobrança ocorrerá independentemente do uso efetivo da plataforma durante o período contratado.
            </p>
            <p className="mb-4 text-gray-700">
              Em caso de inadimplência, o acesso poderá ser suspenso temporariamente, os dados
              poderão ser bloqueados até a regularização e, após período determinado, poderão
              ser excluídos sem possibilidade de recuperação.
            </p>
            <p className="mb-6 text-gray-700">
              Valores pagos não são reembolsáveis, salvo quando exigido por lei.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">5. Cancelamento</h2>
            <p className="mb-6 text-gray-700">
              O cancelamento pode ser solicitado a qualquer momento, conforme regras informadas
              no painel ou suporte. O cancelamento interrompe cobranças futuras, mas não gera
              reembolso proporcional do período já pago. Após o cancelamento, os dados poderão
              ser mantidos por prazo limitado e posteriormente excluídos.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">6. Responsabilidades do Usuário</h2>
            <ul className="list-disc list-inside mb-6 space-y-2 text-gray-700">
              <li>Utilizar a plataforma de forma lícita;</li>
              <li>Respeitar leis, normas e regulamentos aplicáveis;</li>
              <li>Não utilizar a plataforma para práticas ilegais, abusivas, fraudulentas ou que violem direitos de terceiros;</li>
              <li>Ser integralmente responsável pelo conteúdo, informações e comunicações enviadas a seus clientes.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">7. Limitação de Responsabilidade</h2>
            <p className="mb-4 text-gray-700">
              A plataforma atua como ferramenta de apoio à gestão, não sendo responsável por
              falhas de comparecimento de clientes, cancelamentos, conflitos de agenda, perdas
              financeiras decorrentes do uso ou mau uso da plataforma ou conteúdos enviados
              pelos usuários.
            </p>
            <p className="mb-6 text-gray-700">
              Não nos responsabilizamos por indisponibilidades causadas por falhas de internet,
              serviços de terceiros, manutenções programadas ou emergenciais.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">8. Atendimento Automatizado e Integrações</h2>
            <p className="mb-6 text-gray-700">
              Funcionalidades de atendimento automatizado e integrações dependem de serviços
              de terceiros e podem sofrer limitações, instabilidades ou alterações externas.
              A plataforma não garante funcionamento ininterrupto dessas integrações.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">9. Propriedade Intelectual</h2>
            <p className="mb-6 text-gray-700">
              Todo o sistema, marca, layout, código, funcionalidades e conteúdos pertencem
              exclusivamente à <strong>PontoA</strong>, sendo vedada qualquer
              reprodução ou uso não autorizado.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">10. Proteção de Dados</h2>
            <p className="mb-6 text-gray-700">
              A plataforma adota medidas técnicas e organizacionais para proteção dos dados,
              em conformidade com a Lei Geral de Proteção de Dados (LGPD).
              O usuário é o controlador dos dados de seus clientes e assume total responsabilidade
              pelo tratamento dessas informações.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">11. Modificações dos Termos</h2>
            <p className="mb-6 text-gray-700">
              Estes Termos podem ser atualizados a qualquer momento. A continuidade do uso da
              plataforma após alterações representa concordância com a nova versão.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">12. Foro</h2>
            <p className="mb-6 text-gray-700">
              Fica eleito o foro da comarca de <strong>São José dos Pinhais, PR</strong>, com renúncia
              a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas
              ou conflitos oriundos destes Termos.
            </p>
          </section>
        </div>
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            className="bg-linear-to-r from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

