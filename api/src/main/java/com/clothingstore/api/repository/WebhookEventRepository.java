package com.clothingstore.api.repository;

import com.clothingstore.api.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {

    boolean existsByProviderEventId(String providerEventId);

}