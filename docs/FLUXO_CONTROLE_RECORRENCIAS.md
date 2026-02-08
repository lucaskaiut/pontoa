# Fluxo de Controle de Recorrências e Período Grátis

## Visão Geral

O sistema de recorrências do PontoA gerencia assinaturas de empresas com suporte a períodos grátis (trial), cobranças automáticas e controle de estados de assinatura. O fluxo é executado através de um comando agendado que verifica e processa as cobranças periodicamente.

## Componentes Principais

### Serviços
- **CompanyService**: Gerencia empresas e suas assinaturas
- **PlanService**: Gerencia planos e cálculos relacionados
- **PaymentService**: Processa pagamentos
- **RegisterService**: Processa registro inicial de empresas

### Comando Agendado
- **CheckCompanySubscription**: Comando que executa a verificação e cobrança periódica

### Enums
- **SubscriptionStatus**: Estados da assinatura (ACTIVE, CANCELED, EXPIRED, SUSPENDED)
- **RecurrenceType**: Tipos de recorrência (MONTHLY, YEARLY)
- **PlanType**: Tipos de plano (BASIC, PRO)

## Campos da Tabela Companies

### Campos de Plano
- `plan_name`: Tipo do plano (basic, pro)
- `plan_recurrence`: Recorrência (monthly, yearly)
- `plan_price`: Preço do plano
- `plan_started_at`: Data de início do plano
- `plan_trial_ends_at`: Data de término do período grátis

### Campos de Assinatura
- `subscription_status`: Status da assinatura
- `current_period_start`: Início do período atual
- `current_period_end`: Fim do período atual
- `cancel_at_period_end`: Flag de cancelamento agendado
- `canceled_at`: Data do cancelamento
- `last_billed_at`: Data da última cobrança
- `is_free`: Flag indicando se está em período grátis
- `card_id`: ID do cartão de crédito cadastrado

## Fluxo de Inicialização do Período Grátis

### 1. Registro de Nova Empresa

Quando uma empresa é registrada através do `RegisterService`, o sistema:

1. Processa os dados do plano através do método `processPlanData()`
2. Calcula a data de término do período grátis baseado na recorrência:
   - **Monthly**: 7 dias grátis
   - **Yearly**: 30 dias grátis
3. Define os campos iniciais:
   ```php
   plan_trial_ends_at = data_atual + dias_grátis
   current_period_end = plan_trial_ends_at + dias_cobrança
   is_free = true
   subscription_status = ACTIVE
   ```

### 2. Criação de Empresa sem Plano

Quando uma empresa é criada sem `plan_started_at`, o sistema automaticamente define:
- `is_free = true`

## Verificação do Período Grátis

### Método: `PlanService::isInTrialPeriod()`

O sistema verifica se uma empresa está em período grátis através da seguinte lógica:

1. **Se já foi cobrado** (`last_billed_at` existe):
   - Retorna `false` (não está mais em período grátis)

2. **Se possui `plan_trial_ends_at`**:
   - Verifica se a data atual é anterior a `plan_trial_ends_at`
   - Retorna `true` se ainda está dentro do período

3. **Se possui `current_period_end`** (fallback):
   - Verifica se a data atual é anterior a `current_period_end`
   - Retorna `true` se ainda está dentro do período

4. **Caso contrário**:
   - Retorna `false`

## Fluxo de Cobrança Automática

### Comando: `CheckCompanySubscription`

O comando é executado periodicamente (via agendador) e segue este fluxo:

#### 1. Expiração de Assinaturas
```php
$service->expireSubscriptions();
```

Este método verifica e expira assinaturas de duas categorias:

**a) Assinaturas com cancelamento agendado:**
- Busca empresas com `cancel_at_period_end = true`
- Verifica se `current_period_end` já passou
- Atualiza `subscription_status = EXPIRED`

**b) Assinaturas sem cartão após período:**
- Busca empresas com `card_id = null`
- Verifica se `current_period_end` já passou
- Verifica se `is_free = false` e `subscription_status = ACTIVE`
- Atualiza `subscription_status = EXPIRED`

#### 2. Verificação de Empresas Elegíveis

O comando busca todas as empresas ativas:
```php
$companies = $service->findBy(['active' => 1]);
```

