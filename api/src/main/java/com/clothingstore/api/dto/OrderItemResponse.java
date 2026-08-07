package com.clothingstore.api.dto;

import com.clothingstore.api.entity.OrderItem;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemResponse {

    private UUID id;
    private String productName;
    private String size;
    private String color;
    private Integer quantity;
    private BigDecimal unitPrice;

    public static OrderItemResponse from(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.id = item.getId();
        response.productName = item.getProductName();
        response.size = item.getSize();
        response.color = item.getColor();
        response.quantity = item.getQuantity();
        response.unitPrice = item.getUnitPrice();
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}