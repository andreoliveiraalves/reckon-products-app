## 🚀 Deploy

O frontend está alojado em **Netlify** e pode ser acedido aqui:

🔗 [https://reckon-products.netlify.app](https://reckon-products.netlify.app)

O backend está alojado em **Render** e pode ser acedido aqui:

🔗 [https://reckon-products-app.onrender.com](https://reckon-products-app.onrender.com)  
📘 Documentação Swagger: [https://reckon-products-app.onrender.com/api-docs](https://reckon-products-app.onrender.com/api-docs)  
⏰ Cron job para manter a API online: [https://uptimerobot.com/](https://uptimerobot.com/)

---

# 🎨 Reckon Products App - Frontend

Este repositório contém o **frontend** da aplicação Reckon Products, desenvolvido com **Vue 3 + Vite**, utilizando componentes reutilizáveis, autenticação JWT e integração com a API backend.

---

## 📋 Pré-requisitos

- Node.js >= 18
- npm ou yarn
- Backend da aplicação Reckon Products em execução (URL padrão: `https://reckon-products-app.onrender.com`)

---

## ⚙️ Instalação e Execução

### 1️⃣ Instalar dependências

```bash
npm install
# ou
yarn
```

### 2️⃣ Executar a aplicação em modo desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em `http://localhost:5173` por padrão.

---

## 🏗️ Estrutura do Projeto

```
src/
│
├─ assets/          # Imagens, ícones e arquivos estáticos
├─ components/      # Componentes reutilizáveis (FormModal, DashboardHeader, AuthForm, etc)
├─ views/           # Páginas principais (Login, Register, Dashboard)
├─ router/          # Rotas da aplicação
│   └─ index.js
├─ App.vue          # Componente raiz
└─ main.js          # Ponto de entrada da aplicação
```

---

## 🧭 Rotas e Navegação

O projeto utiliza **Vue Router** com histórico HTML5 (`createWebHistory`).

### Rotas principais

| Rota         | Componente       | Descrição                                  |
| ------------ | ---------------- | ------------------------------------------ |
| `/login`     | `LoginView`      | Página de login                            |
| `/register`  | `RegisterView`   | Página de registo de utilizador            |
| `/dashboard` | `DashboardView`  | Dashboard principal da aplicação           |
| `*`          | Redireciona      | Redireciona para `/login` em rotas inválidas |

### Router Guard

- Controla acesso baseado na autenticação (**JWT** no `localStorage` e `sessionStorage`).
- Utilizadores não autenticados são redirecionados para `/login`.
- Utilizadores autenticados não podem aceder `/login` ou `/register`.

---

## 🧩 Componentes Principais

- **DashboardHeader**: Cabeçalho do dashboard com botões de admin e logout.
- **DashboardButtons**: Botões de ação do dashboard (adicionar, gerar, filtrar ou remover produtos).
- **DashboardTable**: Tabela paginada com produtos, suportando pesquisa, filtro e ordenação.
- **FormModal**: Modal reutilizável para ações CRUD (adicionar, editar, deletar, gerar produtos ou filtrar preços).
- **AuthForm**: Formulário reutilizável para login e registo.

---

## ✨ Funcionalidades

### 1. Dashboard

- Visualização paginada de produtos.
- Pesquisa por nome e descrição.
- Ordenação por preço (asc/desc).
- Filtragem por intervalo de preço.
- Criação, edição e remoção de produtos.
- Geração de produtos de teste.
- Confirmação antes de ações destrutivas (delete all / delete single).

### 2. Autenticação

- Login e registo via formulário.
- Validação JWT com backend.
- Guardas de rota para proteger páginas privadas.
- Logout limpa `sessionStorage` e `localStorage`.

### 3. API Integration

- `fetch` usado para todas as requisições (`POST`, `PATCH`, `DELETE`, `GET`).
- Token JWT incluído nos headers.

---

## 🔐 Autenticação

- Token JWT é armazenado em `localStorage`.
- `sessionStorage` mantém estado da autenticação em sessão.
- **Rotas públicas**: `Login`, `Register`.
- **Rotas protegidas**: `Dashboard`.

### Exemplo de validação

```javascript
const token = localStorage.getItem('token')
fetch('https://reckon-products-app.onrender.com/auth/validate', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
})
```

---

## 🎨 Estilo e Tema

- Tema escuro por padrão.
- Variáveis CSS definidas no `:root` em `App.vue`.
- Responsivo para dispositivos móveis (`max-width: 600px`).
- Fontes: `'Roboto', sans-serif`.

### Exemplo de variáveis

```css
:root {
    --bg: #0f172a;
    --card: #1e293b;
    --accent: #38bdf8;
    --text: #f1f5f9;
    --input: #334155;
    --input-focus: #475569;   
}
```

# 🧾 Reckon Products App — Backend

Este é o **backend** da aplicação **Reckon Products**, uma API RESTful desenvolvida em **Node.js + Express** com base de dados **MongoDB**, que permite a gestão de utilizadores e produtos, incluindo histórico de preços e autenticação JWT.

---

## 🏗️ Estrutura do Projeto

```
backend/
┣ 📂 coverage/              # Relatórios de cobertura Jest
┣ 📂 public/                # Página estática (index.html / style.css)
┣ 📂 src/
┃ ┣ 📂 controllers/         # Lógica principal (Product / User)
┃ ┣ 📂 docs/                # Configuração Swagger
┃ ┣ 📂 middleware/          # Middlewares (authMiddleware)
┃ ┣ 📂 models/              # Modelos Mongoose (Product, User)
┃ ┣ 📂 routes/              # Definição de rotas Express
┃ ┣ 📂 tests/               # Testes Jest + Supertest
┃ ┣ 📂 utils/               # Funções auxiliares (serverStart, JWT)
┃ ┣ 📂 validators/          # Schemas de validação (Joi)
┃ ┗ 📜 server.js            # Ficheiro principal do servidor
┣ 📜 .env
┣ 📜 .env.test
┣ 📜 package.json
┣ 📜 postman_collection.json
┗ 📜 README.md
```

---

## ⚙️ Tecnologias Utilizadas

- **Node.js 22**
- **Express.js 5**
- **MongoDB + Mongoose**
- **Jest + Supertest** (testes)
- **Swagger UI + swagger-jsdoc** (documentação)
- **dotenv** (variáveis de ambiente)
- **cookie-parser**, **jsonwebtoken**, **bcryptjs**
- **Joi** (validação de dados)
- **cors**

---

## 🧩 Endpoints Principais

| Método   | Rota              | Descrição                        |
| -------- | ----------------- | -------------------------------- |
| `POST`   | `/auth/register`  | Registar novo utilizador         |
| `POST`   | `/auth/login`     | Iniciar sessão e gerar token JWT |
| `POST`   | `/auth/logout`    | Remover cookie com token JWT     |
| `GET`    | `/auth/validate`  | Valida sessão do utilizador      |
| `GET`    | `/products`       | Listar todos os produtos         |
| `POST`   | `/products`       | Criar novo produto               |
| `PUT`    | `/products/:id`   | Atualizar produto existente      |
| `DELETE` | `/products/:id`   | Eliminar produto                 |

Endpoints protegidos requerem **autenticação via JWT**.

---

## 🧪 Testes

O projeto inclui testes unitários e de integração com **Jest** e **Supertest**, utilizando **MongoMemoryServer** (base de dados em memória).

Para executar os testes:

```bash
npm run test
```

Após a execução, o relatório de cobertura estará disponível em:

```
backend/coverage/lcov-report/index.html
```

---

## ⚙️ Ambiente de Desenvolvimento

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Criar ficheiro `.env`

Baseado em `.env.example` (exemplo abaixo):

```env
PORT=5000
MONGO_URI=mongodb+srv://teu_cluster.mongodb.net/reckon
JWT_SECRET=algum_segredo_unico
```

### 3️⃣ Iniciar servidor em modo desenvolvimento

```bash
npm run dev
```

Servidor arranca em:  
👉 http://localhost:5000

### 4️⃣ Iniciar servidor em modo produção

```bash
npm start
```

---

## 📚 Scripts disponíveis

| Script        | Descrição                                   |
| ------------- | ------------------------------------------- |
| `npm run dev` | Inicia o servidor com Nodemon               |
| `npm start`   | Inicia o servidor para produção             |
| `npm test`    | Executa os testes com Jest e gera cobertura |

---