#### 3. Filtro de Empresas Cobráveis

Para cada empresa, verifica se é elegível para cobrança através de `isCompanyBillable()`:

**Critérios:**
- Deve possuir `card_id` (cartão cadastrado)
- Deve estar `active = 1`
- Deve possuir `plan_name`
- Deve possuir `plan_recurrence`

#### 4. Verificação de Necessidade de Cobrança

Para empresas elegíveis, executa `verifyIfShouldBill()`:

**Condições que impedem cobrança:**
- `cancel_at_period_end = true` (cancelamento agendado)
- Empresa está em período grátis (`isInTrialPeriod()`)
- Não possui `plan_name` ou `plan_recurrence`
- Plano não encontrado

**Condições que permitem cobrança:**

**a) Se possui `current_period_end`:**
- Verifica se `current_period_end <= hoje`
- Se sim, deve cobrar

**b) Se não possui `current_period_end` mas possui `last_billed_at`:**
- Calcula próxima data de cobrança:
  - Monthly: `last_billed_at + 30 dias`
  - Yearly: `last_billed_at + 365 dias`
- Verifica se próxima data <= hoje
- Se sim, deve cobrar

#### 5. Processamento da Cobrança

Se a empresa deve ser cobrada:

1. **Registra a empresa no contexto:**
   ```php
   app('company')->registerCompany($company);
   ```

2. **Executa a cobrança:**
   ```php
   $service->billCompany($company);
   ```
   
   Este método:
   - Busca o plano através de `PlanService`
   - Processa o pagamento via `PaymentService`
   - Cria registro em `company_recurrencies` com:
     - `amount`: Valor cobrado
     - `payment_method`: Fonte do cartão
     - `plan`: Tipo de recorrência
     - `billed_at`: Data da cobrança
     - `external_id`: ID do pedido no gateway

3. **Atualiza dados da empresa:**
   ```php
   $service->updateLastBilledAtAndSetNonFree($company);
   ```
   
   Este método:
   - Define `last_billed_at = agora`
   - Define `is_free = false`
   - Define `subscription_status = ACTIVE`
   - Define `current_period_start = agora`
   - Calcula `current_period_end = agora + dias_cobrança`
     - Monthly: +30 dias
     - Yearly: +365 dias

## Cálculo de Dias Restantes

### Método: `PlanService::calculateRemainingDays()`

Calcula os dias restantes do plano atual:

1. **Se está em período grátis:**
   - Se possui `plan_trial_ends_at`: retorna dias até essa data
   - Se possui `current_period_end`: retorna dias até essa data
   - Caso contrário: retorna 0

2. **Se não está em período grátis:**
   - Se não possui `last_billed_at`:
     - Se possui `current_period_end`: retorna dias até essa data
     - Caso contrário: retorna 0
   - Se possui `last_billed_at`:
     - Calcula próxima data de cobrança baseada na recorrência
     - Retorna dias até a próxima cobrança

## Alteração de Plano

### Método: `CompanyService::changePlan()`

Quando uma empresa altera seu plano:

1. **Validações:**
   - Não permite alteração se `cancel_at_period_end = true`
   - Verifica se o novo plano existe

2. **Atualização de cartão (se fornecido):**
   - Cria novo token de pagamento
   - Atualiza `card_id` da empresa

3. **Cálculo de desconto proporcional:**
   - Calcula dias restantes do plano atual
   - Calcula desconto proporcional baseado nos dias restantes
   - Valor final = preço novo plano - desconto proporcional

4. **Cobrança (se possui cartão):**
   - Processa pagamento do valor final
   - Cria registro em `company_recurrencies`

5. **Atualização dos campos:**
   - Atualiza `plan_name`, `plan_recurrence`, `plan_price`
   - Define `plan_trial_ends_at = null` (remove período grátis)
   - Define `current_period_start = agora`
   - Calcula `current_period_end = agora + dias_cobrança`
   - Se possui cartão: `is_free = false`, `last_billed_at = agora`
   - Se não possui cartão: `is_free = true`

## Cancelamento de Assinatura

### Método: `CompanyService::cancelSubscription()`

