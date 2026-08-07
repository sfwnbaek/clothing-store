package com.clothingstore.api.controller;

import com.clothingstore.api.dto.ProductRequest;
import com.clothingstore.api.entity.Category;
import com.clothingstore.api.entity.Product;
import com.clothingstore.api.repository.CategoryRepository;
import com.clothingstore.api.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return productRepository.findById(id)
                .map(product -> {
                    applyRequest(product, request);
                    return ResponseEntity.ok(productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setBasePrice(request.getBasePrice());
        product.setBrand(request.getBrand());
        product.setActive(request.isActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(category);
        }
    }

}