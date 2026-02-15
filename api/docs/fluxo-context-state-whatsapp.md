# Fluxo de Context State - Webhook WhatsApp

## Visão Geral

O sistema utiliza um mecanismo de **context state** para gerenciar conversas no WhatsApp, permitindo que o sistema "lembre" o estado atual da conversa e direcione mensagens para handlers específicos quando necessário.

## Componentes Principais

### 1. ConversationContext (Model)
Armazena o estado da conversa no banco de dados:
- `company_id`: ID da empresa
- `customer_phone`: Telefone do cliente (normalizado)
- `current_state`: Estado atual da conversa (idle, awaiting_confirmation, awaiting_nps, etc.)
- `state_payload`: Dados adicionais do estado (JSON)
- `locked_until`: Data/hora até quando o contexto está "travado"

### 2. ConversationContextService
Gerencia a criação, recuperação e atualização de contextos:
- `getActiveContext()`: Busca ou cria um contexto ativo para o cliente
- `createContext()`: Cria um novo contexto com estado específico
- `closeContext()`: Volta o contexto para estado "idle"

### 3. ConversationStateHandlerFactory
Factory que resolve qual handler usar baseado no estado atual

## Fluxo do Webhook

### Entrada do Webhook
1. **WhatsAppWebhookController** recebe a requisição
2. Chama **WhatsAppWebhookService::processWebhook()**

### Processamento da Mensagem

```
┌─────────────────────────────────────┐
│ 1. Extrair dados do payload         │
│    - Instance (empresa)             │
│    - Telefone do cliente            │
│    - Mensagem                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Buscar Contexto Ativo            │
│    getActiveContext(company, phone) │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌───────────┐  ┌──────────────┐
│ isLocked? │  │ Estado Idle? │
│   SIM     │  │     SIM      │
└─────┬─────┘  └──────┬───────┘
      │               │
      ▼               ▼
┌─────────────┐  ┌──────────────────┐
│ State       │  │ Detecta          │
│ Handler     │  │ Cancelamento?    │
│ (específico)│  └──────┬───────────┘
└─────────────┘         │
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌─────────────────┐
    │ Inicia fluxo  │      │ processAi       │
    │ cancelamento  │      │ Attendance      │
    │ (não envia     │      │ (envia para N8N)│
    │  para N8N)    │      └─────────────────┘
    └───────────────┘
```

### Decisão: Contexto Travado ou Livre?

#### Se `context->isLocked() === true`
- O contexto está em um estado específico (não é "idle")
- O sistema usa o **ConversationStateHandlerFactory** para resolver o handler correto
- O handler processa a mensagem de acordo com o estado:
  - `awaiting_confirmation`: Aguardando confirmação de agendamento
  - `awaiting_nps`: Aguardando avaliação NPS
  - `awaiting_nps_comment`: Aguardando comentário NPS
  - `awaiting_payment`: Aguardando pagamento

#### Se `context->isLocked() === false`
- O contexto está em estado "idle"
- **Detecção de Intenção de Cancelamento**: Antes de enviar para IA, o sistema verifica se a mensagem contém palavras-chave de cancelamento (ex: "cancelar", "desmarcar", "cancelamento", "não vou poder ir")
- Se intenção de cancelamento for detectada:
  - Cria contexto `cancel_awaiting_email` com `locked_until`
  - Solicita o e-mail do cliente
  - **NÃO envia a mensagem para N8N**
- Se não houver intenção de cancelamento:
  - A mensagem é enviada para processamento via IA (N8N)
  - O sistema monta o prompt com serviços e horários disponíveis
  - Envia para o N8N processar com a IA

## Estados do Contexto

### Idle (Padrão)
- Estado inicial quando não há processo específico em andamento
- Contexto não está "travado"
- Mensagens são processadas pela IA

### Estados Travados
Quando o contexto está em um estado específico, ele fica "travado" (`locked_until`):
- **awaiting_confirmation**: Aguardando confirmação de agendamento
- **awaiting_nps**: Aguardando avaliação NPS (0-10)
- **awaiting_nps_comment**: Aguardando comentário do cliente
- **awaiting_payment**: Aguardando confirmação de pagamento
- **cancel_awaiting_email**: Aguardando e-mail do cliente para cancelamento
- **cancel_listing_schedulings**: Listando agendamentos e aguardando escolha do cliente
- **cancel_awaiting_confirmation**: Aguardando confirmação final de cancelamento

## Regras Importantes

1. **Expiração**: Se `locked_until` estiver no passado, o contexto volta para "idle"
2. **Criação Automática**: Se não existe contexto para o cliente, um novo é criado em estado "idle"
3. **Normalização**: Telefones são normalizados antes de buscar/criar contexto
4. **Sincronização**: O sistema sincroniza automaticamente o `customer_id` quando um cliente é encontrado

## Exemplo Prático - Agendamento

