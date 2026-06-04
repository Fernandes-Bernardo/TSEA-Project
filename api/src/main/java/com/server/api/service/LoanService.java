package com.server.api.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.server.api.dto.loan.LoanItemRequest;
import com.server.api.dto.loan.LoanRequest;
import com.server.api.dto.loan.ReturnItemRequest;
import com.server.api.model.Loan;
import com.server.api.model.LoanItem;
import com.server.api.model.LoanStatus;
import com.server.api.model.Tools;
import com.server.api.repository.LoanRepository;
import com.server.api.repository.ToolsRepository;
import com.server.api.repository.UserRepository;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final ToolsRepository toolsRepository;
    private final UserRepository userRepository;
    private final MqttPublisherService mqttPublisher;

    public LoanService(LoanRepository loanRepository,
                       ToolsRepository toolsRepository,
                       UserRepository userRepository,
                       MqttPublisherService mqttPublisher) {
        this.loanRepository = loanRepository;
        this.toolsRepository = toolsRepository;
        this.userRepository = userRepository;
        this.mqttPublisher = mqttPublisher;
    }

    /**
     * Usuário cria a solicitação. O estoque ainda NÃO é decrementado — só na entrega.
     * Mas validamos a disponibilidade no momento da solicitação para falhar cedo.
     */
    @Transactional
    public Loan createLoan(LoanRequest request) {
        var user = userRepository.findByEmployeeId(request.employeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empréstimo precisa de pelo menos um item");
        }

        // Consolida quantidades por toolId (caso o usuário adicione o mesmo item duas vezes)
        Map<UUID, Integer> consolidated = new HashMap<>();
        for (LoanItemRequest item : request.items()) {
            consolidated.merge(item.toolId(), item.quantity(), Integer::sum);
        }

        var loan = new Loan(user.getEmployeeId(), user.getName());
        if (request.notes() != null && !request.notes().isBlank()) {
            loan.setNotes(request.notes().trim());
        }

        for (var entry : consolidated.entrySet()) {
            UUID toolId = entry.getKey();
            int qty = entry.getValue();
            Tools tool = toolsRepository.findById(toolId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Item não encontrado: " + toolId));

            if (tool.getQuantity() < qty) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Estoque insuficiente para " + tool.getName()
                                + " (disponível: " + tool.getQuantity() + ")");
            }

            loan.addItem(new LoanItem(tool.getId(), tool.getName(), tool.getType(), qty));
        }

        return loanRepository.save(loan);
    }

    /**
     * Almoxarife confirma a entrega física. Valida que o crachá lido bate
     * com o do empréstimo, decrementa o estoque e marca o empréstimo como DELIVERED.
     * Se o empréstimo contém apenas consumíveis, já vai direto para RETURNED.
     */
    @Transactional
    public Loan deliverLoan(UUID loanId, Integer scannedEmployeeId, Integer almoxarifeEmployeeId) {
        var loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empréstimo não encontrado"));

        if (loan.getStatus() != LoanStatus.REQUESTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Empréstimo não está aguardando entrega");
        }

        if (!loan.getEmployeeId().equals(scannedEmployeeId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "O crachá lido não corresponde ao funcionário do empréstimo");
        }

        // Decrementa o estoque agora
        for (LoanItem item : loan.getItems()) {
            Tools tool = toolsRepository.findById(item.getToolId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Item não encontrado: " + item.getToolName()));
            if (tool.getQuantity() < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Estoque insuficiente para " + tool.getName());
            }
            tool.setQuantity(tool.getQuantity() - item.getQuantity());
            toolsRepository.save(tool);

            // Consumíveis já contam como "devolvidos" na entrega (não voltam fisicamente)
            if (item.getToolType() == Tools.TypeTool.CONSUMABLE) {
                item.setReturnedQuantity(item.getQuantity());
            }
        }

        loan.setDeliveredByEmployeeId(almoxarifeEmployeeId);
        loan.setDeliveredAt(Instant.now());

        // Se for SÓ consumíveis, fecha imediatamente
        if (loan.isConsumableOnly()) {
            loan.setStatus(LoanStatus.RETURNED);
            loan.setReturnedAt(Instant.now());
        } else {
            loan.setStatus(LoanStatus.DELIVERED);
        }

        Loan saved = loanRepository.save(loan);
        triggerHardwarePulses(saved);
        return saved;
    }

    private void triggerHardwarePulses(Loan loan) {
        var names = loan.getItems().stream()
                .map(LoanItem::getToolName)
                .toList();
        mqttPublisher.triggerForToolNames(names);
    }

    /**
     * Devolução parcial de um item específico do empréstimo.
     * Item consumível não pode ser devolvido (já foi consumido).
     */
    @Transactional
    public Loan returnItem(UUID loanId, ReturnItemRequest request) {
        var loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empréstimo não encontrado"));

        if (loan.getStatus() != LoanStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Empréstimo não está em uso (não pode receber devolução)");
        }

        LoanItem target = loan.getItems().stream()
                .filter(i -> i.getId().equals(request.loanItemId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item do empréstimo não encontrado"));

        if (target.getToolType() == Tools.TypeTool.CONSUMABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Itens consumíveis não podem ser devolvidos");
        }

        int pendente = target.getQuantity() - target.getReturnedQuantity();
        if (request.quantity() > pendente) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Quantidade devolvida maior que a pendente (" + pendente + ")");
        }

        target.setReturnedQuantity(target.getReturnedQuantity() + request.quantity());

        // Devolve ao estoque
        Tools tool = toolsRepository.findById(target.getToolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferramenta não encontrada"));
        tool.setQuantity(tool.getQuantity() + request.quantity());
        toolsRepository.save(tool);

        // Se todos os itens NÃO-consumíveis foram devolvidos, fecha o empréstimo
        boolean allReturned = loan.getItems().stream()
                .filter(i -> i.getToolType() != Tools.TypeTool.CONSUMABLE)
                .allMatch(i -> i.getReturnedQuantity().equals(i.getQuantity()));

        if (allReturned) {
            loan.setStatus(LoanStatus.RETURNED);
            loan.setReturnedAt(Instant.now());
        }

        return loanRepository.save(loan);
    }

    /**
     * Fecha o empréstimo inteiro de uma vez (atalho para confirmar todas as
     * devoluções pendentes em um clique).
     */
    @Transactional
    public Loan returnAll(UUID loanId) {
        var loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empréstimo não encontrado"));

        if (loan.getStatus() != LoanStatus.DELIVERED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Empréstimo não está em uso");
        }

        for (LoanItem item : loan.getItems()) {
            if (item.getToolType() == Tools.TypeTool.CONSUMABLE) continue;
            int pendente = item.getQuantity() - item.getReturnedQuantity();
            if (pendente <= 0) continue;

            Tools tool = toolsRepository.findById(item.getToolId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferramenta não encontrada"));
            tool.setQuantity(tool.getQuantity() + pendente);
            toolsRepository.save(tool);
            item.setReturnedQuantity(item.getQuantity());
        }

        loan.setStatus(LoanStatus.RETURNED);
        loan.setReturnedAt(Instant.now());
        return loanRepository.save(loan);
    }

    @Transactional
    public Loan cancelLoan(UUID loanId) {
        var loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empréstimo não encontrado"));
        if (loan.getStatus() != LoanStatus.REQUESTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Só é possível cancelar empréstimos ainda não entregues");
        }
        loan.setStatus(LoanStatus.CANCELLED);
        return loanRepository.save(loan);
    }

    public List<Loan> listAll() {
        return loanRepository.findAllByOrderByRequestedAtDesc();
    }

    public List<Loan> listByStatus(LoanStatus status) {
        return loanRepository.findByStatusOrderByRequestedAtDesc(status);
    }

    public List<Loan> listByEmployee(Integer employeeId) {
        return loanRepository.findByEmployeeIdOrderByRequestedAtDesc(employeeId);
    }

    public Loan getById(UUID id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empréstimo não encontrado"));
    }
}
