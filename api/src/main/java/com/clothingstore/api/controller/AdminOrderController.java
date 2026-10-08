package com.clothingstore.api.controller;

import com.clothingstore.api.dto.OrderResponse;
import com.clothingstore.api.entity.Order;
import com.clothingstore.api.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;

    // Return OrderResponse to prevent Spring Boot infinite recursion crashes!
    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload
    ) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        
        order.setStatus(payload.get("status")); 
        
        return ResponseEntity.ok(OrderResponse.from(orderRepository.save(order)));
    }
}