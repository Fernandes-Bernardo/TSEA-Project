from __future__ import annotations

import io
import logging
from datetime import datetime
from typing import IO

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
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

from services import queries
from services.queries import Filters

log = logging.getLogger(__name__)

BRAND_PRIMARY = colors.HexColor("#2C4F55")
BRAND_HIGHLIGHT = colors.HexColor("#C48248")
TEXT = colors.HexColor("#1A1F26")
MUTED = colors.HexColor("#5B6471")
BG_SOFT = colors.HexColor("#F5F2EF")
BORDER = colors.HexColor("#D9D2CB")

MPL_PALETTE = [
    "#C48248", "#2C4F55", "#D97706", "#16A34A",
    "#1D4ED8", "#7C3AED", "#DB2777", "#475569",
]
MPL_TEXT = "#1A1F26"
MPL_MUTED = "#5B6471"
MPL_GRID = "#E5E0DA"


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


def _new_axes(width_in: float = 9.0, height_in: float = 4.0):
    fig, ax = plt.subplots(figsize=(width_in, height_in), dpi=110)
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    for spine in ("left", "bottom"):
        ax.spines[spine].set_color(MPL_MUTED)
    ax.tick_params(colors=MPL_MUTED, labelsize=9)
    ax.grid(True, color=MPL_GRID, linestyle="-", linewidth=0.6, axis="y")
    ax.title.set_color(MPL_TEXT)
    return fig, ax


def _fig_to_image(fig, *, width: float, height: float) -> Image:
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png", dpi=110, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    buf.seek(0)
    return Image(buf, width=width, height=height)


def _chart_timeseries(df: pd.DataFrame) -> Image:
    fig, ax = _new_axes(9.0, 3.5)
    if df.empty:
        ax.text(0.5, 0.5, "Nenhum empréstimo no período",
                ha="center", va="center", color=MPL_MUTED, fontsize=11)
        ax.set_xticks([]); ax.set_yticks([])
    else:
        days = pd.to_datetime(df["day"])
        ax.fill_between(days, df["total"], color=MPL_PALETTE[0], alpha=0.18)
        ax.plot(days, df["total"], color=MPL_PALETTE[0], linewidth=2.2,
                marker="o", markersize=5, label="Empréstimos")
        ax.plot(days, df["delivered_or_returned"], color=MPL_PALETTE[1],
                linewidth=1.4, linestyle="--", label="Entregues/Concluídos")
        ax.legend(loc="upper left", frameon=False, fontsize=9, labelcolor=MPL_TEXT)
        fig.autofmt_xdate(rotation=30)
        ax.set_ylabel("Quantidade", color=MPL_MUTED, fontsize=9)
    return _fig_to_image(fig, width=17 * cm, height=7 * cm)


def _chart_top_tools(df: pd.DataFrame) -> Image:
    fig, ax = _new_axes(9.0, 4.0)
    if df.empty:
        ax.text(0.5, 0.5, "Sem dados", ha="center", va="center",
                color=MPL_MUTED, fontsize=11)
        ax.set_xticks([]); ax.set_yticks([])
    else:
        df = df.sort_values("units")
        bar_colors = [
            MPL_PALETTE[0] if t == "DAILY_USE" else MPL_PALETTE[1]
            for t in df["tool_type"]
        ]
        ax.barh(df["tool"], df["units"], color=bar_colors)
        for i, v in enumerate(df["units"]):
            ax.text(v, i, f"  {int(v)}", va="center", color=MPL_TEXT, fontsize=9)
        ax.set_xlabel("Unidades", color=MPL_MUTED, fontsize=9)
        ax.grid(True, color=MPL_GRID, linestyle="-", linewidth=0.6, axis="x")
        ax.grid(False, axis="y")
    return _fig_to_image(fig, width=17 * cm, height=8 * cm)


def _chart_top_users(df: pd.DataFrame) -> Image:
    fig, ax = _new_axes(9.0, 4.0)
    if df.empty:
        ax.text(0.5, 0.5, "Sem registros", ha="center", va="center",
                color=MPL_MUTED, fontsize=11)
        ax.set_xticks([]); ax.set_yticks([])
    else:
        df = df.sort_values("loans")
        ax.barh(df["responsible"], df["loans"], color=MPL_PALETTE[1])
        for i, v in enumerate(df["loans"]):
            ax.text(v, i, f"  {int(v)}", va="center", color=MPL_TEXT, fontsize=9)
        ax.set_xlabel("Empréstimos", color=MPL_MUTED, fontsize=9)
        ax.grid(True, color=MPL_GRID, linestyle="-", linewidth=0.6, axis="x")
        ax.grid(False, axis="y")
    return _fig_to_image(fig, width=17 * cm, height=8 * cm)


