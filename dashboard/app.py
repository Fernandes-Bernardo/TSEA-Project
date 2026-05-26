"""
Zaiko — Dashboard analítica
============================
Entry point. Inicializa o Dash app, define o layout base com tema dual,
registra todos os callbacks (login, filtros, KPIs, gráficos, export PDF).
"""
from __future__ import annotations

import io
import logging
from datetime import date, datetime
from typing import Optional

import dash
from dash import Input, Output, State, dcc, html, dash_table, no_update, ctx
import plotly.graph_objects as go

from config import DASH_PORT, DASH_SECRET_KEY, get_theme
from services import api_auth, queries
from services.queries import Filters
from services.pdf_report import build_pdf
from components import login as login_view
from components.filters import filters_bar
from components.kpis import kpi_row
from components.charts import (
    time_series,
    top_tools_bar,
    sector_donut,
    status_donut,
    top_users_bar,
    type_distribution,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

app = dash.Dash(
    __name__,
    title="Zaiko · Dashboard",
    update_title=None,
    suppress_callback_exceptions=True,
    meta_tags=[{"name": "viewport", "content": "width=device-width, initial-scale=1"}],
)
server = app.server
server.secret_key = DASH_SECRET_KEY


# ---------- Layout-raiz -------------------------------------------------------

app.layout = html.Div(
    id="root",
    children=[
        dcc.Store(id="store-auth", storage_type="session"),
        dcc.Store(id="store-theme", storage_type="local", data="dark"),
        html.Div(id="theme-applier"),  # patch que aplica data-theme no body
        html.Div(id="page-content"),
    ],
)


# ---------- Theme: aplica data-theme no <body> --------------------------------

app.clientside_callback(
    """
    function(theme) {
        document.body.setAttribute('data-theme', theme || 'dark');
        return '';
    }
    """,
    Output("theme-applier", "children"),
    Input("store-theme", "data"),
)


# ---------- Roteamento simples (login ↔ dashboard) ----------------------------

@app.callback(
    Output("page-content", "children"),
    Input("store-auth", "data"),
)
def render_page(auth):
    if not auth or not auth.get("token"):
        return login_view.layout()
    return dashboard_layout(auth)


# ---------- Login -------------------------------------------------------------

@app.callback(
    Output("store-auth", "data"),
    Output("login-error", "children"),
    Input("login-submit", "n_clicks"),
    Input("login-id", "n_submit"),
    Input("login-pwd", "n_submit"),
    State("login-id", "value"),
    State("login-pwd", "value"),
    prevent_initial_call=True,
)
def do_login(_n_clicks, _s1, _s2, employee_id, password):
    if not employee_id or not password:
        return no_update, "Preencha crachá e senha."
    try:
        result = api_auth.login(int(employee_id), password)
    except Exception as ex:  # noqa: BLE001
        logging.exception("login error")
        return no_update, f"Erro inesperado: {ex}"
    if not result.success:
        return no_update, result.error or "Não foi possível entrar."
    return (
        {"token": result.token, "employeeId": result.employee_id, "role": result.role},
        "",
    )


@app.callback(
    Output("store-auth", "data", allow_duplicate=True),
    Input("btn-logout", "n_clicks"),
    prevent_initial_call=True,
)
def do_logout(n):
    if not n:
        return no_update
    return None


# ---------- Toggle de tema ----------------------------------------------------

@app.callback(
    Output("store-theme", "data"),
    Input("btn-theme-dark", "n_clicks"),
    Input("btn-theme-light", "n_clicks"),
    State("store-theme", "data"),
    prevent_initial_call=True,
)
def switch_theme(_d, _l, current):
    trigger = ctx.triggered_id
    if trigger == "btn-theme-dark":
        return "dark"
    if trigger == "btn-theme-light":
        return "light"
    return current


# ---------- Layout principal --------------------------------------------------

def dashboard_layout(auth: dict) -> html.Div:
    sectors = queries.list_sectors()
    return html.Div(
        className="app-shell",
        children=[
            html.Header(
                className="topbar",
                children=[
                    html.Div(
                        className="topbar-brand",
                        children=[
                            html.Span("Zaiko", className="topbar-brand-name"),
                            html.Span("Dashboard analítica", className="topbar-brand-sub"),
                        ],
                    ),
                    html.Div(
                        className="topbar-actions",
                        children=[
                            html.Div(
                                className="theme-toggle",
                                children=[
                                    html.Button("Escuro", id="btn-theme-dark", n_clicks=0),
                                    html.Button("Claro", id="btn-theme-light", n_clicks=0),
                                ],
                            ),
                            html.Span(
                                f"Admin · {auth.get('employeeId')}",
                                className="topbar-user",
                            ),
                            html.Button("Sair", id="btn-logout", className="topbar-btn", n_clicks=0),
                        ],
                    ),
                ],
            ),
            html.Main(
                className="main",
                children=[
                    filters_bar(sectors),
                    html.Div(id="kpis-section"),
                    html.Div(
                        className="charts-grid",
                        children=[
                            html.Div(
                                className="chart-card",
                                children=[
                                    html.H3("Empréstimos ao longo do tempo", className="chart-title"),
                                    dcc.Graph(id="chart-timeseries", config={"displayModeBar": False}),
                                ],
                            ),
                            html.Div(
                                className="chart-card",
                                children=[
                                    html.H3("Distribuição por status", className="chart-title"),
                                    dcc.Graph(id="chart-status", config={"displayModeBar": False}),
                                ],
                            ),
                        ],
                    ),
                    html.Div(
                        className="charts-grid-3",
                        children=[
                            html.Div(
                                className="chart-card",
                                children=[
                                    html.H3("Top 10 itens solicitados", className="chart-title"),
                                    dcc.Graph(id="chart-top-tools", config={"displayModeBar": False}),
                                ],
                            ),
                            html.Div(
                                className="chart-card",
                                children=[
                                    html.H3("Distribuição por setor", className="chart-title"),
                                    dcc.Graph(id="chart-sectors", config={"displayModeBar": False}),
                                ],
                            ),
                            html.Div(
                                className="chart-card",
                                children=[
                                    html.H3("Unidades por tipo", className="chart-title"),
                                    dcc.Graph(id="chart-types", config={"displayModeBar": False}),
                                ],
                            ),
                        ],
                    ),
                    html.Div(
                        className="charts-grid",
                        children=[
                            html.Div(
                                className="chart-card",
                                children=[
                                    html.H3("Top 10 colaboradores", className="chart-title"),
                                    dcc.Graph(id="chart-top-users", config={"displayModeBar": False}),
                                ],
                            ),
                            html.Div(
                                className="table-card",
                                children=[
                                    html.H3("Empréstimos detalhados (até 500)", className="chart-title"),
                                    html.Div(id="detail-table"),
                                ],
                            ),
                        ],
                    ),
                ],
            ),
        ],
    )


# ---------- Helpers de filtro -------------------------------------------------

def _to_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s).date()
    except ValueError:
        try:
            return datetime.strptime(s, "%Y-%m-%d").date()
        except ValueError:
            return None


