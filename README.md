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

## 🚀 Deploy

O backend está alojado em **Render** e pode ser acedido aqui:

🔗 [https://reckon-products-app.onrender.com](https://reckon-products-app.onrender.com)  
📘 Documentação Swagger: [https://reckon-products-app.onrender.com/api/docs](https://reckon-products-app.onrender.com/api/docs)

---

## 🧩 Endpoints Principais

| Método   | Rota              | Descrição                        |
| -------- | ----------------- | -------------------------------- |
| `POST`   | `/users/register` | Registar novo utilizador         |
| `POST`   | `/users/login`    | Iniciar sessão e gerar token JWT |
| `GET`    | `/products`       | Listar todos os produtos         |
| `POST`   | `/products`       | Criar novo produto               |
| `PUT`    | `/products/:id`   | Atualizar produto existente      |
| `DELETE` | `/products/:id`   | Eliminar produto                 |
| `GET`    | `/api-docs`       | Aceder à documentação Swagger    |

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
