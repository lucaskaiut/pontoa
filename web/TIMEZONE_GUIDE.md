# Guia de Timezone no Sistema PontoA

## Estratégia Geral

**Regra de Ouro:** O backend sempre trabalha em UTC, o frontend sempre trabalha no timezone do navegador do usuário.

## Backend (Laravel)

### Configuração
- O timezone está configurado em `config/app.php` como `'timezone' => 'UTC'`
- O Laravel automaticamente converte timestamps para UTC ao salvar no banco
- As datas retornadas pela API vêm em formato ISO 8601 com sufixo Z (ex: `2026-01-07T22:00:00.000000Z`)

### Models
- Use `protected $casts = ['date' => 'datetime']` nos models
- O Carbon trabalha automaticamente em UTC internamente

### API Resources
- Retorne datas no formato ISO 8601 padrão
- **Não faça conversão de timezone no backend** - deixe para o frontend

## Frontend (React)

### Utilitário Centralizado

Use o utilitário `web/src/utils/dateUtils.js` para todas as operações com datas.

#### Funções Principais

**Conversão de UTC para Local:**
```javascript
import { parseUTCDate } from '../utils/dateUtils';

const localDate = parseUTCDate('2026-01-07T22:00:00.000000Z');
// Retorna um moment object no timezone local
```

**Conversão de Local para UTC:**
```javascript
import { toUTCDate } from '../utils/dateUtils';

const utcString = toUTCDate(moment('2026-01-07 22:00:00'));
// Retorna string no formato: '2026-01-07T22:00:00.000000Z'
```

**Formatação:**
```javascript
import { formatDate, formatSchedulingDate, formatTime } from '../utils/dateUtils';

formatDate('2026-01-07T22:00:00.000000Z', 'DD/MM/YYYY HH:mm');
// Retorna: '07/01/2026 22:00'

formatSchedulingDate('2026-01-07T22:00:00.000000Z');
// Retorna: 'Hoje, 22:00' ou 'Amanhã, 22:00' ou 'Seg, 07/01 às 22:00'

formatTime('2026-01-07T22:00:00.000000Z');
// Retorna: '22:00'
```

**Comparações:**
```javascript
import { isAfter, isBefore, isSameOrAfter, isSameDay, diffMinutes } from '../utils/dateUtils';

isAfter(date1, date2);
isBefore(date1, date2);
isSameOrAfter(date1, date2);
isSameDay(date1, date2);
diffMinutes(date1, date2);
```

**Outras Utilidades:**
```javascript
import { now, startOfDay, endOfDay, sortDates } from '../utils/dateUtils';

const currentTime = now(); // moment no timezone local
const start = startOfDay(date); // início do dia
const end = endOfDay(date); // fim do dia
const sorted = sortDates(array, 'asc'); // ordena array de objetos com campo 'date'
```

### Padrão de Uso

#### ❌ NÃO FAÇA:
```javascript
// ❌ Não use moment.utc() diretamente
const date = moment.utc(apiResponse.date);

// ❌ Não remova o 'Z' manualmente
const dateString = apiResponse.date.replace('Z', '');

// ❌ Não compare datas sem converter para o mesmo timezone
const isFuture = moment(apiResponse.date).isAfter(moment());
```

#### ✅ FAÇA:
```javascript
// ✅ Use parseUTCDate para datas vindas do backend
import { parseUTCDate, isAfter, now } from '../utils/dateUtils';

const localDate = parseUTCDate(apiResponse.date);
const isFuture = isAfter(apiResponse.date, now().toISOString());

// ✅ Use toUTCDate antes de enviar para o backend
import { toUTCDate } from '../utils/dateUtils';

const payload = {
  date: toUTCDate(userSelectedDate)
};
await api.post('/schedulings', payload);

// ✅ Use as funções utilitárias para formatação
import { formatSchedulingDate } from '../utils/dateUtils';

<span>{formatSchedulingDate(scheduling.date)}</span>
```

### Services

Os services não precisam fazer conversão automática - apenas passam os dados como estão. A conversão deve ser feita nos componentes que usam os dados.

### Componentes

Sempre use as funções do `dateUtils.js` ao:
- Exibir datas vindas da API
- Comparar datas
- Enviar datas para a API
- Formatar datas para exibição

## Exemplo Completo

```javascript
import { 
  parseUTCDate, 
  toUTCDate, 
  formatSchedulingDate, 
  isSameOrAfter,
  now 
} from '../utils/dateUtils';

// Recebendo dados da API
const schedulings = await schedulingService.list();
const nextScheduling = schedulings.find(s => {
  const schedulingDate = parseUTCDate(s.date);
  const cutoffTime = now().subtract(30, 'minutes');
  return isSameOrAfter(s.date, cutoffTime.toISOString());
});

// Exibindo
<span>{formatSchedulingDate(nextScheduling.date)}</span>

// Enviando para API
const payload = {
  date: toUTCDate(userSelectedDateTime)
};
await schedulingService.create(payload);
```

## Migração de Código Existente

Ao encontrar código usando `moment()` ou `moment.utc()` diretamente:

1. **Datas vindas da API**: Substitua por `parseUTCDate()`
2. **Formatação**: Use `formatDate()`, `formatSchedulingDate()`, `formatTime()`
3. **Comparações**: Use `isAfter()`, `isBefore()`, `isSameOrAfter()`
4. **Envio para API**: Use `toUTCDate()` antes de enviar

## Perguntas Frequentes

**Q: Por que não converter no backend?**  
A: O frontend precisa trabalhar com o timezone do usuário para comparações e exibições. Se convertermos no backend, perderíamos essa flexibilidade.

**Q: E se o usuário estiver em outro país?**  
A: O sistema usa o timezone do navegador do usuário automaticamente. O JavaScript detecta isso e o moment.js usa para conversão.

**Q: Posso usar moment diretamente?**  
A: Evite. Use sempre as funções do `dateUtils.js` para garantir consistência.

**Q: E para timestamps de criação/atualização?**  
A: Use `formatDate()` normalmente. O padrão se aplica a todas as datas.

