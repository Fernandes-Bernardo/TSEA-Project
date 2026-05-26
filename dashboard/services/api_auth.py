"""
Autenticação da dashboard usando a API Spring Boot.

A dashboard NÃO mantém usuários próprios — delega o login a `/api/auth/login`,
extrai o JWT e exige role ROLE_ADMIN para acessar.
"""
from __future__ import annotations

import base64
import json
import logging
from dataclasses import dataclass
from typing import Optional

import requests

from config import API_URL

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class AuthResult:
    success: bool
    token: Optional[str] = None
    employee_id: Optional[int] = None
    role: Optional[str] = None
    error: Optional[str] = None


def _decode_jwt_payload(token: str) -> dict | None:
    try:
        payload = token.split(".")[1]
        # add padding for base64 decode
        padded = payload + "=" * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(padded))
    except Exception as ex:  # noqa: BLE001
        log.warning("Erro ao decodificar JWT: %s", ex)
        return None


def login(employee_id: int, password: str) -> AuthResult:
    """
    Faz login no backend e devolve token + papel.
    Só permite ADMIN — outros papéis recebem AuthResult(success=False, error=...).
    """
    try:
        resp = requests.post(
            f"{API_URL}/api/auth/login",
            json={"employeeId": int(employee_id), "password": password},
            timeout=8,
        )
    except requests.RequestException as ex:
        log.error("Falha ao contatar a API: %s", ex)
        return AuthResult(success=False, error="API indisponível.")

    if resp.status_code != 200:
        return AuthResult(success=False, error="Credenciais inválidas.")

    body = resp.json()
    token = body.get("token")
    payload = _decode_jwt_payload(token) if token else None
    if not payload:
        return AuthResult(success=False, error="Token inválido.")

    role = payload.get("role")
    if role != "ROLE_ADMIN":
        return AuthResult(success=False, error="Acesso restrito a administradores.")

    return AuthResult(
        success=True,
        token=token,
        employee_id=int(payload.get("sub")),
        role=role,
    )
