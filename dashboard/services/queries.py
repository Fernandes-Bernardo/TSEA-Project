from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Optional

import pandas as pd
from sqlalchemy import text

from services.db import get_engine


@dataclass(frozen=True)
class Filters:
    start: Optional[date] = None
    end: Optional[date] = None
    sector: Optional[str] = None
    status: Optional[str] = None
    tool_type: Optional[str] = None

    def loan_where(self) -> tuple[str, dict]:
        clauses: list[str] = []
        params: dict = {}
        if self.start:
            clauses.append("l.requested_at >= :start")
            params["start"] = datetime.combine(self.start, datetime.min.time())
        if self.end:
            clauses.append("l.requested_at < :end_excl")
            params["end_excl"] = datetime.combine(self.end + timedelta(days=1), datetime.min.time())
        if self.status and self.status != "todos":
            clauses.append("l.status = :status")
            params["status"] = self.status
        if self.sector and self.sector != "todos":
            clauses.append("u.sector = :sector")
            params["sector"] = self.sector
        where = " AND ".join(clauses) if clauses else "1=1"
        return where, params

    def item_where(self) -> tuple[str, dict]:
        clauses: list[str] = []
        params: dict = {}
        if self.tool_type and self.tool_type != "todos":
            clauses.append("li.tool_type = :tool_type")
            params["tool_type"] = self.tool_type
        where = " AND ".join(clauses) if clauses else "1=1"
        return where, params


def kpis(f: Filters) -> dict:
    where, params = f.loan_where()
    sql = f"""
        SELECT
          COUNT(*)                                                    AS total_loans,
          COUNT(*) FILTER (WHERE l.status = 'REQUESTED')              AS pending_delivery,
          COUNT(*) FILTER (WHERE l.status = 'DELIVERED')              AS active,
          COUNT(*) FILTER (WHERE l.status = 'RETURNED')               AS completed,
          COUNT(*) FILTER (WHERE l.status = 'CANCELLED')              AS cancelled,
          AVG(EXTRACT(EPOCH FROM (l.returned_at - l.delivered_at))/3600.0)
                                                                      AS avg_hours_in_use
        FROM loans l
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where}
    """
    with get_engine().connect() as conn:
        row = conn.execute(text(sql), params).mappings().first() or {}
    return {
        "total_loans":      int(row.get("total_loans") or 0),
        "pending_delivery": int(row.get("pending_delivery") or 0),
        "active":           int(row.get("active") or 0),
        "completed":        int(row.get("completed") or 0),
        "cancelled":        int(row.get("cancelled") or 0),
        "avg_hours_in_use": float(row.get("avg_hours_in_use") or 0.0),
    }


def stock_health() -> dict:
    sql = """
        SELECT
          COUNT(*)                                            AS total_items,
          COUNT(*) FILTER (WHERE quantity = 0)                AS out_of_stock,
          COUNT(*) FILTER (WHERE min_quantity > 0
                              AND quantity <= min_quantity
                              AND quantity > 0)               AS low_stock,
          COALESCE(SUM(quantity), 0)                          AS total_units
        FROM tools
    """
    with get_engine().connect() as conn:
        row = conn.execute(text(sql)).mappings().first() or {}
    return {
        "total_items":  int(row.get("total_items") or 0),
        "out_of_stock": int(row.get("out_of_stock") or 0),
        "low_stock":    int(row.get("low_stock") or 0),
        "total_units":  int(row.get("total_units") or 0),
    }


def loans_per_day(f: Filters) -> pd.DataFrame:
    where, params = f.loan_where()
    sql = f"""
        SELECT date_trunc('day', l.requested_at) AS day,
               COUNT(*)                          AS total,
               COUNT(*) FILTER (WHERE l.status IN ('DELIVERED','RETURNED')) AS delivered_or_returned
        FROM loans l
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where}
        GROUP BY 1
        ORDER BY 1
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def top_tools(f: Filters, limit: int = 10) -> pd.DataFrame:
    where_loan, params = f.loan_where()
    where_item, item_params = f.item_where()
    params = {**params, **item_params, "lim": limit}
    sql = f"""
        SELECT li.tool_name           AS tool,
               li.tool_type           AS tool_type,
               SUM(li.quantity)::int  AS units
        FROM loan_items li
        JOIN loans l ON l.id = li.loan_id
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where_loan} AND {where_item}
        GROUP BY 1, 2
        ORDER BY units DESC
        LIMIT :lim
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def loans_by_sector(f: Filters) -> pd.DataFrame:
    where, params = f.loan_where()
    sql = f"""
        SELECT COALESCE(u.sector, 'Sem setor') AS sector,
               COUNT(*)                        AS total
        FROM loans l
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where}
        GROUP BY 1
        ORDER BY total DESC
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def loans_by_status(f: Filters) -> pd.DataFrame:
    where, params = f.loan_where()
    sql = f"""
        SELECT l.status AS status, COUNT(*) AS total
        FROM loans l
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where}
        GROUP BY 1
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def top_users(f: Filters, limit: int = 10) -> pd.DataFrame:
    where, params = f.loan_where()
    params = {**params, "lim": limit}
    sql = f"""
        SELECT l.responsible_name                  AS responsible,
               COALESCE(u.sector, 'Sem setor')     AS sector,
               COUNT(*)                            AS loans
        FROM loans l
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where}
        GROUP BY 1, 2
        ORDER BY loans DESC
        LIMIT :lim
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def loans_by_tool_type(f: Filters) -> pd.DataFrame:
    where_loan, params = f.loan_where()
    sql = f"""
        SELECT li.tool_type                    AS tool_type,
               SUM(li.quantity)::int           AS units
        FROM loan_items li
        JOIN loans l ON l.id = li.loan_id
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where_loan}
        GROUP BY 1
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def loan_details(f: Filters, limit: int = 500) -> pd.DataFrame:
    where, params = f.loan_where()
    params = {**params, "lim": limit}
    sql = f"""
        SELECT l.id::text                       AS id,
               l.requested_at                   AS requested_at,
               l.delivered_at                   AS delivered_at,
               l.returned_at                    AS returned_at,
               l.status                         AS status,
               l.responsible_name               AS responsible,
               l.employee_id                    AS employee_id,
               COALESCE(u.sector, 'Sem setor')  AS sector,
               (SELECT SUM(quantity)::int FROM loan_items WHERE loan_id = l.id) AS total_items
        FROM loans l
        LEFT JOIN users u ON u.employee_id = l.employee_id
        WHERE {where}
        ORDER BY l.requested_at DESC
        LIMIT :lim
    """
    return pd.read_sql(text(sql), get_engine(), params=params)


def list_sectors() -> list[str]:
    sql = "SELECT DISTINCT sector FROM users WHERE sector IS NOT NULL ORDER BY 1"
    with get_engine().connect() as conn:
        return [r[0] for r in conn.execute(text(sql)).all()]
