package com.clothingstore.api.controller;

import com.clothingstore.api.dto.ProductDetailResponse;
import com.clothingstore.api.dto.ProductListItemResponse;
import com.clothingstore.api.entity.Product;
import com.clothingstore.api.entity.ProductImage;
import com.clothingstore.api.entity.ProductVariant;
import com.clothingstore.api.repository.ProductImageRepository;
import com.clothingstore.api.repository.ProductRepository;
import com.clothingstore.api.repository.ProductVariantRepository;
import com.clothingstore.api.spec.ProductSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private ProductVariantRepository variantRepository;

    @GetMapping
    public List<ProductListItemResponse> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "name") String sort,
            @RequestParam(required = false, defaultValue = "asc") String direction
    ) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.isActive())
                .and(ProductSpecification.hasCategorySlug(category))
                .and(ProductSpecification.minPrice(minPrice))
                .and(ProductSpecification.maxPrice(maxPrice));

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Sort sortBy = Sort.by(sortDirection, mapSortField(sort));

        List<Product> products = productRepository.findAll(spec, sortBy);

        return products.stream()
                .map(product -> {
                    List<String> imageUrls = productImageRepository.findByProductIdOrderByDisplayOrder(product.getId())
                            .stream()
                            .map(img -> img.getUrl())
                            .collect(Collectors.toList());
                    return ProductListItemResponse.from(product, imageUrls);
                })
                .collect(Collectors.toList());
    }

    @Autowired private ProductImageRepository productImageRepository;

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDetailResponse> getProductBySlug(@PathVariable String slug) {
        return productRepository.findBySlug(slug)
                .map(product -> {
                    List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
                    List<ProductImage> images = productImageRepository.findByProductIdOrderByDisplayOrder(product.getId());
                    return ResponseEntity.ok(ProductDetailResponse.from(product, variants, images));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private String mapSortField(String sort) {
        return switch (sort) {
            case "price" -> "basePrice";
            case "name" -> "name";
            case "newest" -> "createdAt";
            default -> "name";
        };
    }

}