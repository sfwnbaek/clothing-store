package com.clothingstore.api.repository;

import com.clothingstore.api.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCartIdAndVariantId(UUID cartId, UUID variantId);

}