def _filters_from_inputs(start, end, sector, status, ttype) -> Filters:
    return Filters(
        start=_to_date(start),
        end=_to_date(end),
        sector=sector,
        status=status,
        tool_type=ttype,
    )


# ---------- Atualização reativa de KPIs/gráficos/tabela ----------------------

@app.callback(
    Output("kpis-section", "children"),
    Output("chart-timeseries", "figure"),
    Output("chart-status", "figure"),
    Output("chart-top-tools", "figure"),
    Output("chart-sectors", "figure"),
    Output("chart-types", "figure"),
    Output("chart-top-users", "figure"),
    Output("detail-table", "children"),
    Input("flt-period", "start_date"),
    Input("flt-period", "end_date"),
    Input("flt-sector", "value"),
    Input("flt-status", "value"),
    Input("flt-type", "value"),
    Input("store-theme", "data"),
)
def refresh(start, end, sector, status, ttype, theme_name):
    theme = get_theme(theme_name or "dark")
    f = _filters_from_inputs(start, end, sector, status, ttype)

    kpis = queries.kpis(f)
    stock = queries.stock_health()

    detail_df = queries.loan_details(f)
    if not detail_df.empty:
        detail_df = detail_df.copy()
        for col in ("requested_at", "delivered_at", "returned_at"):
            detail_df[col] = detail_df[col].apply(
                lambda v: v.strftime("%d/%m/%Y %H:%M") if v is not None and not _is_nat(v) else "—"
            )
        detail_df.rename(
            columns={
                "requested_at": "Solicitado",
                "delivered_at": "Entregue",
                "returned_at": "Devolvido",
                "status": "Status",
                "responsible": "Responsável",
                "employee_id": "Crachá",
                "sector": "Setor",
                "total_items": "Itens",
            },
            inplace=True,
        )
        detail_df.drop(columns=["id"], inplace=True, errors="ignore")

    table = dash_table.DataTable(
        data=detail_df.to_dict("records") if not detail_df.empty else [],
        columns=[{"name": c, "id": c} for c in detail_df.columns] if not detail_df.empty else [],
        page_size=10,
        style_as_list_view=True,
        style_cell={
            "backgroundColor": "transparent",
            "color": theme.text,
            "border": f"1px solid {theme.border}",
            "padding": "8px 10px",
            "fontFamily": "Inter, system-ui, sans-serif",
            "fontSize": "13px",
        },
        style_header={
            "backgroundColor": theme.surface_alt,
            "color": theme.text,
            "fontWeight": "600",
            "border": f"1px solid {theme.border}",
        },
        style_data_conditional=[
            {"if": {"row_index": "odd"}, "backgroundColor": theme.surface_alt + "40"},
        ],
    )

    return (
        kpi_row(kpis, stock),
        time_series(queries.loans_per_day(f), theme),
        status_donut(queries.loans_by_status(f), theme),
        top_tools_bar(queries.top_tools(f, limit=10), theme),
        sector_donut(queries.loans_by_sector(f), theme),
        type_distribution(queries.loans_by_tool_type(f), theme),
        top_users_bar(queries.top_users(f, limit=10), theme),
        table,
    )


def _is_nat(v) -> bool:
    """Verifica NaT do pandas sem importar pandas aqui."""
    return repr(v) == "NaT" or v != v  # noqa: PLR0124


# ---------- Export PDF --------------------------------------------------------

@app.callback(
    Output("pdf-download", "data"),
    Input("btn-export-pdf", "n_clicks"),
    State("flt-period", "start_date"),
    State("flt-period", "end_date"),
    State("flt-sector", "value"),
    State("flt-status", "value"),
    State("flt-type", "value"),
    State("store-theme", "data"),
    prevent_initial_call=True,
)
def export_pdf(n_clicks, start, end, sector, status, ttype, theme_name):
    if not n_clicks:
        return no_update
    theme = get_theme(theme_name or "dark")
    f = _filters_from_inputs(start, end, sector, status, ttype)

    buffer = io.BytesIO()
    build_pdf(buffer, filters=f, theme=theme)
    buffer.seek(0)

    fname = f"zaiko-relatorio-{datetime.now().strftime('%Y%m%d-%H%M')}.pdf"
    return dcc.send_bytes(buffer.getvalue(), filename=fname)


# ---------- Bootstrap ---------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=DASH_PORT)
