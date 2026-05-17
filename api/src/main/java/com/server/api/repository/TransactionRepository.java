package com.server.api.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.server.api.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>{

    List<Transaction> findByResponsible(String responsible);
}
