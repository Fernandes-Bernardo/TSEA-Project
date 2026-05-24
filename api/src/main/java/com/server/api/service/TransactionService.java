package com.server.api.service;

import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.server.api.dto.transaction.TransactionRequest;
import com.server.api.model.Transaction;
import com.server.api.repository.ToolsRepository;
import com.server.api.repository.TransactionRepository;
import com.server.api.repository.UserRepository;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ToolsRepository toolsRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, ToolsRepository toolsRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.toolsRepository = toolsRepository;
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        var user = userRepository.findByEmployeeId(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        var tool = toolsRepository.findByName(request.toolName())
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferramenta/Insumo não encontrado"));

        if (tool.getQuantity() < request.toolQuantity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Estoque insuficiente");
        }

        tool.setQuantity(tool.getQuantity() - request.toolQuantity());
        toolsRepository.save(tool);

        var transaction = new Transaction(user.getEmployeeId(),
                user.getName(),
                tool.getId(),
                tool.getName(),
                tool.getType(),
                request.toolQuantity());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransctionByResponsible(String responsible) {
        return transactionRepository.findByResponsible(responsible);
    }

    public List<Transaction> getByEmployeeId(Integer employeeId) {
        return transactionRepository.findAll().stream()
                .filter(t -> employeeId.equals(t.getEmployee_id()))
                .toList();
    }

    public Transaction getTransactionId(Integer id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));
    }

    @Transactional
    public Transaction confirmReturn(Integer id) {
        var transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transação não encontrada"));

        if (Boolean.TRUE.equals(transaction.getStatus())) {
            return transaction;
        }

        var tool = toolsRepository.findById(transaction.getToolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferramenta não encontrada"));
        tool.setQuantity(tool.getQuantity() + transaction.getToolQuantity());
        toolsRepository.save(tool);

        transaction.setReturnedDate(Instant.now());
        transaction.setStatus(true);

        return transactionRepository.save(transaction);
    }

    public List<Transaction> listTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> listPending() {
        return transactionRepository.findAll()
                .stream()
                .filter(t -> !Boolean.TRUE.equals(t.getStatus()))
                .toList();
    }
}
