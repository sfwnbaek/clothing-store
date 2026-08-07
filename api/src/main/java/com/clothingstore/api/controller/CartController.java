package com.clothingstore.api.controller;

import com.clothingstore.api.dto.AddCartItemRequest;
import com.clothingstore.api.dto.CartResponse;
import com.clothingstore.api.dto.UpdateCartItemRequest;
import com.clothingstore.api.entity.*;
import com.clothingstore.api.repository.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductVariantRepository variantRepository;

    @GetMapping
    public CartResponse getCart(Authentication auth) {
        return CartResponse.from(getOrCreateCart(auth));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(Authentication auth, @Valid @RequestBody AddCartItemRequest request) {
        Cart cart = getOrCreateCart(auth);

        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new RuntimeException("Variant not found"));

        var existing = cartItemRepository.findByCartIdAndVariantId(cart.getId(), variant.getId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setVariant(variant);
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
        }

        Cart refreshed = cartRepository.findById(cart.getId()).orElseThrow();
        return ResponseEntity.ok(CartResponse.from(refreshed));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(Authentication auth, @PathVariable UUID itemId, @Valid @RequestBody UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(auth);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            return ResponseEntity.status(403).build();
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        Cart refreshed = cartRepository.findById(cart.getId()).orElseThrow();
        return ResponseEntity.ok(CartResponse.from(refreshed));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(Authentication auth, @PathVariable UUID itemId) {
        Cart cart = getOrCreateCart(auth);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            return ResponseEntity.status(403).build();
        }

        cartItemRepository.delete(item);

        Cart refreshed = cartRepository.findById(cart.getId()).orElseThrow();
        return ResponseEntity.ok(CartResponse.from(refreshed));
    }

    private Cart getOrCreateCart(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

}