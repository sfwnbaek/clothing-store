package com.clothingstore.api.dto;

import com.clothingstore.api.entity.Cart;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class CartResponse {

    private UUID id;
    private List<CartItemResponse> items;

    public static CartResponse from(Cart cart) {
        CartResponse response = new CartResponse();
        response.id = cart.getId();
        response.items = cart.getItems().stream()
                .map(CartItemResponse::from)
                .collect(Collectors.toList());
        return response;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
}