def _chart_donut_status(df: pd.DataFrame) -> Image:
    fig, ax = _new_axes(6.0, 4.0)
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
    ax.axis("off")
    if df.empty:
        ax.text(0.5, 0.5, "Sem dados", ha="center", va="center",
                color=MPL_MUTED, fontsize=11, transform=ax.transAxes)
    else:
        status_label = {
            "REQUESTED": "Aguardando",
            "DELIVERED": "Em uso",
            "RETURNED": "Concluídos",
            "CANCELLED": "Cancelados",
        }
        palette_map = {
            "REQUESTED": "#D97706",
            "DELIVERED": "#2C4F55",
            "RETURNED": "#16A34A",
            "CANCELLED": "#475569",
        }
        labels = [status_label.get(s, s) for s in df["status"]]
        sizes = df["total"]
        colors_ = [palette_map.get(s, MPL_PALETTE[0]) for s in df["status"]]
        wedges, _texts, autotexts = ax.pie(
            sizes, labels=labels, colors=colors_,
            wedgeprops=dict(width=0.45, edgecolor="white"),
            autopct="%1.0f%%", pctdistance=0.78,
            textprops=dict(color=MPL_TEXT, fontsize=9),
        )
        for at in autotexts:
            at.set_color("white")
            at.set_fontsize(8)
    return _fig_to_image(fig, width=17 * cm, height=7 * cm)


def _chart_donut_sector(df: pd.DataFrame) -> Image:
    fig, ax = _new_axes(6.0, 4.0)
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
    ax.axis("off")
    if df.empty:
        ax.text(0.5, 0.5, "Sem dados", ha="center", va="center",
                color=MPL_MUTED, fontsize=11, transform=ax.transAxes)
    else:
        colors_ = (MPL_PALETTE * 4)[: len(df)]
        wedges, _texts, autotexts = ax.pie(
            df["total"], labels=df["sector"], colors=colors_,
            wedgeprops=dict(width=0.45, edgecolor="white"),
            autopct="%1.0f%%", pctdistance=0.78,
            textprops=dict(color=MPL_TEXT, fontsize=9),
        )
        for at in autotexts:
            at.set_color("white")
            at.set_fontsize(8)
    return _fig_to_image(fig, width=17 * cm, height=7 * cm)


def _chart_type(df: pd.DataFrame) -> Image:
    fig, ax = _new_axes(8.0, 3.2)
    if df.empty:
        ax.text(0.5, 0.5, "Sem dados", ha="center", va="center",
                color=MPL_MUTED, fontsize=11)
        ax.set_xticks([]); ax.set_yticks([])
    else:
        label_map = {"DAILY_USE": "Ferramentas", "CONSUMABLE": "Consumíveis"}
        labels = [label_map.get(t, t) for t in df["tool_type"]]
        bar_colors = [MPL_PALETTE[0] if t == "DAILY_USE" else MPL_PALETTE[1]
                      for t in df["tool_type"]]
        bars = ax.bar(labels, df["units"], color=bar_colors)
        for b, v in zip(bars, df["units"]):
            ax.text(b.get_x() + b.get_width() / 2, v, f" {int(v)}",
                    ha="center", va="bottom", color=MPL_TEXT, fontsize=10)
        ax.set_ylabel("Unidades", color=MPL_MUTED, fontsize=9)
    return _fig_to_image(fig, width=17 * cm, height=6 * cm)


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


def build_pdf(stream: IO[bytes], *, filters: Filters) -> None:
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

    elements.append(Paragraph("Zaiko", ParagraphStyle(
        "brand", fontName="Helvetica-Bold", fontSize=28, leading=32,
        textColor=BRAND_HIGHLIGHT,
    )))
    elements.append(Paragraph("Relatório analítico de empréstimos", st["h1"]))
    elements.append(Paragraph(_format_filter_summary(filters), st["muted"]))
    elements.append(Spacer(1, 0.6 * cm))

    elements.append(Paragraph("Sumário executivo", st["h2"]))
    kpis = queries.kpis(filters)
    stock = queries.stock_health()
    elements.append(_kpi_grid(kpis, stock, st))
    elements.append(Spacer(1, 0.6 * cm))

    elements.append(Paragraph("Empréstimos ao longo do tempo", st["h2"]))
    try:
        elements.append(_chart_timeseries(queries.loans_per_day(filters)))
    except Exception:
        log.exception("falha render time_series")
        elements.append(Paragraph("Não foi possível gerar este gráfico.", st["muted"]))

    elements.append(PageBreak())

    elements.append(Paragraph("Distribuição por status", st["h2"]))
    try:
        elements.append(_chart_donut_status(queries.loans_by_status(filters)))
    except Exception:
        log.exception("falha render status")

    elements.append(Paragraph("Distribuição por setor", st["h2"]))
    try:
        elements.append(_chart_donut_sector(queries.loans_by_sector(filters)))
    except Exception:
        log.exception("falha render sector")

    elements.append(PageBreak())

    elements.append(Paragraph("Top 10 itens solicitados", st["h2"]))
    try:
        elements.append(_chart_top_tools(queries.top_tools(filters, limit=10)))
    except Exception:
        log.exception("falha render top_tools")

    elements.append(Paragraph("Top 10 colaboradores", st["h2"]))
    try:
        elements.append(_chart_top_users(queries.top_users(filters, limit=10)))
    except Exception:
        log.exception("falha render top_users")

    elements.append(PageBreak())

    elements.append(Paragraph("Unidades por tipo", st["h2"]))
    try:
        elements.append(_chart_type(queries.loans_by_tool_type(filters)))
    except Exception:
        log.exception("falha render type_distribution")

    elements.append(Spacer(1, 0.4 * cm))
    elements.append(Paragraph("Empréstimos detalhados", st["h2"]))
    elements.append(_detail_table(filters, st))

    doc.build(elements, onFirstPage=_footer, onLaterPages=_footer)


def _is_nat(v) -> bool:
    return repr(v) == "NaT" or (hasattr(v, "__ne__") and v != v)
