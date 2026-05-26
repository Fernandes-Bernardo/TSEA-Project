<div align="center">

# Zaiko — Sistema de Controle de Ferramentas TSEA

Plataforma de gestão de ferramentaria e consumíveis com leitura por código de barras,
fluxo de empréstimo com múltiplos itens, controle de entrega e devolução por almoxarife,
catálogo com imagens, painel administrativo e dashboard analítica com exportação em PDF.

[![Java](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Plotly Dash](https://img.shields.io/badge/Plotly_Dash-2.18-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)](https://dash.plotly.com/)
[![ESP32](https://img.shields.io/badge/ESP32-Arduino-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
[![MQTT](https://img.shields.io/badge/MQTT-Paho-660066?style=for-the-badge&logo=mqtt&logoColor=white)](https://www.eclipse.org/paho/)
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
- [Dashboard analítica](#dashboard-analítica)
- [Hardware ESP32 e MQTT](#hardware-esp32-e-mqtt)
- [Endpoints da API](#endpoints-da-api)
- [Segurança](#segurança)
- [Como rodar](#como-rodar)

---

## Visão geral

O **Zaiko** controla o ciclo de vida das ferramentas e consumíveis do depósito:
quem solicitou, quem entregou, quando, quanto, e quando devolveu.
A identificação do colaborador é feita por **crachá com código de barras**
(leitor USB que emula teclado), o estoque é atualizado em tempo real a cada
movimentação, e a entrega de itens mapeados aciona fisicamente **servomotores
controlados via MQTT** em um ESP32 — efetivamente liberando o item no rack.

A aplicação tem três perfis de uso, mais uma dashboard analítica separada:

| Perfil          | O que faz                                                                                              |
|-----------------|--------------------------------------------------------------------------------------------------------|
| **Usuário**     | Monta solicitações com múltiplos itens em um carrinho, confirma com o crachá, acompanha próprios empréstimos. |
| **Almoxarife**  | Vê pedidos pendentes, valida o crachá no momento da entrega, confirma devoluções, consulta histórico e catálogo. |
| **Admin**       | Gerencia catálogo, imagens e usuários. Tem visão completa do histórico de empréstimos.                 |
| **Analista**    | Acessa a **dashboard analítica** em Python (KPIs, gráficos, filtros, exportação em PDF). Login com conta admin. |

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
| Mensageria     | Eclipse Paho MQTT v3 (publisher)            |
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

### Dashboard analítica

| Camada           | Tecnologia                                  |
|------------------|---------------------------------------------|
| Linguagem        | Python 3.11                                 |
| UI               | Plotly Dash 2.18                            |
| Gráficos         | Plotly + Matplotlib (PDF)                   |
| Acesso a dados   | SQLAlchemy + psycopg2 (read-only)           |
| PDF              | ReportLab                                   |
| Auth             | Delegada à API Java (JWT)                   |

### Hardware

| Camada           | Tecnologia                                  |
|------------------|---------------------------------------------|
| MCU              | ESP32                                       |
| Framework        | Arduino Core (PubSubClient + ESP32Servo)    |
| Atuadores        | 6× servomotores                             |
| Comunicação      | MQTT sobre WiFi (broker.hivemq.com por padrão) |

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
        +-------------------+----------------------+
                            |
                            | HTTPS / JSON                    +---------------------+
                            v                                 |  Dashboard (Python) |
        +------------------------------------------+          |  Plotly Dash        |
        |       Backend (Spring Boot MVC)          |<---------+  read-only via SQL  |
        |  - Controllers REST                      |          +---------------------+
        |  - Services (regra de negócio)           |
        |  - JWT Filter + @PreAuthorize            |
        |  - GlobalExceptionHandler                |
        |  - MQTT Publisher (Paho v3)              |
        +-------+----------------------+-----------+
                |                      |
                v                      v
       +------------------+     +-------------------+         +------------------+
       |   PostgreSQL     |     |  Filesystem       |         |   Broker MQTT    |
       |  (apiTsea DB)    |     |  uploads/tools/   |         | (broker.hivemq.com)
       +------------------+     +-------------------+         +--------+---------+
                                                                       |
                                                                       v
                                                         +-----------------------------+
                                                         |        ESP32 + 6 servos     |
                                                         |  pulso 180° por 5s nos      |
                                                         |  produtos mapeados          |
                                                         +-----------------------------+
```

**Padrão de camadas** no backend: `Controller → Service → Repository → Model`.
Exceções são tratadas centralmente em `GlobalExceptionHandler`, que devolve
JSON estruturado sem stack trace para o cliente.

---

## Estrutura do repositório

```
TSEA-Project/
├── api/                          # Backend Spring Boot
│   └── src/main/java/com/server/api/
│       ├── config/               # Security, CORS, Bootstrap, ExceptionHandler, MqttProperties
│       ├── controller/           # REST endpoints (Auth, Tools, Loans, Users, Sectors)
│       ├── service/              # Regras de negócio + MqttPublisherService
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
├── dashboard/                    # Dashboard analítica em Python (Plotly Dash)
│   ├── app.py                    # Entry point — layout, routing, callbacks
│   ├── config.py                 # Env vars + paletas dark/light
│   ├── requirements.txt
│   ├── assets/                   # CSS (tema dual via className)
│   ├── components/               # login, kpis, filters, charts
│   └── services/                 # api_auth, db, queries, pdf_report
│
├── esp/                          # Firmware ESP32 (Arduino)
│   └── main/main.ino             # WiFi + MQTT + 6 servos com pulso não-bloqueante
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
5. Para cada item mapeado no `app.mqtt.tool-mapping`, o backend publica
   `servo/{n}/set 180` no broker MQTT, agenda o retorno a `0` após 5s e
   o ESP32 movimenta o servomotor correspondente.

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

## Dashboard analítica

Uma aplicação Python separada (em `dashboard/`) voltada para analistas e gestores.
Acesso por login admin, autenticação delegada à API Java.

### KPIs

- Empréstimos no período (todos os status)
- Aguardando entrega (`REQUESTED`)
- Em uso (`DELIVERED`)
- Concluídos (`RETURNED`)
- Tempo médio em uso (entrega → devolução)
- Itens em alerta de estoque

### Gráficos interativos

- Série temporal de empréstimos (linha + área)
- Distribuição por status (donut)
- Distribuição por setor (donut)
- Top 10 itens solicitados (barra)
- Top 10 colaboradores (barra)
- Unidades por tipo (barra)

### Filtros dinâmicos

Período (date range), setor, status do empréstimo, tipo de item. Todos atualizam
KPIs, gráficos e tabela detalhada de até 500 registros de forma reativa.

### Exportação PDF

Botão **Exportar PDF** na barra de filtros gera um relatório completo (capa,
KPIs, todos os gráficos como imagens, tabela detalhada). Renderizado com
ReportLab + Matplotlib — totalmente em memória, sem subprocess. Aplica os
filtros vigentes no momento do clique.

### Tema dual

Toggle Escuro / Claro no header, persistido em `localStorage` via `dcc.Store`.
Aplicado via className no root, garantindo que tabelas, gráficos e tabelas
Dash repintem.

---

## Hardware ESP32 e MQTT

O backend publica em um broker MQTT e o ESP32 lê os tópicos `servo/{n}/set`
e `servo/{n}/pulse`. Quando um empréstimo é entregue, cada item presente no
mapeamento dispara um pulso no servomotor correspondente.

### Configuração no `application.properties`

| Propriedade                  | Padrão                            | Descrição                            |
|------------------------------|-----------------------------------|--------------------------------------|
| `app.mqtt.enabled`           | `true`                            | Habilita o publisher MQTT            |
| `app.mqtt.broker-url`        | `tcp://broker.hivemq.com:1883`    | URL do broker                        |
| `app.mqtt.client-id`         | `zaiko-api`                       | Prefixo do client id                 |
| `app.mqtt.pulse-angle`       | `180`                             | Ângulo do pulso                      |
| `app.mqtt.pulse-duration-ms` | `5000`                            | Duração antes do retorno a `0`       |
| `app.mqtt.tool-mapping`      | `Eletrodo 6013 2.5mm=1,…`         | Mapa `nomeDaFerramenta=servo(1..6)`  |

### Tópicos MQTT

| Tópico                  | Payload                | Efeito                                       |
|-------------------------|------------------------|----------------------------------------------|
| `servo/{n}/set`         | `<ângulo>` (0..180)    | Move o servo `n` para o ângulo imediatamente |
| `servo/{n}/pulse`       | `<ângulo>:<ms>`        | Vai ao ângulo e volta a `0` após `ms`        |

### Firmware

O firmware em `esp/main/main.ino` é modular (funções `setupServos`, `moveServo`,
`pulseServo`, `tickServos`, `connectWiFi`, `ensureWiFi`, `mqttCallback`,
`subscribeAll`, `ensureMqtt`, `setupMqtt`). O retorno do servo a `0` é controlado
por `millis()` no loop principal — **não bloqueia** outras leituras MQTT.

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
| PUT    | `/api/loans/{id}/deliver`         | ADMIN / ALMOX       | Confirma entrega validando crachá + MQTT pulse  |
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
| Dashboard                     | Restrita a `ROLE_ADMIN`; autenticação delegada à API Java                  |
| MQTT                          | Falha de conexão é tolerada — backend sobe e loga warning, não trava       |

---

## Como rodar

### Pré-requisitos

- Java 17+
- Node 20+
- Python 3.11+
- PostgreSQL 14+ rodando localmente
- Banco `apiTsea` criado
- (Opcional) ESP32 + 6 servos + acesso ao broker MQTT

### Backend

```bash
cd api
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`.
Na primeira execução, `BootstrapAdmin` cria o admin padrão com `employeeId=1`.
O `MqttPublisherService` tenta conectar no broker e carrega o mapeamento de
ferramentas → servos.

### Frontend

```bash
cd interface
npm install
npm run dev
```

A interface sobe em `http://localhost:5173` e redireciona o usuário para
`/` (usuário), `/almoxarife` ou `/admin` conforme o papel no JWT.

### Dashboard

```bash
cd dashboard
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
cp .env.example .env
python app.py
```

A dashboard sobe em `http://localhost:8050`. Entre com credenciais de
administrador do sistema Zaiko.

### ESP32

Abra `esp/main/main.ino` no Arduino IDE ou PlatformIO, ajuste `WIFI_SSID`,
`WIFI_PASSWORD` e `MQTT_HOST` no topo do arquivo, e faça o upload para a
placa. O firmware se inscreve em `servo/1..6/set` e `servo/1..6/pulse`.

---

<div align="center">

Projeto desenvolvido para a **TSEA** — controle de ferramentaria com identificação por crachá,
acionamento físico via ESP32 e análise de dados em dashboard dedicada.

</div>