1. **Validações:**
   - Empresa deve possuir `plan_name` e `plan_recurrence`
   - Não pode estar já com cancelamento agendado

2. **Atualização:**
   - Define `cancel_at_period_end = true`
   - Define `canceled_at = agora`
   - Define `subscription_status = CANCELED`
   - Mantém `current_period_start` e `current_period_end` inalterados

**Comportamento:**
- A empresa continua com acesso até `current_period_end`
- Após essa data, a assinatura será expirada pelo comando agendado
- Não haverá novas cobranças

## Reativação de Assinatura

### Método: `CompanyService::reactivateSubscription()`

1. **Validações:**
   - Deve estar com `cancel_at_period_end = true`

2. **Atualização:**
   - Define `cancel_at_period_end = false`
   - Define `canceled_at = null`
   - Define `subscription_status = ACTIVE`
   - Recalcula `current_period_end` baseado na recorrência

**Comportamento:**
- Remove o cancelamento agendado
- A empresa volta a ser cobrada normalmente no próximo ciclo

## Atualização Manual do Período Grátis

### Endpoint: `CompanyController::updateFreePeriod()`

Permite que superadmins atualizem manualmente o período grátis de uma empresa.

**Validações:**
- Usuário deve ser `superadmin`
- Empresa deve ser filha ou própria empresa do superadmin
- Se `is_free = true`, `current_period_end` é obrigatório

**Atualização:**
- Atualiza `is_free` e `current_period_end` conforme fornecido

## Estados da Assinatura

### ACTIVE
- Assinatura ativa e funcionando
- Pode estar em período grátis ou pago
- Será cobrada no próximo ciclo (se não estiver em período grátis)

### CANCELED
- Cancelamento agendado para o fim do período
- Ainda tem acesso até `current_period_end`
- Não será mais cobrada após o período atual

### EXPIRED
- Período atual expirou
- Não tem mais acesso
- Pode ser reativada alterando o plano ou reativando

### SUSPENDED
- Assinatura suspensa (não implementado no fluxo atual)
- Sem acesso

## Fluxograma de Decisão de Cobrança

```
Início do Comando
    ↓
Expirar Assinaturas Vencidas
    ↓
Buscar Empresas Ativas
    ↓
Para cada empresa:
    ↓
Possui card_id, plan_name, plan_recurrence?
    ├─ Não → Próxima empresa
    └─ Sim → Continuar
        ↓
Está com cancel_at_period_end = true?
    ├─ Sim → Próxima empresa
    └─ Não → Continuar
        ↓
Está em período grátis?
    ├─ Sim → Próxima empresa
    └─ Não → Continuar
        ↓
current_period_end <= hoje OU
próxima cobrança <= hoje?
    ├─ Não → Próxima empresa
    └─ Sim → Cobrar
        ↓
Processar Pagamento
    ↓
Criar Registro de Recorrência
    ↓
Atualizar last_billed_at, is_free, current_period_end
    ↓
Próxima empresa
```

## Tabela de Recorrências

A tabela `company_recurrencies` armazena o histórico de todas as cobranças:

- `company_id`: ID da empresa
- `amount`: Valor cobrado
- `payment_method`: Método de pagamento
- `plan`: Tipo de recorrência (monthly/yearly)
- `billed_at`: Data da cobrança
- `external_id`: ID do pedido no gateway de pagamento

## Considerações Importantes

1. **Período Grátis:**
   - Só é válido se `last_billed_at` for `null`
   - Uma vez cobrado, não há mais período grátis
   - Pode ser estendido manualmente por superadmin

2. **Cálculo de Próxima Cobrança:**
   - Prioriza `current_period_end` se existir
   - Caso contrário, calcula baseado em `last_billed_at + dias_cobrança`

3. **Cancelamento:**
   - Não cancela imediatamente
   - Permite uso até o fim do período pago
   - Pode ser revertido através da reativação

4. **Expiração:**
   - Ocorre automaticamente quando `current_period_end` passa
   - Empresas sem cartão após período grátis também expiram
   - Empresas com cancelamento agendado expiram ao fim do período

5. **Alteração de Plano:**
   - Remove período grátis (`plan_trial_ends_at = null`)
   - Calcula desconto proporcional
   - Cobra imediatamente se possui cartão

