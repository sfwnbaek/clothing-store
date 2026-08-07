package com.clothingstore.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class AddCartItemRequest {

    @NotNull
    private UUID variantId;

    @Min(1)
    private Integer quantity = 1;

    // Getters and setters
    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}