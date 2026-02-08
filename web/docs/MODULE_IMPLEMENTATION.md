# Guia de Implementação de Módulos

Este documento explica como implementar um módulo completo seguindo o padrão arquitetural usado no módulo `Schedules`.

## 📁 Estrutura de Pastas

Cada módulo deve seguir esta estrutura:

```
src/pages/SeuModulo/
├── types.ts                    # Tipos TypeScript compartilhados
├── handler/                    # Lógica de formulário (criar/editar)
│   ├── index.tsx              # Container que conecta model à view
│   ├── seuModuloHandlerModel.ts  # Hook com toda a lógica
│   └── SeuModuloForm.tsx      # Componente de view (apenas renderização)
├── list/                      # Lógica de listagem
│   ├── index.tsx              # Container que conecta model à view
│   ├── seuModuloListModel.ts  # Hook com toda a lógica
│   └── SeuModuloList.tsx      # Componente de view (apenas renderização)
└── index.tsx                   # Exportações principais
```

## 🎯 Princípios da Arquitetura

1. **Separação de Responsabilidades**
   - **Model**: Contém toda a lógica (queries, mutations, handlers)
   - **View**: Apenas renderização, recebe tudo via props
   - **Container**: Conecta model à view

2. **TypeScript com Tipagem Forte**
   - Todos os arquivos devem ser `.ts` ou `.tsx`
   - Tipos explícitos em todas as funções e interfaces
   - Tipos compartilhados no arquivo `types.ts`

3. **Reutilização do Componente Form**
   - Use o componente `Form` genérico para formulários
   - Configure os campos através do array `fields`

## 📝 Passo a Passo

### 1. Criar os Tipos (`types.ts`)

Defina todas as interfaces e tipos que serão usados no módulo:

```typescript
import { FormFieldConfig } from "../../components/Form/types";

// Entidade principal
export interface SeuModulo {
  id?: string | number;
  nome: string;
  descricao?: string;
  created_at?: string;
}

// Valores do formulário
export interface SeuModuloFormValues {
  nome: string;
  descricao: string;
}

// Payload para API
export interface SeuModuloPayload {
  nome: string;
  descricao: string;
}

// Tipo para campos do formulário
export type SeuModuloFormField = FormFieldConfig;
```

### 2. Criar o Model do Handler (`handler/seuModuloHandlerModel.ts`)

Este arquivo contém toda a lógica do formulário:

```typescript
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { seuModuloService } from "../../../services/seuModuloService";
import toast from "react-hot-toast";
import { 
  SeuModulo, 
  SeuModuloFormValues, 
  SeuModuloPayload, 
  SeuModuloFormField 
} from "../types";

const defaultValues: SeuModuloFormValues = {
  nome: "",
  descricao: "",
};

interface UseSeuModuloHandlerReturn {
  values: SeuModuloFormValues;
  fields: SeuModuloFormField[];
  isEditing: boolean;
  isLoadingModulo: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof SeuModuloFormValues, value: any) => void;
  deleteModulo: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function useSeuModuloHandler(): UseSeuModuloHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<SeuModuloFormValues>(defaultValues);

  // Query para buscar dados existentes (apenas em edição)
  const { data: existingModulo, isLoading: isLoadingModulo } = useQuery<SeuModulo>({
    queryKey: ["seuModulo", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await seuModuloService.get(id);
      return result as SeuModulo;
    },
    enabled: isEditing && !!id,
  });

  // Effect para preencher formulário quando dados existentes são carregados
  useEffect(() => {
    if (existingModulo) {
      setValues({
        nome: existingModulo.nome || "",
        descricao: existingModulo.descricao || "",
      });
    }
  }, [existingModulo]);

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (payload: SeuModuloPayload) => {
      return await seuModuloService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seuModulos"] });
      toast.success("Item criado com sucesso!");
      navigate("/seu-modulo");
    },
    onError: () => {
      toast.error("Erro ao criar item. Tente novamente.");
    },
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: SeuModuloPayload }) => {
      return await seuModuloService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seuModulos"] });
      toast.success("Item atualizado com sucesso!");
      navigate("/seu-modulo");
    },
    onError: () => {
      toast.error("Erro ao atualizar item. Tente novamente.");
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (moduloId: string) => {
      return await seuModuloService.delete(moduloId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seuModulos"] });
      toast.success("Item apagado com sucesso!");
      navigate("/seu-modulo");
    },
    onError: () => {
      toast.error("Erro ao apagar item. Tente novamente.");
    },
  });

  // Handler para atualizar valores do formulário
  const setFieldValue = useCallback((field: keyof SeuModuloFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handler para deletar
  const deleteModulo = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja apagar este item?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  // Handler para submeter formulário
  const handleSubmit = async (): Promise<void> => {
    const payload: SeuModuloPayload = {
      nome: values.nome,
      descricao: values.descricao,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Handler para voltar
  const handleBack = (): void => {
    navigate("/seu-modulo");
  };

  // Configuração dos campos do formulário
  const fields: SeuModuloFormField[] = [
    { 
      name: "nome", 
      type: "text", 
      label: "Nome",
      placeholder: "Digite o nome",
      required: true,
    },
    { 
      name: "descricao", 
      type: "textarea", 
      label: "Descrição",
      placeholder: "Digite a descrição",
      colSpan: "full",
    },
  ];

  return {
    values,
    fields,
    isEditing,
    isLoadingModulo: isLoadingModulo || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    setFieldValue,
    deleteModulo,
    handleSubmit,
    handleBack,
  };
}
```

