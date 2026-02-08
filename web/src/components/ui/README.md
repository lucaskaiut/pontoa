# Sistema de Design - PontoA

Sistema de design moderno e escalável baseado em Design Atômico, utilizando Tailwind CSS.

## Estrutura

```
ui/
├── atoms/          # Componentes básicos e indivisíveis
├── molecules/      # Combinações de átomos
├── organisms/      # Componentes complexos
└── README.md       # Esta documentação
```

## Tokens de Design

### Cores

- **Primary**: `#9333ea` (roxo/violeta)
- **Success**: `#10b981` (verde)
- **Warning**: `#f59e0b` (amarelo)
- **Danger**: `#dc2626` (vermelho)

### Espaçamentos

Espaçamentos padrão do Tailwind CSS com adição de:
- `18`: 4.5rem
- `88`: 22rem
- `128`: 32rem

### Tipografia

Fonte padrão: Inter (system-ui fallback)

Tamanhos:
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)

## Componentes Atômicos

### Button

Botão com múltiplas variantes e tamanhos.

```jsx
import { Button } from '../components/ui';

<Button variant="primary" size="md">Clique aqui</Button>
```

**Variantes**: `primary`, `secondary`, `outline-solid`, `ghost`, `danger`, `success`
**Tamanhos**: `xs`, `sm`, `md`, `lg`, `xl`

### Badge

Badge para status e labels.

```jsx
import { Badge } from '../components/ui';

<Badge variant="success" size="md">Ativo</Badge>
```

**Variantes**: `default`, `primary`, `success`, `warning`, `danger`, `info`
**Tamanhos**: `xs`, `sm`, `md`, `lg`

### Card

Container com padding, shadow e borda configuráveis.

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui';

<Card padding="md" hover>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>
```

**Props**: `padding` (none, sm, md, lg), `shadow` (boolean), `border` (boolean), `hover` (boolean)

### Input

Campo de entrada de texto.

```jsx
import { Input } from '../components/ui';

<Input 
  label="Nome"
  placeholder="Digite seu nome"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  required
/>
```

### Textarea

Campo de texto multilinha.

```jsx
import { Textarea } from '../components/ui';

<Textarea 
  label="Descrição"
  rows={4}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Select

Campo de seleção.

```jsx
import { Select } from '../components/ui';

<Select
  label="Opção"
  options={[
    { value: '1', label: 'Opção 1' },
    { value: '2', label: 'Opção 2' }
  ]}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Avatar

Avatar com imagem ou iniciais.

```jsx
import { Avatar } from '../components/ui';

<Avatar src={user.avatar} name={user.name} size="md" />
```

**Tamanhos**: `xs`, `sm`, `md`, `lg`, `xl`

### Icon

Wrapper para ícones MDI.

```jsx
import { Icon } from '../components/ui';
import { mdiAccount } from '@mdi/js';

<Icon path={mdiAccount} size={1.2} />
```

### Loading

Spinner de carregamento.

```jsx
import { Loading, LoadingSpinner } from '../components/ui';

<LoadingSpinner />
// ou
<Loading size="md" color="primary" />
```

## Componentes Moleculares

### FormField

Campo de formulário completo com suporte a múltiplos tipos.

```jsx
import { FormField } from '../components/ui';

<FormField
  field={{
    name: 'email',
    type: 'email',
    label: 'E-mail',
    placeholder: 'Digite seu e-mail',
    required: true
  }}
  value={value}
  onChange={(name, value) => setValue(value)}
  error={error}
/>
```

### EmptyState

Estado vazio com ícone, título, descrição e ação opcional.

```jsx
import { EmptyState } from '../components/ui';

<EmptyState
  icon={<Icon path={mdiAccount} />}
  title="Nenhum item encontrado"
  description="Comece adicionando seu primeiro item"
  action={<Button>Adicionar</Button>}
/>
```

## Componentes Organismos

### Sidebar

Sidebar principal de navegação.

```jsx
import { Sidebar } from '../components/ui';

<Sidebar />
```

### Header

Header da aplicação.

```jsx
import { Header } from '../components/ui';

<Header />
```

## Uso

```jsx
import { Button, Card, CardHeader, CardTitle, CardContent } from './components/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="primary">Ação</Button>
      </CardContent>
    </Card>
  );
}
```

## Dark Mode

Todos os componentes suportam dark mode automaticamente através das classes do Tailwind CSS (`dark:`).

## Contribuindo

Ao criar novos componentes:
1. Mantenha a estrutura de design atômico
2. Use tokens de design (cores, espaçamentos) do Tailwind config
3. Suporte dark mode
4. Documente props e exemplos de uso
5. Siga os padrões de nomenclatura existentes

