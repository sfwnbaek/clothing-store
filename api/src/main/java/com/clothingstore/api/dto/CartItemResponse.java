package com.clothingstore.api.dto;

import com.clothingstore.api.entity.CartItem;

import java.math.BigDecimal;
import java.util.UUID;

public class CartItemResponse {

    private UUID id;
    private UUID variantId;
    private String productName;
    private String size;
    private String color;
    private BigDecimal price;
    private Integer quantity;

    public static CartItemResponse from(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.id = item.getId();
        response.variantId = item.getVariant().getId();
        response.productName = item.getVariant().getProduct().getName();
        response.size = item.getVariant().getSize();
        response.color = item.getVariant().getColor();
        response.price = item.getVariant().getPriceOverride() != null
                ? item.getVariant().getPriceOverride()
                : item.getVariant().getProduct().getBasePrice();
        response.quantity = item.getQuantity();
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}