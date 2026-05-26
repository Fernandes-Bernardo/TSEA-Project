"""
Engine SQLAlchemy compartilhado.

A dashboard sempre lê do banco — não escreve. Por isso usamos um pool pequeno
e mantemos o engine como singleton por processo.
"""
from __future__ import annotations

from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from config import database_url


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    return create_engine(
        database_url(),
        pool_size=5,
        max_overflow=2,
        pool_pre_ping=True,
        future=True,
    )
