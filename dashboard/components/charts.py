"""
Construtores de Figures Plotly.

Cada função recebe um DataFrame já agregado + o tema atual e devolve uma
figure pronta para ser plotada. Mantemos o estilo (margens, hover, etc.)
centralizado aqui.
"""
from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go

from config import Theme


def _apply_theme(fig: go.Figure, theme: Theme, *, title: str | None = None) -> go.Figure:
    fig.update_layout(theme.to_plotly_template()["layout"])
    if title:
        fig.update_layout(
            title=dict(
                text=title,
                x=0.0,
                xanchor="left",
                font=dict(color=theme.text, size=14),
            )
        )
    fig.update_layout(
        hoverlabel=dict(bgcolor=theme.surface_alt, font_color=theme.text, bordercolor=theme.border),
    )
    return fig


def time_series(df: pd.DataFrame, theme: Theme) -> go.Figure:
    if df.empty:
        return _empty(theme, "Nenhum empréstimo no período")
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=df["day"],
            y=df["total"],
            mode="lines+markers",
            name="Empréstimos",
            line=dict(color=theme.highlight, width=3, shape="spline", smoothing=0.7),
            marker=dict(size=7, color=theme.highlight, line=dict(color=theme.surface, width=2)),
            fill="tozeroy",
            fillcolor=_alpha(theme.highlight, 0.15),
            hovertemplate="<b>%{x|%d/%m/%Y}</b><br>%{y} empréstimos<extra></extra>",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=df["day"],
            y=df["delivered_or_returned"],
            mode="lines",
            name="Entregues/Concluídos",
            line=dict(color=theme.primary, width=2, dash="dot"),
            hovertemplate="<b>%{x|%d/%m/%Y}</b><br>%{y} entregues<extra></extra>",
        )
    )
    fig.update_yaxes(rangemode="tozero")
    return _apply_theme(fig, theme)


def top_tools_bar(df: pd.DataFrame, theme: Theme) -> go.Figure:
    if df.empty:
        return _empty(theme, "Nenhum item")
    df = df.sort_values("units")
    colors = [theme.highlight if t == "DAILY_USE" else theme.primary for t in df["tool_type"]]
    fig = go.Figure(
        go.Bar(
            x=df["units"],
            y=df["tool"],
            orientation="h",
            marker=dict(color=colors),
            text=df["units"],
            textposition="outside",
            hovertemplate="<b>%{y}</b><br>%{x} unidade(s)<extra></extra>",
        )
    )
    fig.update_layout(margin=dict(l=140, r=40, t=20, b=30))
    return _apply_theme(fig, theme)


def sector_donut(df: pd.DataFrame, theme: Theme) -> go.Figure:
    if df.empty:
        return _empty(theme, "Sem dados")
    fig = go.Figure(
        go.Pie(
            labels=df["sector"],
            values=df["total"],
            hole=0.55,
            sort=False,
            marker=dict(colors=list(theme.palette), line=dict(color=theme.surface, width=2)),
            textinfo="percent",
            textfont=dict(color=theme.text),
            hovertemplate="<b>%{label}</b><br>%{value} (%{percent})<extra></extra>",
        )
    )
    fig.update_layout(showlegend=True, legend=dict(orientation="v"))
    return _apply_theme(fig, theme)


STATUS_LABEL = {
    "REQUESTED": "Aguardando",
    "DELIVERED": "Em uso",
    "RETURNED": "Concluídos",
    "CANCELLED": "Cancelados",
}


def status_donut(df: pd.DataFrame, theme: Theme) -> go.Figure:
    if df.empty:
        return _empty(theme, "Sem dados")
    df = df.copy()
    df["label"] = df["status"].map(STATUS_LABEL).fillna(df["status"])
    palette = {
        "REQUESTED": theme.warning,
        "DELIVERED": theme.primary,
        "RETURNED": theme.success,
        "CANCELLED": theme.text_muted,
    }
    colors = [palette.get(s, theme.highlight) for s in df["status"]]
    fig = go.Figure(
        go.Pie(
            labels=df["label"],
            values=df["total"],
            hole=0.55,
            marker=dict(colors=colors, line=dict(color=theme.surface, width=2)),
            textinfo="percent",
            textfont=dict(color=theme.text),
            hovertemplate="<b>%{label}</b><br>%{value} (%{percent})<extra></extra>",
        )
    )
    return _apply_theme(fig, theme)


def top_users_bar(df: pd.DataFrame, theme: Theme) -> go.Figure:
    if df.empty:
        return _empty(theme, "Sem registros")
    df = df.sort_values("loans")
    fig = go.Figure(
        go.Bar(
            x=df["loans"],
            y=df["responsible"],
            orientation="h",
            marker=dict(color=theme.primary),
            text=df["loans"],
            textposition="outside",
            customdata=df["sector"],
            hovertemplate="<b>%{y}</b><br>%{x} empréstimos<br>Setor: %{customdata}<extra></extra>",
        )
    )
    fig.update_layout(margin=dict(l=140, r=40, t=20, b=30))
    return _apply_theme(fig, theme)


def type_distribution(df: pd.DataFrame, theme: Theme) -> go.Figure:
    if df.empty:
        return _empty(theme, "Sem dados")
    label_map = {"DAILY_USE": "Ferramentas", "CONSUMABLE": "Consumíveis"}
    df = df.copy()
    df["label"] = df["tool_type"].map(label_map).fillna(df["tool_type"])
    colors = [theme.highlight if t == "DAILY_USE" else theme.primary for t in df["tool_type"]]
    fig = go.Figure(
        go.Bar(
            x=df["label"],
            y=df["units"],
            marker=dict(color=colors),
            text=df["units"],
            textposition="outside",
            hovertemplate="<b>%{x}</b><br>%{y} unidades<extra></extra>",
        )
    )
    fig.update_layout(margin=dict(l=40, r=30, t=20, b=30))
    return _apply_theme(fig, theme)


# ---------- helpers ----------------------------------------------------------

def _alpha(hex_color: str, alpha: float) -> str:
    c = hex_color.lstrip("#")
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    return f"rgba({r}, {g}, {b}, {alpha})"


def _empty(theme: Theme, msg: str) -> go.Figure:
    fig = go.Figure()
    fig.add_annotation(
        text=msg,
        showarrow=False,
        font=dict(color=theme.text_muted, size=14),
        x=0.5,
        y=0.5,
        xref="paper",
        yref="paper",
    )
    fig.update_layout(theme.to_plotly_template()["layout"])
    fig.update_xaxes(visible=False)
    fig.update_yaxes(visible=False)
    return fig
