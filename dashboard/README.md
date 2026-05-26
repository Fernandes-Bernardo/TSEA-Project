# Zaiko · Dashboard analítica

Dashboard em Python (Plotly Dash) que consome o mesmo banco PostgreSQL do
sistema Zaiko. Voltada para analistas e gestores — apresenta KPIs, gráficos
interativos e permite exportar um relatório completo em PDF.

## Stack

- **Plotly Dash** (UI + callbacks reativos)
- **SQLAlchemy + psycopg2** (acesso ao banco em modo leitura)
- **Pandas** (manipulação de dados)
- **ReportLab + Kaleido** (PDF + render das figures como PNG)
- **Requests** (login na API Spring para autenticação ADMIN)

## Estrutura

```
dashboard/
├── app.py                # Entry point — Dash app, layout, callbacks
├── config.py             # Variáveis de ambiente + paletas dark/light
├── requirements.txt
├── .env.example
├── assets/
│   └── style.css         # Tema dual via data-theme + animações
├── services/
│   ├── api_auth.py       # Login no /api/auth/login
│   ├── db.py             # Engine SQLAlchemy
│   ├── queries.py        # KPIs, séries, rankings
│   └── pdf_report.py     # Snapshot PDF (capa, KPIs, gráficos, tabela)
└── components/
    ├── login.py          # Tela de login
    ├── kpis.py           # Cards de KPI
    ├── filters.py        # Barra de filtros + botão Exportar
    └── charts.py         # Figures Plotly (time series, donuts, bars)
```

## Como rodar

```bash
cd dashboard
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
cp .env.example .env           # ajuste se necessário
python app.py
```

Acesse `http://localhost:8050` e entre com credenciais de **ADMIN** do
sistema Zaiko. A dashboard valida a role do JWT — só admin entra.

## Funcionalidades

### KPIs
- Empréstimos no período (com todos os status)
- Aguardando entrega (`REQUESTED`)
- Em uso (`DELIVERED`)
- Concluídos (`RETURNED`)
- Tempo médio em uso (entrega → devolução)
- Itens em alerta de estoque

### Gráficos interativos
- Série temporal de empréstimos (linha + área)
- Distribuição por status (donut)
- Distribuição por setor (donut)
- Top 10 itens solicitados (barra horizontal)
- Top 10 colaboradores (barra horizontal)
- Unidades por tipo (barra vertical)

### Filtros dinâmicos
- Período (date range, padrão últimos 30 dias)
- Setor
- Status
- Tipo de item

### Tabela detalhada
- Até 500 empréstimos do período filtrado, paginada.

### Exportação PDF
Botão **Exportar PDF** no canto superior direito da barra de filtros.
Gera um PDF com capa, KPIs, todos os gráficos como imagens e a tabela
detalhada. Sempre em paleta clara (otimizado para impressão).

### Tema dual
Toggle Escuro / Claro no header. Preferência persistida em `localStorage`.

## Segurança

- **Autenticação delegada** ao backend Java (`/api/auth/login`).
- Apenas usuários com role `ROLE_ADMIN` conseguem acessar a dashboard.
- Token JWT é armazenado em `dcc.Store` (`session`) — limpa ao fechar a aba.
- Acesso ao banco é exclusivo da dashboard (read-only nas queries).
- `.env` **não deve ser versionado** — use `.env.example` como template.
