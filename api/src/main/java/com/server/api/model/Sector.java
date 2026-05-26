package com.server.api.model;

import java.util.Arrays;
import java.util.List;

/**
 * Setores padronizados da empresa. Mantemos como classe utilitária (não enum JPA)
 * para que o valor armazenado seja uma string legível e fácil de evoluir.
 */
public final class Sector {

    private Sector() {}

    public static final List<String> VALUES = Arrays.asList(
            "Almoxarifado",
            "Administrativo",
            "Compras",
            "Comercial",
            "Contabilidade",
            "Engenharia",
            "Expedição",
            "Financeiro",
            "Jurídico",
            "Logística",
            "Manutenção",
            "Marketing",
            "Mecânica",
            "Montagem",
            "PCP",
            "Pintura",
            "Produção",
            "Projetos",
            "Qualidade",
            "RH",
            "Segurança do Trabalho",
            "Solda",
            "TI",
            "Usinagem"
    );

    public static boolean isValid(String value) {
        if (value == null) return false;
        return VALUES.contains(value);
    }
}
