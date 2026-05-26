"""
Gera o relatório PDF a partir dos filtros atuais.

Usa ReportLab para a estrutura (capa, tabelas, parágrafos) e Kaleido
para renderizar as figures Plotly em PNG e embedá-las no PDF.

Layout:
  Página 1 — capa + sumário executivo (KPIs)
  Página 2 — gráficos (séries temporais, status, setor)
  Página 3 — gráficos (top tools, top users, tipos)
  Página 4+ — tabela detalhada (paginação automática do ReportLab)
"""
from __future__ import annotations

import io
import logging
from datetime import datetime
from typing import IO

import plotly.graph_objects as go
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from config import Theme
from components.charts import (
    sector_donut,
    status_donut,
    time_series,
    top_tools_bar,
    top_users_bar,
    type_distribution,
)
from services import queries
from services.queries import Filters

log = logging.getLogger(__name__)

# Cores do PDF (sempre tema claro — papel impresso)
BRAND_PRIMARY = colors.HexColor("#2C4F55")
BRAND_HIGHLIGHT = colors.HexColor("#C48248")
TEXT = colors.HexColor("#1A1F26")
MUTED = colors.HexColor("#5B6471")
BG_SOFT = colors.HexColor("#F5F2EF")
BORDER = colors.HexColor("#D9D2CB")


def _styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"],
            fontName="Helvetica-Bold", fontSize=22, leading=26,
            textColor=BRAND_PRIMARY, spaceAfter=4,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"],
            fontName="Helvetica-Bold", fontSize=13, leading=16,
            textColor=BRAND_PRIMARY, spaceBefore=10, spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body", parent=base["BodyText"],
            fontName="Helvetica", fontSize=10, leading=14, textColor=TEXT,
        ),
        "muted": ParagraphStyle(
            "muted", parent=base["BodyText"],
            fontName="Helvetica", fontSize=9, leading=12, textColor=MUTED,
        ),
        "kpi-label": ParagraphStyle(
            "kpi-label", fontName="Helvetica", fontSize=8, leading=10,
            textColor=MUTED, alignment=0,
        ),
        "kpi-value": ParagraphStyle(
            "kpi-value", fontName="Helvetica-Bold", fontSize=18, leading=22,
            textColor=BRAND_PRIMARY,
        ),
    }


def _fig_to_image(fig: go.Figure, *, width: float, height: float) -> Image:
    """Renderiza Plotly para PNG em memória e devolve um flowable Image."""
    fig = go.Figure(fig)
    # Para impressão, força layout claro (fundo branco)
    fig.update_layout(
        paper_bgcolor="white",
        plot_bgcolor="white",
        font_color="#1A1F26",
        xaxis=dict(gridcolor="#E5E0DA", linecolor="#B4ADA6"),
        yaxis=dict(gridcolor="#E5E0DA", linecolor="#B4ADA6"),
        margin=dict(l=50, r=30, t=20, b=40),
    )
    png_bytes = fig.to_image(format="png", width=900, height=int(900 * (height / width)), scale=2)
    return Image(io.BytesIO(png_bytes), width=width, height=height)


def _kpi_grid(kpis: dict, stock: dict, st: dict) -> Table:
    avg_h = kpis.get("avg_hours_in_use") or 0
    avg_str = f"{avg_h / 24:.1f}d" if avg_h >= 24 else f"{avg_h:.1f}h"
    low = stock.get("low_stock", 0) + stock.get("out_of_stock", 0)

    def cell(label: str, value: str, hint: str = "") -> Table:
        rows: list = [
            [Paragraph(label.upper(), st["kpi-label"])],
            [Paragraph(value, st["kpi-value"])],
        ]
        if hint:
            rows.append([Paragraph(hint, st["muted"])])
        t = Table(rows, colWidths=[5.2 * cm])
        t.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BG_SOFT),
                ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LINEBEFORE", (0, 0), (0, -1), 3, BRAND_HIGHLIGHT),
            ])
        )
        return t

    cards = [
        cell("Empréstimos no período", str(kpis.get("total_loans", 0)), "Todos os status"),
        cell("Aguardando entrega", str(kpis.get("pending_delivery", 0))),
        cell("Em uso", str(kpis.get("active", 0))),
        cell("Concluídos", str(kpis.get("completed", 0))),
        cell("Tempo médio em uso", avg_str, "Entrega → devolução"),
        cell("Itens em alerta", str(low), f"de {stock.get('total_items', 0)} cadastrados"),
    ]

    # 3 colunas × 2 linhas
    rows = [cards[0:3], cards[3:6]]
    t = Table(rows, colWidths=[5.5 * cm] * 3, rowHeights=[2.4 * cm, 2.4 * cm])
    t.setStyle(
        TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ])
    )
    return t


def _detail_table(f: Filters, st: dict) -> Table | Paragraph:
    df = queries.loan_details(f)
    if df.empty:
        return Paragraph("Sem empréstimos no período filtrado.", st["muted"])

    status_label = {
        "REQUESTED": "Aguardando",
        "DELIVERED": "Em uso",
        "RETURNED": "Concluído",
        "CANCELLED": "Cancelado",
    }

    header = ["Solicitado", "Responsável", "Crachá", "Setor", "Itens", "Status", "Devolvido"]
    rows = [header]
    for _, r in df.iterrows():
        rows.append([
            r["requested_at"].strftime("%d/%m/%Y %H:%M") if r["requested_at"] is not None and not _is_nat(r["requested_at"]) else "—",
            (r["responsible"] or "")[:30],
            str(r["employee_id"]),
            (r["sector"] or "")[:18],
            str(r["total_items"] or 0),
            status_label.get(r["status"], r["status"]),
            r["returned_at"].strftime("%d/%m/%Y %H:%M") if r["returned_at"] is not None and not _is_nat(r["returned_at"]) else "—",
        ])

    col_widths = [3.0 * cm, 4.0 * cm, 1.6 * cm, 2.8 * cm, 1.2 * cm, 2.4 * cm, 3.0 * cm]
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    t.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), BRAND_PRIMARY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_SOFT]),
            ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ])
    )
    return t


