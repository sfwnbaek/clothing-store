package com.clothingstore.api.dto;

public class CheckoutResponse {

    private OrderResponse order;
    private String clientSecret;

    public CheckoutResponse(OrderResponse order, String clientSecret) {
        this.order = order;
        this.clientSecret = clientSecret;
    }

    public OrderResponse getOrder() { return order; }
    public void setOrder(OrderResponse order) { this.order = order; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
}