package com.clothingstore.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private String provider = "stripe";

    @Column(name = "provider_payment_id")
    private String providerPaymentId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderPaymentId() { return providerPaymentId; }
    public void setProviderPaymentId(String v) { this.providerPaymentId = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}