def _format_filter_summary(f: Filters) -> str:
    parts = []
    if f.start and f.end:
        parts.append(f"Período: {f.start.strftime('%d/%m/%Y')} a {f.end.strftime('%d/%m/%Y')}")
    elif f.start:
        parts.append(f"A partir de {f.start.strftime('%d/%m/%Y')}")
    elif f.end:
        parts.append(f"Até {f.end.strftime('%d/%m/%Y')}")
    if f.sector and f.sector != "todos":
        parts.append(f"Setor: {f.sector}")
    if f.status and f.status != "todos":
        parts.append(f"Status: {f.status}")
    if f.tool_type and f.tool_type != "todos":
        parts.append(f"Tipo: {'Ferramentas' if f.tool_type == 'DAILY_USE' else 'Consumíveis'}")
    return "  ·  ".join(parts) if parts else "Sem filtros aplicados"


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(
        2 * cm, 1.2 * cm,
        f"Zaiko · Relatório gerado em {datetime.now().strftime('%d/%m/%Y %H:%M')}",
    )
    canvas.drawRightString(
        A4[0] - 2 * cm, 1.2 * cm,
        f"Página {doc.page}",
    )
    canvas.restoreState()


def build_pdf(stream: IO[bytes], *, filters: Filters, theme: Theme) -> None:
    """
    Monta o PDF completo e escreve no stream fornecido.
    `theme` é só usado pra preview; o PDF sempre usa paleta clara/impressa.
    """
    st = _styles()
    doc = SimpleDocTemplate(
        stream,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=2 * cm,
        title="Zaiko · Relatório analítico",
        author="Zaiko",
    )

    elements: list = []

    # ----- Capa -----
    elements.append(Paragraph("Zaiko", ParagraphStyle(
        "brand", fontName="Helvetica-Bold", fontSize=28, leading=32,
        textColor=BRAND_HIGHLIGHT,
    )))
    elements.append(Paragraph("Relatório analítico de empréstimos", st["h1"]))
    elements.append(Paragraph(_format_filter_summary(filters), st["muted"]))
    elements.append(Spacer(1, 0.6 * cm))

    # ----- KPIs -----
    elements.append(Paragraph("Sumário executivo", st["h2"]))
    kpis = queries.kpis(filters)
    stock = queries.stock_health()
    elements.append(_kpi_grid(kpis, stock, st))
    elements.append(Spacer(1, 0.6 * cm))

    # ----- Gráfico de série temporal -----
    elements.append(Paragraph("Empréstimos ao longo do tempo", st["h2"]))
    try:
        elements.append(_fig_to_image(
            time_series(queries.loans_per_day(filters), theme),
            width=17 * cm, height=7 * cm,
        ))
    except Exception:  # noqa: BLE001
        log.exception("falha render time_series")
        elements.append(Paragraph("Não foi possível gerar este gráfico.", st["muted"]))

    elements.append(PageBreak())

    # ----- Página 2: dois gráficos lado a lado, status e setor -----
    elements.append(Paragraph("Distribuição por status", st["h2"]))
    try:
        elements.append(_fig_to_image(
            status_donut(queries.loans_by_status(filters), theme),
            width=17 * cm, height=7 * cm,
        ))
    except Exception:  # noqa: BLE001
        log.exception("falha render status_donut")

    elements.append(Paragraph("Distribuição por setor", st["h2"]))
    try:
        elements.append(_fig_to_image(
            sector_donut(queries.loans_by_sector(filters), theme),
            width=17 * cm, height=7 * cm,
        ))
    except Exception:  # noqa: BLE001
        log.exception("falha render sector_donut")

    elements.append(PageBreak())

    # ----- Página 3: tops -----
    elements.append(Paragraph("Top 10 itens solicitados", st["h2"]))
    try:
        elements.append(_fig_to_image(
            top_tools_bar(queries.top_tools(filters, limit=10), theme),
            width=17 * cm, height=8 * cm,
        ))
    except Exception:  # noqa: BLE001
        log.exception("falha render top_tools")

    elements.append(Paragraph("Top 10 colaboradores", st["h2"]))
    try:
        elements.append(_fig_to_image(
            top_users_bar(queries.top_users(filters, limit=10), theme),
            width=17 * cm, height=8 * cm,
        ))
    except Exception:  # noqa: BLE001
        log.exception("falha render top_users")

    elements.append(PageBreak())

    # ----- Página 4: tipo + tabela -----
    elements.append(Paragraph("Unidades por tipo", st["h2"]))
    try:
        elements.append(_fig_to_image(
            type_distribution(queries.loans_by_tool_type(filters), theme),
            width=17 * cm, height=6 * cm,
        ))
    except Exception:  # noqa: BLE001
        log.exception("falha render type_distribution")

    elements.append(Spacer(1, 0.4 * cm))
    elements.append(Paragraph("Empréstimos detalhados", st["h2"]))
    elements.append(_detail_table(filters, st))

    doc.build(elements, onFirstPage=_footer, onLaterPages=_footer)


def _is_nat(v) -> bool:
    return repr(v) == "NaT" or (hasattr(v, "__ne__") and v != v)  # noqa: PLR0124