1. Cliente envia mensagem: "Oi, quero agendar"
2. Sistema busca contexto → não existe → cria contexto "idle"
3. Como não está travado, envia para N8N (IA processa)
4. IA solicita confirmação → sistema cria contexto "awaiting_confirmation" com `locked_until`
5. Cliente responde: "Sim"
6. Sistema busca contexto → está travado → usa `AwaitingConfirmationHandler`
7. Handler processa confirmação → fecha contexto (volta para "idle")

## Exemplo Prático - Cancelamento

1. Cliente envia mensagem: "Quero cancelar meu agendamento"
2. Sistema busca contexto → estado "idle"
3. Sistema detecta intenção de cancelamento (palavras-chave)
4. Sistema cria contexto `cancel_awaiting_email` com `locked_until` (2 horas)
5. Sistema responde solicitando e-mail (NÃO envia para N8N)
6. Cliente envia: "meuemail@exemplo.com"
7. Sistema busca contexto → está travado → usa `CancelAwaitingEmailHandler`
8. Handler valida e-mail, busca agendamentos, lista para o cliente
9. Sistema avança para `cancel_listing_schedulings`
10. Cliente escolhe: "1" ou "15/01/2024 14:00"
11. Sistema busca contexto → usa `CancelListingSchedulingsHandler`
12. Handler resolve `scheduling_id`, pergunta confirmação
13. Sistema avança para `cancel_awaiting_confirmation`
14. Cliente confirma: "sim"
15. Sistema busca contexto → usa `CancelAwaitingConfirmationHandler`
16. Handler executa cancelamento diretamente (NÃO envia para N8N)
17. Handler responde sucesso e fecha contexto (volta para "idle")

## Fluxo de Cancelamento de Agendamento

O fluxo de cancelamento é **totalmente determinístico** e controlado pelo backend, sem depender da IA para decisões ou execuções críticas.

### 1️⃣ Estado: `cancel_awaiting_email`

**Handler**: `CancelAwaitingEmailHandler`

**Responsabilidades**:
- Valida formato do e-mail recebido
- Busca agendamentos ativos (status: `pending` ou `confirmed`) associados ao e-mail
- Se nenhum encontrado: responde erro amigável e mantém estado
- Se encontrados: salva no `state_payload` e avança para próximo estado

**state_payload**:
```json
{
  "email": "cliente@email.com",
  "schedulings": [
    {
      "id": 123,
      "date": "15/01/2024 14:00",
      "service": "Corte de Cabelo"
    }
  ]
}
```

### 2️⃣ Estado: `cancel_listing_schedulings`

**Handler**: `CancelListingSchedulingsHandler`

**Responsabilidades**:
- Interpreta a escolha do cliente (número, data/hora ou texto)
- Resolve **exatamente um `scheduling_id`** a partir da escolha
- Salva `scheduling_id` no `state_payload`
- Pergunta confirmação explícita de cancelamento
- Avança para `cancel_awaiting_confirmation`

**state_payload**:
```json
{
  "email": "cliente@email.com",
  "scheduling_id": 123,
  "scheduling_date": "15/01/2024 14:00",
  "scheduling_service": "Corte de Cabelo"
}
```

### 3️⃣ Estado: `cancel_awaiting_confirmation`

**Handler**: `CancelAwaitingConfirmationHandler`

**Responsabilidades**:
- Detecta confirmação positiva via código (ex: "sim", "confirmo", "pode cancelar")
- **NÃO envia essa mensagem para IA**
- Executa diretamente o cancelamento via `SchedulingService::cancel()`
- Em caso de sucesso:
  - Responde confirmação ao cliente
  - Encerra o contexto (`closeContext`)
- Em caso de erro:
  - Informa erro ao cliente
  - Encerra o contexto

⚠️ **Regra Crítica**: A IA nunca executa ações de cancelamento. Todo cancelamento é executado diretamente pelo backend.

## Regras de Detecção de Intenção

Quando o contexto está em `idle`, antes de enviar para N8N, o sistema verifica palavras-chave:

- "cancelar"
- "desmarcar"
- "cancelamento"
- "cancelar agendamento"
- "desmarcar agendamento"
- "não vou poder ir"
- "não vou conseguir ir"
- "quero cancelar"
- "preciso cancelar"
- "gostaria de cancelar"

Se detectado, o sistema:
1. Cria contexto `cancel_awaiting_email`
2. Solicita e-mail do cliente
3. **NÃO envia a mensagem para N8N**

## Benefícios

- **Continuidade**: Sistema "lembra" onde a conversa parou
- **Roteamento Inteligente**: Mensagens são direcionadas para handlers específicos
- **Isolamento**: Cada empresa e cliente tem seu próprio contexto
- **Expiração Automática**: Contextos expirados não bloqueiam novas conversas
- **Cancelamento Determinístico**: Fluxo previsível e confiável, sem dependência da IA para ações críticas
- **Segurança**: Ações destrutivas (cancelamento) são sempre executadas pelo backend

