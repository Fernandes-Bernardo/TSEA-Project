<div align="center">

# Zaiko — Sistema de Controle de Ferramentas TSEA

Plataforma de gestão de ferramentaria e consumíveis com leitura por código de barras,
fluxo de empréstimo com múltiplos itens, controle de entrega e devolução por almoxarife,
catálogo com imagens e painel administrativo.

[![Java](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Modelo de dados](#modelo-de-dados)
- [Fluxos principais](#fluxos-principais)
- [Endpoints da API](#endpoints-da-api)
- [Segurança](#segurança)
- [Como rodar](#como-rodar)

---

## Visão geral

O **Zaiko** controla o ciclo de vida das ferramentas e consumíveis do depósito:
quem solicitou, quem entregou, quando, quanto, e quando devolveu.
A identificação do colaborador é feita por **crachá com código de barras**
(leitor USB que emula teclado), e o estoque é atualizado em tempo real a cada movimentação.

A aplicação tem três perfis de uso:

| Perfil          | O que faz                                                                                              |
|-----------------|--------------------------------------------------------------------------------------------------------|
| **Usuário**     | Monta solicitações com múltiplos itens em um carrinho, confirma com o crachá, acompanha próprios empréstimos. |
| **Almoxarife**  | Vê pedidos pendentes, valida o crachá no momento da entrega, confirma devoluções, consulta histórico e catálogo. |
| **Admin**       | Gerencia catálogo, imagens e usuários. Tem visão completa do histórico de empréstimos.                 |

---

## Stack

### Backend

| Camada         | Tecnologia                                  |
|----------------|---------------------------------------------|
| Linguagem      | Java 17                                     |
| Framework      | Spring Boot 4.0.6 (Web MVC + Data JPA)      |
| Segurança      | Spring Security + JWT (HS256, jjwt 0.11.5)  |
| Banco          | PostgreSQL                                  |
| ORM            | Hibernate / JPA                             |
| Build          | Maven (wrapper incluso)                     |
| Docs           | SpringDoc OpenAPI                           |
| Utilitários    | Lombok                                      |

### Frontend

| Camada           | Tecnologia                                  |
|------------------|---------------------------------------------|
| Linguagem        | TypeScript 6                                |
| Framework        | React 19                                    |
| Build tool       | Vite 8                                      |
| Estilo           | Tailwind CSS 3                              |
| Roteamento       | React Router v7                             |
| HTTP             | Axios (interceptor JWT)                     |
| Hardware         | Leitor USB HID (emulação de teclado)        |

---

## Arquitetura

```
              +-----------------------------+
              |       Leitor USB HID        |
              |  (código de barras crachá)  |
              +--------------+--------------+
                             |
                             v
        +------------------------------------------+
        |        Frontend (React + Vite)           |
        |  - Páginas Usuário / Almoxarife / Admin  |
        |  - useBarcodeScanner (keydown buffer)    |
        |  - Cart drawer + role-based ProtectedRoute |
        |  - Toast / ConfirmModal / SuccessModal   |
        +-------------------+----------------------+
                            |
                            | HTTPS / JSON
                            v
        +------------------------------------------+
        |       Backend (Spring Boot MVC)          |
        |  - Controllers REST                      |
        |  - Services (regra de negócio)           |
        |  - JWT Filter + @PreAuthorize            |
        |  - GlobalExceptionHandler                |
        +-------------------+----------------------+
                            |
            +---------------+----------------+
            |                                |
            v                                v
   +------------------+            +-------------------+
   |   PostgreSQL     |            |  Filesystem       |
   |  (apiTsea DB)    |            |  uploads/tools/   |
   +------------------+            +-------------------+
```

**Padrão de camadas** no backend: `Controller → Service → Repository → Model`.
Excepções são tratadas centralmente em `GlobalExceptionHandler`, que devolve
JSON estruturado sem stack trace para o cliente.

---

## Estrutura do repositório

```
TSEA-Project/
├── api/                          # Backend Spring Boot
│   └── src/main/java/com/server/api/
│       ├── config/               # Security, CORS, Bootstrap, ExceptionHandler
│       ├── controller/           # REST endpoints (Auth, Tools, Loans, Users, Sectors)
│       ├── service/              # Regras de negócio (LoanService, ToolImageService, ...)
│       ├── repository/           # Spring Data JPA
│       ├── model/                # Entidades JPA + enums (Loan, LoanItem, Tools, User, Sector)
│       └── dto/                  # Request/Response DTOs por contexto
│
├── interface/                    # Frontend React
│   └── src/
│       ├── components/
│       │   ├── Admin/            # Catálogo, CRUD, Histórico
│       │   ├── Almoxarife/       # Pedidos, Ativos, Histórico, LoanRow
│       │   ├── setorPanel/       # Painel do usuário + CartDrawer
│       │   ├── user/             # Meus empréstimos
│       │   ├── login/            # Tela de login
│       │   └── ui/               # Toast, Modal, Spinner, Skeleton
│       ├── hooks/                # useBarcodeScanner
│       ├── services/             # api, auth, tools, users, loans, sectors
│       ├── routes/               # Rotas protegidas com role guards
│       └── pages/                # home, admin, almoxarife, login
│
└── README.md
```

---

## Modelo de dados

| Entidade        | Campos principais                                                                                |
|-----------------|---------------------------------------------------------------------------------------------------|
| **User**        | id (UUID), employeeId (int único), name, password (BCrypt), role (USER/ADMIN/ALMOXARIFE), sector  |
| **Tools**       | id (UUID), name, description, type (DAILY_USE/CONSUMABLE), quantity, minQuantity, levelSecurity, imagePath |
| **Loan**        | id (UUID), employeeId, responsibleName, status, deliveredByEmployeeId, requestedAt, deliveredAt, returnedAt, notes |
| **LoanItem**    | id (UUID), loan, toolId, toolName, toolType, quantity, returnedQuantity                          |

### Estados do empréstimo

```
   REQUESTED          DELIVERED                   RETURNED
   (criado pelo  ───► (entregue pelo   ─────────► (todos os itens
    usuário)           almoxarife)                 ferramentas voltaram,
                                                   ou empréstimo era
                                                   só de consumíveis)
       │
       └────► CANCELLED  (cancelado antes da entrega)
```

- `employeeId` é gerado pelo backend como `max(employeeId) + 1` começando em 1000.
- `minQuantity` aciona o badge "estoque baixo" no catálogo do admin.
- `levelSecurity` é normalizado no frontend para "Baixo / Médio / Alto".
- Itens **consumíveis** marcam `returnedQuantity = quantity` automaticamente na entrega
  e não exigem devolução manual.

---

## Fluxos principais

### Solicitação (Usuário)

1. Usuário abre o catálogo do setor.
2. Adiciona um ou mais itens ao **carrinho** (`CartDrawer`), ajustando quantidades.
3. Clica em **Finalizar pedido**.
4. Um modal abre aguardando leitura do crachá. O hook `useBarcodeScanner` captura
   a sequência de teclas e dispara `onScan` ao detectar o `Enter` final.
5. O backend cria um `Loan` com status `REQUESTED` e valida disponibilidade de estoque.
6. Frontend exibe `SuccessModal` e o pedido aparece como pendente em "Meus empréstimos".

### Entrega (Almoxarife)

1. Almoxarife abre "Pedidos pendentes".
2. Clica em **Confirmar entrega** no pedido desejado.
3. Modal pede a leitura do crachá do funcionário; o backend valida que o
   `scannedEmployeeId` corresponde ao `employeeId` do empréstimo.
4. Estoque é decrementado, o status passa para `DELIVERED` (ou direto para
   `RETURNED` se o empréstimo for **só de consumíveis**).

### Devolução (Almoxarife)

1. Almoxarife abre "Empréstimos ativos".
2. Para empréstimos com ferramentas, clica em **Confirmar devolução**.
3. Backend devolve o saldo das ferramentas ao estoque e marca o empréstimo
   como `RETURNED`.
4. Empréstimos apenas com consumíveis **não exibem botão de devolução** —
   já foram fechados na entrega.

### Upload de imagem (Admin)

1. Admin envia arquivo via `POST /api/tools/{id}/image` (multipart).
2. Backend valida:
   - MIME type em whitelist (`image/png`, `image/jpeg`, `image/webp`)
   - Tamanho máximo 5 MB
   - Guarda contra path traversal (`dest.startsWith(uploadRoot)`)
3. Imagem salva como `{toolId}.{ext}` em `uploads/tools/`.
4. `GET /api/tools/{id}/image` é público e devolve os bytes com `Cache-Control: max-age=300`.

---

## Endpoints da API

### Autenticação

| Método | Rota              | Acesso  | Descrição                                 |
|--------|-------------------|---------|-------------------------------------------|
| POST   | `/api/auth/login` | público | Login com employeeId + senha, devolve JWT |

### Ferramentas

| Método | Rota                          | Acesso  | Descrição                  |
|--------|-------------------------------|---------|----------------------------|
| GET    | `/api/tools`                  | auth    | Lista todas                |
| GET    | `/api/tools/search?name=`     | auth    | Busca por nome             |
| GET    | `/api/tools/{id}`             | auth    | Detalhe                    |
| POST   | `/api/tools`                  | ADMIN   | Cria                       |
| PUT    | `/api/tools/{id}`             | ADMIN   | Atualiza                   |
| DELETE | `/api/tools/{id}`             | ADMIN   | Remove                     |
| POST   | `/api/tools/{id}/image`       | ADMIN   | Upload de imagem           |
| GET    | `/api/tools/{id}/image`       | público | Bytes da imagem            |
| DELETE | `/api/tools/{id}/image`       | ADMIN   | Remove imagem              |

### Empréstimos (Loans)

| Método | Rota                              | Acesso              | Descrição                                       |
|--------|-----------------------------------|---------------------|-------------------------------------------------|
| POST   | `/api/loans`                      | auth                | Cria solicitação (usuário só cria pra si)       |
| GET    | `/api/loans`                      | ADMIN / ALMOX       | Lista todos                                     |
| GET    | `/api/loans/pending`              | ADMIN / ALMOX       | Apenas com status `REQUESTED`                   |
| GET    | `/api/loans/active`               | ADMIN / ALMOX       | Apenas com status `DELIVERED`                   |
| GET    | `/api/loans/employee/{id}`        | dono / ADMIN / ALMOX| Empréstimos de um colaborador                   |
| GET    | `/api/loans/me`                   | auth                | Empréstimos do usuário logado                   |
| GET    | `/api/loans/{id}`                 | dono / ADMIN / ALMOX| Detalhe                                         |
| PUT    | `/api/loans/{id}/deliver`         | ADMIN / ALMOX       | Confirma entrega validando crachá lido          |
| PUT    | `/api/loans/{id}/return-item`     | ADMIN / ALMOX       | Devolução parcial de um item                    |
| PUT    | `/api/loans/{id}/return`          | ADMIN / ALMOX       | Devolve tudo o que estava pendente              |
| DELETE | `/api/loans/{id}`                 | dono / ADMIN / ALMOX| Cancela enquanto está `REQUESTED`               |

### Usuários

| Método | Rota                       | Acesso          | Descrição                              |
|--------|----------------------------|-----------------|----------------------------------------|
| GET    | `/api/users`               | ADMIN           | Lista                                  |
| GET    | `/api/users/search?name=`  | ADMIN           | Busca por nome (parcial, case-insensitive) |
| GET    | `/api/users/{employeeId}`  | ADMIN / ALMOX   | Detalhe por crachá                     |
| POST   | `/api/users`               | ADMIN           | Cria (employeeId gerado automaticamente) |
| DELETE | `/api/users/{employeeId}`  | ADMIN           | Remove                                 |

### Setores

| Método | Rota             | Acesso | Descrição                                         |
|--------|------------------|--------|---------------------------------------------------|
| GET    | `/api/sectors`   | auth   | Lista padronizada de setores (PT-BR)              |

---

## Segurança

| Item                          | Implementação                                                              |
|-------------------------------|----------------------------------------------------------------------------|
| Senhas                        | BCrypt                                                                     |
| Autenticação                  | JWT HS256 com segredo via variável de ambiente (mín. 256 bits)             |
| Autorização                   | `@PreAuthorize` com `ROLE_ADMIN`, `ROLE_ALMOXARIFE`, `ROLE_USER`           |
| Validação na entrega          | Backend confere que o `scannedEmployeeId` bate com o `employeeId` do empréstimo |
| Geração de employeeId         | Sequencial (`max + 1`, mínimo 1000) — sem colisão de random                |
| Setores                       | Validação contra lista padronizada (`Sector.VALUES`)                       |
| CORS                          | Permite apenas `localhost` em dev (configurável)                           |
| CSRF                          | Desabilitado (API stateless com JWT)                                       |
| Mensagens de erro             | `GlobalExceptionHandler` sem stack trace, mensagens neutras no login       |
| Upload                        | Whitelist de MIME, tamanho máximo, guarda contra path traversal            |
| Admin padrão                  | Criado por `BootstrapAdmin` com senha de env var (nunca em log)            |
| Token expirado                | `JwtService.isTokenValid` valida assinatura e expiração; 401 redireciona para login |

---

## Como rodar

### Pré-requisitos

- Java 17+
- Node 20+
- PostgreSQL 14+ rodando localmente
- Banco `apiTsea` criado

### Backend

```bash
cd api
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`.
Na primeira execução, `BootstrapAdmin` cria o admin padrão com `employeeId=1`.

### Frontend

```bash
cd interface
npm install
npm run dev
```

A interface sobe em `http://localhost:5173` e redireciona o usuário para
`/` (usuário), `/almoxarife` ou `/admin` conforme o papel no JWT.

---

<div align="center">

Projeto desenvolvido para a **TSEA** — controle de ferramentaria com identificação por crachá.

</div>
