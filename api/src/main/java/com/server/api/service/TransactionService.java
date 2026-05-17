package com.server.api.service;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
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

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, ToolsRepository toolsRepository){
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.toolsRepository = toolsRepository;
    }

    public Transaction createTransaction(TransactionRequest request){
        var user = userRepository.findByEmployeeId(request.employeeId())
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));

        var tool = toolsRepository.findByName(request.toolName())
                                    .stream()
                                    .findAny()
                                    .orElseThrow(() -> new RuntimeException("Ferramenta/Insumo nao encontrado"));

        var transaction = new Transaction(user.getEmployeeId(),
                                            user.getName(),
                                            tool.getId(),
                                            tool.getName(),
                                            tool.getType(),
                                            request.toolQuantity()
                                        );

        transactionRepository.save(transaction);
        return transaction;
    }

    public List<Transaction> getTransctionByResponsible(String responsible){
        var transaction = transactionRepository.findByResponsible(responsible);
                                
        if(transaction.isEmpty()){
            throw new RuntimeException("Transacao nao encotrada");
        }

        return transaction;
    }

    public Transaction getTransactionId(Integer id){
        var transaction = transactionRepository.findById(id);

        if(transaction.isEmpty()){
            throw new RuntimeException("Transacao nao encotrada");
        }

        return transaction.get();
    }
    
    public void confirmReturn(Integer id){
        var transaction = transactionRepository.findById(id);

        if(transaction.isEmpty()){
            throw new RuntimeException("Transacao nao encontrada");
        }

        transaction.get().setReturnedDate(Instant.now());

        transactionRepository.save(transaction.get());

        transaction.get().setStatus(true);
    }

    public List<Transaction> listTransactions(){
        return transactionRepository.findAll();
    }
}
