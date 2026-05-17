package com.server.api.controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.server.api.dto.transaction.TransactionRequest;
import com.server.api.model.Transaction;
import com.server.api.service.TransactionService;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/transacoes")
public class TransactionController {
    private TransactionService transactionService;

    public TransactionController(TransactionService transactionService){
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody @Valid TransactionRequest request){
        var transaction = transactionService.createTransaction(request);

        return ResponseEntity
                .created(URI.create("api/transacoes/" + transaction.getId()))
                .body(transaction);
    }

    @PutMapping
    public ResponseEntity<Transaction> confirmeReturn(@RequestBody Integer id){
        var transaction = transactionService.getTransactionId(id);

        transactionService.confirmReturn(transaction.getId());


        return ResponseEntity
                .created(URI.create("api/transacoes/" + transaction.getId()))
                .body(transaction);
        
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(){
        return ResponseEntity.ok(transactionService.listTransactions());
    }

    @GetMapping("/{responsible}")
    public ResponseEntity<List<Transaction>> getByResponsible(@PathVariable String responsible){
        return ResponseEntity.ok(transactionService.getTransctionByResponsible(responsible));
    }

    @GetMapping("/search/{id}")
    public ResponseEntity<Transaction> getByResponsible(@PathVariable Integer id){
        return ResponseEntity.ok(transactionService.getTransactionId(id));
    }
}
