from __future__ import annotations

from dash import html


def kpi_card(label: str, value: str, *, hint: str = "", tone: str = "neutral") -> html.Div:
    return html.Div(
        className=f"kpi-card kpi-{tone}",
        children=[
            html.Span(label, className="kpi-label"),
            html.Span(value, className="kpi-value"),
            html.Span(hint, className="kpi-hint") if hint else None,
        ],
    )


def kpi_row(kpis: dict, stock: dict) -> html.Section:
    avg_h = kpis.get("avg_hours_in_use") or 0
    if avg_h >= 24:
        avg_label = f"{avg_h / 24:.1f}d"
    else:
        avg_label = f"{avg_h:.1f}h"

    return html.Section(
        className="kpi-row",
        children=[
            kpi_card("Empréstimos", str(kpis.get("total_loans", 0)), hint="no período", tone="primary"),
            kpi_card("Pendentes de entrega", str(kpis.get("pending_delivery", 0)), tone="warning"),
            kpi_card("Em uso", str(kpis.get("active", 0)), tone="info"),
            kpi_card("Concluídos", str(kpis.get("completed", 0)), tone="success"),
            kpi_card("Tempo médio em uso", avg_label, hint="entrega → devolução"),
            kpi_card(
                "Estoque baixo",
                str(stock.get("low_stock", 0) + stock.get("out_of_stock", 0)),
                hint=f"de {stock.get('total_items', 0)} itens",
                tone="danger" if stock.get("out_of_stock") else "warning",
            ),
        ],
    )