### 3. Criar a View do Handler (`handler/SeuModuloForm.tsx`)

Componente que apenas renderiza, recebendo tudo via props:

```typescript
import React from "react";
import { Oval } from 'react-loader-spinner';
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { Form } from "../../../components/Form";
import { SeuModuloFormValues, SeuModuloFormField } from "../types";

interface SeuModuloFormProps {
  values: SeuModuloFormValues;
  fields: SeuModuloFormField[];
  isEditing: boolean;
  isLoadingModulo: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof SeuModuloFormValues, value: any) => void;
  deleteModulo: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function SeuModuloForm({
  values,
  fields,
  isEditing,
  isLoadingModulo,
  isSaving,
  isDeleting,
  setFieldValue,
  deleteModulo,
  handleSubmit,
  handleBack,
}: SeuModuloFormProps) {
  // Loading state
  if (isEditing && isLoadingModulo) {
    return (
      <div className="overflow-auto h-full w-full">
        <div className="flex justify-center items-center h-full">
          <Oval
            height={40}
            width={40}
            color="#7b2cbf"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#7b2cbf"
            strokeWidth={4}
            strokeWidthSecondary={4}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full w-full pb-24 md:pb-0">
      {/* Header com botão voltar */}
      <div className="flex items-center mt-4 md:mt-8 ml-4 md:ml-10 gap-4">
        <button 
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-gray-200 transition-all"
        >
          <Icon path={mdiArrowLeft} size={1.2} className="text-navy-900" />
        </button>
        <h1 className="text-2xl md:text-4xl text-navy-900 font-bold">
          {isEditing ? 'Editar item' : 'Criar item'}
        </h1>
      </div>
      
      {/* Formulário */}
      <div className="bg-white m-4 md:m-10 rounded-2xl">
        <div className="px-4 md:px-10 py-6 md:py-10">
          <Form
            fields={fields}
            values={values}
            onChange={setFieldValue}
            onSubmit={handleSubmit}
            isSubmitting={isSaving}
            submitLabel="Salvar"
            submittingLabel="Salvando..."
            gridCols={3}
          />
        </div>
      </div>
    </div>
  );
}
```

### 4. Criar o Container do Handler (`handler/index.tsx`)

Conecta o model à view:

```typescript
import React from "react";
import { SeuModuloForm } from "./SeuModuloForm";
import { useSeuModuloHandler } from "./seuModuloHandlerModel";

export function SeuModuloHandler() {
  const {
    values,
    fields,
    isEditing,
    isLoadingModulo,
    isSaving,
    isDeleting,
    setFieldValue,
    deleteModulo,
    handleSubmit,
    handleBack,
  } = useSeuModuloHandler();

  return (
    <SeuModuloForm
      values={values}
      fields={fields}
      isEditing={isEditing}
      isLoadingModulo={isLoadingModulo}
      isSaving={isSaving}
      isDeleting={isDeleting}
      setFieldValue={setFieldValue}
      deleteModulo={deleteModulo}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
    />
  );
}
```

### 5. Criar o Model da Lista (`list/seuModuloListModel.ts`)

Lógica para listagem:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { seuModuloService } from "../../../services/seuModuloService";
import toast from "react-hot-toast";
import { SeuModulo } from "../types";

