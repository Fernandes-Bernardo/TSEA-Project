from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


API_URL = os.getenv("API_URL", "http://localhost:8080").rstrip("/")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "apiTsea")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

DASH_SECRET_KEY = os.getenv("DASH_SECRET_KEY", "change-me")
DASH_PORT = int(os.getenv("DASH_PORT", "8050"))


def database_url() -> str:
    return (
        f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )


@dataclass(frozen=True)
class Theme:
    name: str
    bg: str
    surface: str
    surface_alt: str
    border: str
    text: str
    text_muted: str
    primary: str
    highlight: str
    success: str
    warning: str
    danger: str
    grid: str
    palette: tuple[str, ...]

    def to_plotly_template(self) -> dict:
        return {
            "layout": {
                "paper_bgcolor": self.surface,
                "plot_bgcolor": self.surface,
                "font": {"color": self.text, "family": "Inter, system-ui, sans-serif"},
                "colorway": list(self.palette),
                "xaxis": {
                    "gridcolor": self.grid,
                    "linecolor": self.border,
                    "zerolinecolor": self.grid,
                    "tickcolor": self.border,
                },
                "yaxis": {
                    "gridcolor": self.grid,
                    "linecolor": self.border,
                    "zerolinecolor": self.grid,
                    "tickcolor": self.border,
                },
                "legend": {"font": {"color": self.text}, "bgcolor": "rgba(0,0,0,0)"},
                "margin": {"l": 50, "r": 30, "t": 40, "b": 40},
            }
        }


DARK = Theme(
    name="dark",
    bg="#15191F",
    surface="#1D2330",
    surface_alt="#252D3D",
    border="#2F384B",
    text="#E6E9EE",
    text_muted="#8C95A6",
    primary="#3F8A93",
    highlight="#E0975A",
    success="#4ADE80",
    warning="#FBBF24",
    danger="#F87171",
    grid="#262E3D",
    palette=(
        "#E0975A",
        "#3F8A93",
        "#FBBF24",
        "#4ADE80",
        "#60A5FA",
        "#A78BFA",
        "#F472B6",
        "#94A3B8",
    ),
)


LIGHT = Theme(
    name="light",
    bg="#BEBEBE",
    surface="#D9D9D9",
    surface_alt="#E9E9E9",
    border="#2C4F55",
    text="#1A1F26",
    text_muted="#4A5563",
    primary="#2C4F55",
    highlight="#C48248",
    success="#16A34A",
    warning="#D97706",
    danger="#DC2626",
    grid="#B5B5B5",
    palette=(
        "#C48248",
        "#2C4F55",
        "#D97706",
        "#16A34A",
        "#1D4ED8",
        "#7C3AED",
        "#DB2777",
        "#475569",
    ),
)


def get_theme(name: str) -> Theme:
    return DARK if (name or "").lower() == "dark" else LIGHT
