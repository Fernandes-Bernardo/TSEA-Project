package com.server.api.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.server.api.dto.loan.DeliverLoanRequest;
import com.server.api.dto.loan.LoanRequest;
import com.server.api.dto.loan.ReturnItemRequest;
import com.server.api.model.Loan;
import com.server.api.model.LoanStatus;
import com.server.api.service.LoanService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    /**
     * Usuário cria a solicitação. employeeId precisa bater com o do token
     * (a menos que seja admin/almoxarife criando em nome de outro).
     */
    @PostMapping
    public ResponseEntity<Loan> create(@RequestBody @Valid LoanRequest request,
                                       Authentication auth) {
        Integer tokenEmployeeId = parseEmployeeId(auth);
        boolean privileged = hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_ALMOXARIFE");
        if (!privileged && !request.employeeId().equals(tokenEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Não é possível criar empréstimo em nome de outro funcionário");
        }
        var loan = loanService.createLoan(request);
        return ResponseEntity.created(URI.create("/api/loans/" + loan.getId())).body(loan);
    }

    /**
     * Almoxarife / Admin confirma a entrega após validar o crachá do funcionário.
     */
    @PutMapping("/{id}/deliver")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALMOXARIFE')")
    public ResponseEntity<Loan> deliver(@PathVariable UUID id,
                                        @RequestBody @Valid DeliverLoanRequest body,
                                        Authentication auth) {
        Integer almoxarifeId = parseEmployeeId(auth);
        return ResponseEntity.ok(loanService.deliverLoan(id, body.scannedEmployeeId(), almoxarifeId));
    }

    /**
     * Devolução parcial de um item específico do empréstimo.
     */
    @PutMapping("/{id}/return-item")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALMOXARIFE')")
    public ResponseEntity<Loan> returnItem(@PathVariable UUID id,
                                           @RequestBody @Valid ReturnItemRequest body) {
        return ResponseEntity.ok(loanService.returnItem(id, body));
    }

    /**
     * Fecha o empréstimo inteiro (devolve tudo o que ainda está pendente).
     */
    @PutMapping("/{id}/return")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALMOXARIFE')")
    public ResponseEntity<Loan> returnAll(@PathVariable UUID id) {
        return ResponseEntity.ok(loanService.returnAll(id));
    }

    /**
     * Usuário pode cancelar a própria solicitação enquanto não foi entregue.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Loan> cancel(@PathVariable UUID id, Authentication auth) {
        Integer tokenEmployeeId = parseEmployeeId(auth);
        boolean privileged = hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_ALMOXARIFE");
        var loan = loanService.getById(id);
        if (!privileged && !loan.getEmployeeId().equals(tokenEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você só pode cancelar seus próprios empréstimos");
        }
        return ResponseEntity.ok(loanService.cancelLoan(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALMOXARIFE')")
    public ResponseEntity<List<Loan>> listAll() {
        return ResponseEntity.ok(loanService.listAll());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALMOXARIFE')")
    public ResponseEntity<List<Loan>> listPending() {
        return ResponseEntity.ok(loanService.listByStatus(LoanStatus.REQUESTED));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ALMOXARIFE')")
    public ResponseEntity<List<Loan>> listActive() {
        return ResponseEntity.ok(loanService.listByStatus(LoanStatus.DELIVERED));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Loan>> listByEmployee(@PathVariable Integer employeeId,
                                                    Authentication auth) {
        Integer tokenEmployeeId = parseEmployeeId(auth);
        boolean privileged = hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_ALMOXARIFE");
        if (!privileged && !employeeId.equals(tokenEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Acesso restrito aos próprios empréstimos");
        }
        return ResponseEntity.ok(loanService.listByEmployee(employeeId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Loan>> listMine(Authentication auth) {
        Integer me = parseEmployeeId(auth);
        return ResponseEntity.ok(loanService.listByEmployee(me));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getById(@PathVariable UUID id, Authentication auth) {
        var loan = loanService.getById(id);
        Integer tokenEmployeeId = parseEmployeeId(auth);
        boolean privileged = hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_ALMOXARIFE");
        if (!privileged && !loan.getEmployeeId().equals(tokenEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
        return ResponseEntity.ok(loan);
    }

    // ----- helpers -----

    private static Integer parseEmployeeId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não autenticado");
        }
        try {
            return Integer.valueOf(auth.getName());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
        }
    }

    private static boolean hasRole(Authentication auth, String role) {
        if (auth == null) return false;
        return auth.getAuthorities().stream().anyMatch(a -> role.equals(a.getAuthority()));
    }
}
