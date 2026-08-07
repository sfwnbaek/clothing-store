package com.clothingstore.api.dto;

import com.clothingstore.api.entity.ProductVariant;

import java.math.BigDecimal;
import java.util.UUID;

public class ProductVariantResponse {

    private UUID id;
    private String size;
    private String color;
    private BigDecimal price;
    private Integer stockQty;

    public static ProductVariantResponse from(ProductVariant variant) {
        ProductVariantResponse response = new ProductVariantResponse();
        response.id = variant.getId();
        response.size = variant.getSize();
        response.color = variant.getColor();
        response.price = variant.getPriceOverride() != null
                ? variant.getPriceOverride()
                : variant.getProduct().getBasePrice();
        response.stockQty = variant.getStockQty();
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockQty() { return stockQty; }
    public void setStockQty(Integer stockQty) { this.stockQty = stockQty; }
}