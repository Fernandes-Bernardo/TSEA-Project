from __future__ import annotations

from dash import html, dcc


def layout(error: str | None = None) -> html.Div:
    return html.Div(
        className="login-shell",
        children=[
            html.Div(
                className="login-card",
                children=[
                    html.Div(
                        className="login-brand",
                        children=[
                            html.Span("Zaiko", className="login-brand-name"),
                            html.Span("Dashboard analítica", className="login-brand-sub"),
                        ],
                    ),
                    html.H2("Acesso restrito", className="login-title"),
                    html.P(
                        "Entre com uma conta de administrador do sistema.",
                        className="login-subtitle",
                    ),
                    html.Div(
                        className="login-form",
                        children=[
                            html.Label("Crachá (Employee ID)", htmlFor="login-id"),
                            dcc.Input(
                                id="login-id",
                                type="number",
                                placeholder="Ex.: 1",
                                className="login-input",
                                n_submit=0,
                            ),
                            html.Label("Senha", htmlFor="login-pwd"),
                            dcc.Input(
                                id="login-pwd",
                                type="password",
                                placeholder="••••••••",
                                className="login-input",
                                n_submit=0,
                            ),
                            html.Button(
                                "Entrar",
                                id="login-submit",
                                className="login-btn",
                                n_clicks=0,
                            ),
                            html.Div(
                                error or "",
                                id="login-error",
                                className="login-error",
                            ),
                        ],
                    ),
                ],
            )
        ],
    )
