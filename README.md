<div align="center">

# Zaiko — Sistema de Controle de Ferramentas TSEA

Plataforma de gestão de ferramentaria e consumíveis com leitura por código de barras,
controle de retirada/devolução, catálogo com imagens e painel administrativo.

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
quem pegou, quando, quanto, e quando devolveu. A identificação do colaborador
é feita por **crachá com código de barras** (leitor USB que emula teclado),
e o estoque é atualizado em tempo real a cada movimentação.

A aplicação tem dois perfis de uso:

| Perfil       | O que faz                                                                                  |
|--------------|---------------------------------------------------------------------------------------------|
| **Usuário**  | Vê o catálogo do setor, retira ferramentas escaneando o crachá, devolve quando terminar.    |
| **Admin**    | Gerencia catálogo, imagens dos produtos, vê pendências, histórico completo e confirma devoluções. |

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
        |  - Páginas Usuário / Admin               |
        |  - useBarcodeScanner (keydown buffer)    |
        |  - Axios + JWT interceptor               |
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
│       ├── controller/           # REST endpoints
│       ├── service/              # Regras de negócio
│       ├── repository/           # Spring Data JPA
│       ├── model/                # Entidades JPA
│       └── dto/                  # Request/Response DTOs
│
├── interface/                    # Frontend React
│   └── src/
│       ├── components/
│       │   ├── Admin/            # Catálogo, CRUD, Histórico, Pendências
│       │   ├── setorPanel/       # Painel do usuário
│       │   ├── login/            # Tela de login
│       │   └── ui/               # Toast, Modal, Spinner, Skeleton
│       ├── hooks/                # useBarcodeScanner
│       ├── services/             # api.ts, auth.ts, tools.ts, ...
│       ├── routes/               # Rotas protegidas
│       └── pages/
│
└── README.md
```

---

## Modelo de dados

| Entidade        | Campos principais                                                              |
|-----------------|---------------------------------------------------------------------------------|
| **User**        | id (UUID), employeeId (int único), name, password (BCrypt), role (USER/ADMIN)   |
| **Tools**       | id (UUID), name, type (FERRAMENTA/CONSUMIVEL), quantity, imagePath              |
| **Transaction** | id (UUID), responsible, toolName, toolQuantity, caughtDate, returnedDate, status |

Relação implícita: `Transaction.responsible` referencia o `employeeId` de um `User`,
e `toolName` o `name` de uma `Tools`. O `status` booleano marca devolução
(`false` = pendente, `true` = devolvido).

---

## Fluxos principais

### Retirada (Usuário)

1. Usuário abre o painel do setor.
2. Seleciona a ferramenta e a quantidade.
3. Modal de confirmação abre aguardando leitura do crachá.
4. O hook `useBarcodeScanner` captura a sequência de teclas do leitor USB,
   detecta o `Enter` final e dispara o `onScan` com o `employeeId`.
5. Backend valida estoque, decrementa quantidade e cria a transação dentro
   de uma transação JPA (`@Transactional`).
6. Frontend exibe `SuccessModal` com auto-dismiss em 1.8s.

### Devolução (Admin)

1. Admin abre "Ferramentas pendentes".
2. Clica em "Confirmar devolução" na linha desejada.
3. `ConfirmModal` substitui o `confirm()` nativo.
4. Backend marca `status=true`, grava `returnedDate` e incrementa o estoque,
   tudo numa única transação.

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

| Método | Rota              | Acesso  | Descrição                          |
|--------|-------------------|---------|------------------------------------|
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

### Transações

| Método | Rota                                  | Acesso  | Descrição              |
|--------|---------------------------------------|---------|------------------------|
| GET    | `/api/transacoes`                     | auth    | Lista todas            |
| GET    | `/api/transacoes/pending`             | auth    | Apenas pendentes       |
| GET    | `/api/transacoes/employee/{id}`       | auth    | Por colaborador        |
| POST   | `/api/transacoes`                     | auth    | Cria retirada          |
| PUT    | `/api/transacoes/return/{id}`         | auth    | Confirma devolução     |

### Usuários

| Método | Rota                       | Acesso  | Descrição        |
|--------|----------------------------|---------|------------------|
| GET    | `/api/users`               | ADMIN   | Lista            |
| POST   | `/api/users`               | ADMIN   | Cria             |
| DELETE | `/api/users/{employeeId}`  | ADMIN   | Remove           |

---

## Segurança

| Item                          | Implementação                                                              |
|-------------------------------|----------------------------------------------------------------------------|
| Senhas                        | BCrypt                                                                     |
| Autenticação                  | JWT HS256 com segredo via variável de ambiente (mín. 256 bits)             |
| Autorização                   | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` em endpoints sensíveis       |
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

A interface sobe em `http://localhost:5173`.

---

<div align="center">

Projeto desenvolvido para a **TSEA** — controle de ferramentaria com identificação por crachá.

</div>
