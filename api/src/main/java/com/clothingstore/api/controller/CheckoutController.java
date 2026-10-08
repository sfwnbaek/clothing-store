package com.clothingstore.api.controller;

import com.clothingstore.api.dto.CheckoutRequest;
import com.clothingstore.api.dto.CheckoutResponse;
import com.clothingstore.api.dto.OrderResponse;
import com.clothingstore.api.entity.User;
import com.clothingstore.api.repository.OrderRepository;
import com.clothingstore.api.repository.UserRepository;
import com.clothingstore.api.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CheckoutController {

    @Autowired private CheckoutService checkoutService;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;

    @PostMapping("/checkout")
public ResponseEntity<?> checkout(Authentication auth, @Valid @RequestBody CheckoutRequest request) {
    User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

    try {
        CheckoutService.CheckoutResult result = checkoutService.checkout(user, request);
        CheckoutResponse response = new CheckoutResponse(
                OrderResponse.from(result.getOrder()),
                result.getClientSecret()
            );
            return ResponseEntity.ok(response);
        } catch (ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.status(409).body("One or more items in your cart just sold out. Please review your cart.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/orders/{id}/confirm-payment")
    public ResponseEntity<?> confirmPayment(Authentication auth, @PathVariable UUID id) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Find the order
        com.clothingstore.api.entity.Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // 2. Security check: make sure the logged-in user actually owns this order
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        // 3. Update the status!
        order.setStatus("PROCESSING"); // or "PAID", depending on what you use
        orderRepository.save(order);

        return ResponseEntity.ok(OrderResponse.from(order));
    }

    @GetMapping("/orders")
    public List<OrderResponse> getMyOrders(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(OrderResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrder(Authentication auth, @PathVariable UUID id) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findById(id)
                .filter(order -> order.getUser().getId().equals(user.getId()))
                .map(order -> ResponseEntity.ok(OrderResponse.from(order)))
                .orElse(ResponseEntity.notFound().build());
    }

}