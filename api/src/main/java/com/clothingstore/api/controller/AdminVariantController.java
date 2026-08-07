package com.clothingstore.api.controller;

import com.clothingstore.api.dto.VariantRequest;
import com.clothingstore.api.entity.Product;
import com.clothingstore.api.entity.ProductVariant;
import com.clothingstore.api.repository.ProductRepository;
import com.clothingstore.api.repository.ProductVariantRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/variants")
public class AdminVariantController {

    @Autowired private ProductVariantRepository variantRepository;
    @Autowired private ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<ProductVariant> createVariant(@Valid @RequestBody VariantRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(request.getSku());
        variant.setSize(request.getSize());
        variant.setColor(request.getColor());
        variant.setStockQty(request.getStockQty());
        variant.setPriceOverride(request.getPriceOverride());

        return ResponseEntity.ok(variantRepository.save(variant));
    }

    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductVariant> updateStock(@PathVariable UUID id, @RequestParam Integer stockQty) {
        return variantRepository.findById(id)
                .map(variant -> {
                    variant.setStockQty(stockQty);
                    return ResponseEntity.ok(variantRepository.save(variant));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariant(@PathVariable UUID id) {
        if (!variantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        variantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}