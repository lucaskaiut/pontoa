# Guia de Debug - Erro React #130

## Como debugar localmente

### 1. Build de Debug (não minificado)

Execute o build em modo debug para ver mensagens de erro detalhadas:

```bash
npm run build:debug
npm run preview:debug
```

Ou apenas:

```bash
npm run preview:debug
```

Isso criará um build não minificado que mostrará mensagens de erro mais detalhadas no console.

### 2. Modo Desenvolvimento

Para desenvolvimento com hot-reload:

```bash
npm run dev
```

### 3. Verificar o Console do Navegador

Abra o DevTools (F12) e verifique:

1. **Console Tab**: Procure por erros com stack traces completos
2. **Network Tab**: Verifique se todos os arquivos estão carregando corretamente
3. **Sources Tab**: Você poderá ver o código fonte não minificado e colocar breakpoints

### 4. Error Boundary

O Error Boundary foi adicionado e capturará erros do React. Se um erro ocorrer, você verá:

- Uma mensagem de erro vermelha na tela
- Detalhes do erro que podem ser expandidos
- Stack trace completo
- Component stack mostrando onde o erro ocorreu

### 5. Logs Adicionados

Os seguintes logs foram adicionados para ajudar a identificar o problema:

- `🚀 App component rendering...` - Quando o App renderiza
- `🔍 Router render:` - Estado do Router
- `🔐 AuthContext render:` - Estado do contexto de autenticação
- `🔥 GLOBAL ERROR:` - Erros globais capturados

### 6. O que procurar

O erro #130 geralmente indica que um **objeto** está sendo renderizado diretamente no JSX. Procure por:

1. **No console**: Mensagens que mencionam "object" ou "undefined"
2. **No Error Boundary**: O stack trace mostrará qual componente está causando o problema
3. **Nos logs**: Verifique se algum componente está recebendo `undefined` ou um objeto como children

### 7. Verificações comuns

- Verifique se `user` ou `company` são `null` ou `undefined` antes de acessar propriedades
- Verifique se componentes estão sendo importados corretamente
- Verifique se props estão sendo passadas corretamente

### 8. Testar localmente antes de fazer deploy

Sempre teste com `npm run build:debug` antes de fazer deploy para produção!

