# Etapa 1: build
FROM node:18-alpine AS builder

# Cria o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência
COPY package.json yarn.lock ./

# Instala as dependências
RUN yarn install

# Copia o restante da aplicação
COPY . .

# Gera o build de produção
RUN yarn build

# Etapa 2: execução
FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos necessários para rodar a aplicação
COPY --from=builder /app/.next .next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# Instala apenas as dependências de produção
RUN yarn install --production

# Expõe a porta da aplicação
EXPOSE 3000

# Inicia a aplicação
CMD ["yarn", "start"]

