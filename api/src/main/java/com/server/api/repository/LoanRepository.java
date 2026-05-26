package com.server.api.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.server.api.model.Loan;
import com.server.api.model.LoanStatus;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {

    List<Loan> findByEmployeeIdOrderByRequestedAtDesc(Integer employeeId);

    List<Loan> findByStatusOrderByRequestedAtDesc(LoanStatus status);

    List<Loan> findAllByOrderByRequestedAtDesc();
}