interface UseSeuModuloListReturn {
  modulos: SeuModulo[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (modulo: SeuModulo) => void;
  handleDelete: (modulo: SeuModulo) => void;
}

export function useSeuModuloList(): UseSeuModuloListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: modulos = [], isLoading } = useQuery<SeuModulo[]>({
    queryKey: ["seuModulos"],
    queryFn: async () => {
      const result = await seuModuloService.list();
      return (result || []) as SeuModulo[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await seuModuloService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seuModulos"] });
      toast.success("Item apagado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao apagar item. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/seu-modulo/criar");
  };

  const handleEditClick = (modulo: SeuModulo): void => {
    if (!modulo.id) return;
    navigate(`/seu-modulo/${modulo.id}/editar`);
  };

  const handleDelete = (modulo: SeuModulo): void => {
    if (!modulo.id) return;
    if (confirm(`Tem certeza que deseja excluir este item?`)) {
      deleteMutation.mutate(modulo.id);
    }
  };

  return {
    modulos,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
  };
}
```

### 6. Criar a View da Lista (`list/SeuModuloList.tsx`)

```typescript
import React from "react";
import moment from "moment";
import { Oval } from 'react-loader-spinner';
import { SwipeableListItem } from "../../../components/SwipeableListItem";
import { SeuModulo } from "../types";

interface SeuModuloListProps {
  modulos: SeuModulo[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (modulo: SeuModulo) => void;
  handleDelete: (modulo: SeuModulo) => void;
}

export function SeuModuloList({
  modulos,
  isLoading,
  handleCreateClick,
  handleEditClick,
  handleDelete,
}: SeuModuloListProps) {
  return (
    <div className="overflow-auto h-full w-full">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 font-bold">
        Seu Módulo
      </h1>
      <div className="bg-white m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10">
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleCreateClick} 
            className="bg-primary px-6 py-2 rounded-lg text-white brightness-150 hover:brightness-100 transition-all"
          >
            Novo
          </button>
        </div>
        
        {/* Cabeçalho da tabela (desktop) */}
        <div className="hidden md:grid grid-cols-3 grid-rows-1 text-gray-400 font-bold border-b pb-5 border-gray p-4">
          <div>Nome</div>
          <div>Descrição</div>
          <div>Cadastro</div>
        </div>
        
        {/* Loading */}
        <div className="flex justify-center">
          <Oval
            height={40}
            width={40}
            color="#7b2cbf"
            wrapperStyle={{}}
            wrapperClass=""
            visible={isLoading}
            ariaLabel="oval-loading"
            secondaryColor="#7b2cbf"
            strokeWidth={4}
            strokeWidthSecondary={4}
          />
        </div>
        
        {/* Lista de itens */}
        {modulos.map((modulo, index) => (
          <SwipeableListItem
            key={modulo.id}
            onDelete={() => handleDelete(modulo)}
            showHint={index === 0}
            className="flex flex-col md:grid md:grid-cols-3 md:grid-rows-1 py-4 md:py-5 text-gray-500 cursor-pointer hover:bg-gray-100 p-4 transition-all rounded-lg border md:border-0 border-gray-200 gap-2 md:gap-0 bg-white"
          >
            <div
              onClick={() => handleEditClick(modulo)}
              className="contents"
            >
              <div className="flex md:block">
                <span className="font-bold text-gray-400 md:hidden mr-2">Nome:</span>
                <p>{modulo.nome}</p>
              </div>
              <div className="flex md:block">
                <span className="font-bold text-gray-400 md:hidden mr-2">Descrição:</span>
                <p>{modulo.descricao || '-'}</p>
              </div>
              <div className="flex md:block">
                <span className="font-bold text-gray-400 md:hidden mr-2">Cadastro:</span>
                <p>{modulo.created_at ? moment(modulo.created_at).format('DD/MM/YYYY') : '-'}</p>
              </div>
            </div>
          </SwipeableListItem>
        ))}
      </div>
    </div>
  );
}
```

### 7. Criar o Container da Lista (`list/index.tsx`)

```typescript
import React from "react";
import { SeuModuloList } from "./SeuModuloList";
import { useSeuModuloList } from "./seuModuloListModel";

export function SeuModuloListContainer() {
  const {
    modulos,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
  } = useSeuModuloList();

  return (
    <SeuModuloList
      modulos={modulos}
      isLoading={isLoading}
      handleCreateClick={handleCreateClick}
      handleEditClick={handleEditClick}
      handleDelete={handleDelete}
    />
  );
}
```

### 8. Criar o Index Principal (`index.tsx`)

```typescript
export { SeuModuloListContainer as SeuModuloList } from "./list";
export { SeuModuloHandler as SeuModuloForm } from "./handler";
```

### 9. Configurar as Rotas (`AppRoutes.tsx`)

```typescript
import { SeuModuloList, SeuModuloForm } from "./pages/SeuModulo";

// Dentro do componente de rotas:
<Route path="/seu-modulo" element={<SeuModuloList />} />
<Route path="/seu-modulo/criar" element={<SeuModuloForm />} />
<Route path="/seu-modulo/:id/editar" element={<SeuModuloForm />} />
```

## 🎨 Tipos de Campos do Form

O componente `Form` suporta os seguintes tipos de campo:

- `text` - Input de texto
- `email` - Input de email
- `password` - Input de senha
- `time` - Input de hora
- `date` - Input de data
- `number` - Input numérico
- `select` - Dropdown com opções
- `multiselect` - Seleção múltipla
- `toggle-group` - Cards clicáveis
- `textarea` - Área de texto
- `checkbox` - Caixa de seleção

### Exemplo de Configuração de Campos

```typescript
const fields: SeuModuloFormField[] = [
  { 
    name: "nome", 
    type: "text", 
    label: "Nome",
    placeholder: "Digite o nome",
    required: true,
  },
  { 
    name: "email", 
    type: "email", 
    label: "E-mail",
    placeholder: "Digite o e-mail",
    required: true,
  },
  { 
    name: "categoria", 
    type: "select", 
    label: "Categoria",
    options: [
      { value: "1", label: "Categoria 1" },
      { value: "2", label: "Categoria 2" },
    ],
  },
  { 
    name: "tags", 
    type: "multiselect", 
    label: "Tags",
    options: tags,
    displayValue: "name",
    colSpan: 2,
  },
  { 
    name: "dias", 
    type: "toggle-group", 
    label: "Dias da Semana",
    options: days,
    displayValue: "name",
    colSpan: "full",
  },
];
```

## ✅ Checklist de Implementação

- [ ] Criar pasta do módulo em `src/pages/`
- [ ] Criar `types.ts` com todas as interfaces
- [ ] Criar `handler/seuModuloHandlerModel.ts` com a lógica
- [ ] Criar `handler/SeuModuloForm.tsx` com a view
- [ ] Criar `handler/index.tsx` como container
- [ ] Criar `list/seuModuloListModel.ts` com a lógica
- [ ] Criar `list/SeuModuloList.tsx` com a view
- [ ] Criar `list/index.tsx` como container
- [ ] Criar `index.tsx` com as exportações
- [ ] Configurar rotas em `AppRoutes.tsx`
- [ ] Criar service em `src/services/`
- [ ] Testar criação de item
- [ ] Testar edição de item
- [ ] Testar exclusão de item
- [ ] Verificar responsividade

## 🔍 Boas Práticas

1. **Sempre use TypeScript** - Tipagem forte em todos os arquivos
2. **Importe React explicitamente** - Arquivos `.tsx` que usam JSX devem ter `import React from "react";` no topo
3. **Separe lógica da view** - Model contém lógica, View apenas renderiza
4. **Use o componente Form** - Não crie formulários do zero
5. **Trate erros** - Use toast para feedback ao usuário
6. **Loading states** - Sempre mostre loading durante operações
7. **Validação** - Use o hook `useForm` para validação quando necessário
8. **Nomenclatura** - Use nomes descritivos e consistentes
9. **Comentários** - Comente código complexo, mas evite comentários óbvios

## ⚠️ Importante: Import do React

**Todos os arquivos `.tsx` que usam JSX devem importar React explicitamente:**

```typescript
import React from "react";
```

Isso é necessário porque o esbuild exige o import explícito do React quando JSX é usado. Sem o import, você receberá o erro:
```
'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
```

**Arquivos que precisam do import:**
- `handler/SeuModuloForm.tsx`
- `handler/index.tsx`
- `list/SeuModuloList.tsx`
- `list/index.tsx`
- `handler/seuModuloHandlerModel.tsx` (se usar JSX no render de campos)

## 📚 Referências

- Módulo de exemplo: `src/pages/Schedules/`
- Componente Form: `src/components/Form/`
- Tipos do Form: `src/components/Form/types.ts`

