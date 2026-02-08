# Documentação do Projeto

Bem-vindo à documentação do projeto Nox Scheduler.

## 📚 Documentos Disponíveis

### [Guia de Implementação de Módulos](./MODULE_IMPLEMENTATION.md)

Guia completo explicando como implementar um módulo seguindo o padrão arquitetural usado no projeto. Inclui:

- Estrutura de pastas
- Princípios da arquitetura
- Passo a passo detalhado
- Exemplos de código
- Tipos de campos do Form
- Checklist de implementação
- Boas práticas

**Use este guia quando precisar criar um novo módulo no sistema.**

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura baseada em:

- **TypeScript** - Tipagem forte em todo o código
- **React Query** - Gerenciamento de estado e cache
- **Separação de Responsabilidades** - Model, View e Container
- **Componentes Reutilizáveis** - Form genérico e outros componentes

## 📁 Estrutura de Pastas

```
src/
├── components/        # Componentes reutilizáveis
│   └── Form/         # Componente de formulário genérico
├── pages/            # Módulos da aplicação
│   └── Schedules/    # Exemplo de módulo completo
├── services/         # Serviços de API
└── ...
```

## 🚀 Início Rápido

Para criar um novo módulo:

1. Leia o [Guia de Implementação de Módulos](./MODULE_IMPLEMENTATION.md)
2. Siga o padrão do módulo `Schedules` como referência
3. Use o componente `Form` para criar formulários
4. Mantenha a separação entre Model, View e Container

## 📝 Convenções

- **Arquivos TypeScript**: `.ts` para lógica, `.tsx` para componentes
- **Nomenclatura**: PascalCase para componentes, camelCase para funções
- **Pastas**: camelCase para pastas de módulos
- **Exports**: Use named exports, não default exports

## 🔗 Links Úteis

- [React Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)

