package com.clothingstore.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "webhook_events")
public class WebhookEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "provider_event_id", nullable = false, unique = true)
    private String providerEventId;

    @Column(name = "event_type")
    private String eventType;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt = LocalDateTime.now();

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getProviderEventId() { return providerEventId; }
    public void setProviderEventId(String v) { this.providerEventId = v; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}