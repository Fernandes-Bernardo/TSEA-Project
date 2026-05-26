"""Barra de filtros do header."""
from __future__ import annotations

from datetime import date, timedelta

from dash import html, dcc


STATUS_OPTIONS = [
    {"label": "Todos os status", "value": "todos"},
    {"label": "Aguardando entrega", "value": "REQUESTED"},
    {"label": "Em uso", "value": "DELIVERED"},
    {"label": "Concluídos", "value": "RETURNED"},
    {"label": "Cancelados", "value": "CANCELLED"},
]

TYPE_OPTIONS = [
    {"label": "Todos os tipos", "value": "todos"},
    {"label": "Ferramentas", "value": "DAILY_USE"},
    {"label": "Consumíveis", "value": "CONSUMABLE"},
]


def filters_bar(sectors: list[str]) -> html.Section:
    today = date.today()
    start = today - timedelta(days=30)
    return html.Section(
        className="filters-bar",
        children=[
            html.Div(
                className="filter-field",
                children=[
                    html.Label("Período"),
                    dcc.DatePickerRange(
                        id="flt-period",
                        start_date=start,
                        end_date=today,
                        display_format="DD/MM/YYYY",
                        first_day_of_week=1,
                        className="filter-datepicker",
                    ),
                ],
            ),
            html.Div(
                className="filter-field",
                children=[
                    html.Label("Setor"),
                    dcc.Dropdown(
                        id="flt-sector",
                        options=[{"label": "Todos os setores", "value": "todos"}]
                        + [{"label": s, "value": s} for s in sectors],
                        value="todos",
                        clearable=False,
                    ),
                ],
            ),
            html.Div(
                className="filter-field",
                children=[
                    html.Label("Status"),
                    dcc.Dropdown(id="flt-status", options=STATUS_OPTIONS, value="todos", clearable=False),
                ],
            ),
            html.Div(
                className="filter-field",
                children=[
                    html.Label("Tipo"),
                    dcc.Dropdown(id="flt-type", options=TYPE_OPTIONS, value="todos", clearable=False),
                ],
            ),
            html.Div(
                className="filter-actions",
                children=[
                    html.Button(
                        [
                            html.Span("Exportar PDF", className="btn-label"),
                        ],
                        id="btn-export-pdf",
                        className="btn-export",
                        n_clicks=0,
                    ),
                    dcc.Download(id="pdf-download"),
                ],
            ),
        ],
    )
