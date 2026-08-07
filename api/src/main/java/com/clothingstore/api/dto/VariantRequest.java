package com.clothingstore.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public class VariantRequest {

    @NotNull
    private UUID productId;

    @NotBlank
    private String sku;

    private String size;
    private String color;

    @NotNull
    @PositiveOrZero
    private Integer stockQty;

    private BigDecimal priceOverride;

    // Getters and setters
    public UUID getProductId() { return productId; }
    public void setProductId(UUID productId) { this.productId = productId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }

    public BigDecimal getPriceOverride() { return priceOverride; }
    public void setPriceOverride(BigDecimal priceOverride) { this.priceOverride = priceOverride; }
}